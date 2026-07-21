import type {
  AnswerValue,
  BranchRule,
  Question,
  QuestionOption,
  RuntimeQuestion,
  Section,
  Template,
} from "../types";

function answerMatches(
  answer: AnswerValue,
  operator: BranchRule["operator"],
  ruleValue: string | null
): boolean {
  const isEmpty =
    answer === null ||
    answer === undefined ||
    answer === "" ||
    (Array.isArray(answer) && answer.length === 0);

  switch (operator) {
    case "is_empty":
      return isEmpty;
    case "is_answered":
      return !isEmpty;
    case "equals":
      if (Array.isArray(answer)) return answer.includes(ruleValue ?? "");
      return String(answer) === String(ruleValue);
    case "not_equals":
      if (Array.isArray(answer)) return !answer.includes(ruleValue ?? "");
      return String(answer) !== String(ruleValue);
    case "contains":
      if (Array.isArray(answer)) return answer.includes(ruleValue ?? "");
      return String(answer ?? "").includes(ruleValue ?? "");
    case "not_contains":
      if (Array.isArray(answer)) return !answer.includes(ruleValue ?? "");
      return !String(answer ?? "").includes(ruleValue ?? "");
    default:
      return false;
  }
}

export function getAnswerMap(
  responses: Array<{
    questionId: string;
    instanceKey: string | null;
    value: AnswerValue;
  }>,
  questions: Question[]
): Map<string, AnswerValue> {
  const byId = new Map(questions.map((q) => [q.id, q]));
  const map = new Map<string, AnswerValue>();

  for (const response of responses) {
    const question = byId.get(response.questionId);
    if (!question) continue;
    const key = response.instanceKey
      ? `${question.key}::${response.instanceKey}`
      : question.key;
    map.set(key, response.value);
    if (!response.instanceKey) {
      map.set(question.key, response.value);
    }
  }
  return map;
}

function resolveDynamicOptions(
  question: Question,
  answers: Map<string, AnswerValue>,
  allQuestions: Question[]
): QuestionOption[] {
  const sourceKey = question.config.optionsFromQuestionKey;
  if (!sourceKey) return question.options;

  const selected = answers.get(sourceKey);
  const values = Array.isArray(selected)
    ? selected
    : selected
      ? [String(selected)]
      : [];

  const sourceQuestion = allQuestions.find((q) => q.key === sourceKey);
  const labelByValue = new Map(
    (sourceQuestion?.options ?? []).map((o) => [o.value, o.label])
  );

  return values.map((value, index) => ({
    id: `dyn-${question.id}-${value}`,
    questionId: question.id,
    label: labelByValue.get(value) ?? value,
    value,
    orderIndex: index,
  }));
}

function computeVisibility(
  template: Template,
  answers: Map<string, AnswerValue>
): { hidden: Set<string>; endAfterQuestionId: string | null } {
  const questionsById = new Map(template.questions.map((q) => [q.id, q]));
  const hidden = new Set<string>();
  let endAfterQuestionId: string | null = null;

  // Questions with any "show" rule targeting them start hidden
  for (const rule of template.branchRules) {
    if (rule.action === "show" && rule.targetQuestionId) {
      hidden.add(rule.targetQuestionId);
    }
  }

  const rules = [...template.branchRules].sort(
    (a, b) => b.priority - a.priority
  );

  for (const rule of rules) {
    const source = questionsById.get(rule.sourceQuestionId);
    if (!source) continue;
    const answer = answers.get(source.key);
    if (!answerMatches(answer, rule.operator, rule.value)) continue;

    if (rule.action === "hide" && rule.targetQuestionId) {
      hidden.add(rule.targetQuestionId);
    }
    if (rule.action === "show" && rule.targetQuestionId) {
      hidden.delete(rule.targetQuestionId);
    }
    if (rule.action === "end") {
      endAfterQuestionId = rule.sourceQuestionId;
    }
    if (rule.action === "goto" && rule.targetQuestionId) {
      const target = questionsById.get(rule.targetQuestionId);
      if (target && source) {
        for (const q of template.questions) {
          if (
            !q.repeatSourceQuestionId &&
            q.orderIndex > source.orderIndex &&
            q.orderIndex < target.orderIndex
          ) {
            hidden.add(q.id);
          }
        }
      }
    }
  }

  return { hidden, endAfterQuestionId };
}

/**
 * Expand template questions into a linear runtime path based on answers so far.
 * Handles order, branch hide/show/goto/end, and repeat-for-selected-option loops.
 */
export function buildRuntimePath(
  template: Template,
  answers: Map<string, AnswerValue>
): RuntimeQuestion[] {
  const sectionsById = new Map(
    template.sections.map((s) => [s.id, s] as [string, Section])
  );
  const questions = [...template.questions].sort(
    (a, b) => a.orderIndex - b.orderIndex
  );
  const { hidden, endAfterQuestionId } = computeVisibility(template, answers);

  const baseQuestions = questions.filter((q) => !q.repeatSourceQuestionId);
  const repeatsBySource = new Map<string, Question[]>();
  for (const q of questions) {
    if (!q.repeatSourceQuestionId) continue;
    const list = repeatsBySource.get(q.repeatSourceQuestionId) ?? [];
    list.push(q);
    repeatsBySource.set(q.repeatSourceQuestionId, list);
  }

  const path: RuntimeQuestion[] = [];

  for (const question of baseQuestions) {
    if (hidden.has(question.id)) continue;

    const section = question.sectionId
      ? (sectionsById.get(question.sectionId) ?? null)
      : null;

    path.push({
      runtimeId: question.key,
      question,
      instanceKey: null,
      instanceLabel: null,
      title: question.title,
      options: resolveDynamicOptions(question, answers, questions),
      section,
    });

    const answer = answers.get(question.key);
    const repeatChildren = (repeatsBySource.get(question.id) ?? []).filter(
      (c) => !hidden.has(c.id)
    );

    if (repeatChildren.length && Array.isArray(answer) && answer.length) {
      const optionLabels = new Map(
        question.options.map((o) => [o.value, o.label])
      );
      for (const optionValue of answer) {
        for (const child of [...repeatChildren].sort(
          (a, b) => a.orderIndex - b.orderIndex
        )) {
          const label = optionLabels.get(optionValue) ?? optionValue;
          const title =
            child.config.instanceLabelTemplate?.replace(
              "{{option}}",
              label
            ) ?? `${child.title} (${label})`;
          path.push({
            runtimeId: `${child.key}::${optionValue}`,
            question: child,
            instanceKey: optionValue,
            instanceLabel: label,
            title,
            options: child.options,
            section: child.sectionId
              ? (sectionsById.get(child.sectionId) ?? null)
              : null,
          });
        }
      }
    }

    if (endAfterQuestionId === question.id) break;
  }

  return path;
}

export function getVisibleQuestions(
  template: Template,
  answers: Map<string, AnswerValue>
): RuntimeQuestion[] {
  return buildRuntimePath(template, answers);
}

export function isAnswerValid(
  question: Question,
  value: AnswerValue
): boolean {
  if (!question.required) {
    if (value === null || value === undefined || value === "") return true;
    if (Array.isArray(value) && value.length === 0) return true;
  }

  switch (question.type) {
    case "short_text": {
      if (typeof value !== "string" || value.trim().length === 0) return false;
      if (question.config.inputType === "email") {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
      }
      return true;
    }
    case "long_text":
    case "dropdown":
    case "multiple_choice":
      return typeof value === "string" && value.trim().length > 0;
    case "yes_no":
      return (
        value === "yes" ||
        value === "no" ||
        value === true ||
        value === false
      );
    case "multiple_select":
      return Array.isArray(value) && value.length > 0;
    case "rating": {
      const max = question.config.ratingMax ?? 5;
      const n = typeof value === "number" ? value : Number(value);
      return Number.isFinite(n) && n >= 1 && n <= max;
    }
    default:
      return false;
  }
}

export function normalizeYesNo(value: AnswerValue): "yes" | "no" | null {
  if (value === true || value === "yes" || value === "Yes") return "yes";
  if (value === false || value === "no" || value === "No") return "no";
  return null;
}
