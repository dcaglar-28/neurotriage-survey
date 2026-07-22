import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AnswerValue,
  BranchRule,
  InterviewSession,
  Question,
  QuestionOption,
  QuestionType,
  ResponseRecord,
  ResultsOverview,
  Section,
  Template,
  TemplateStatus,
  TemplateSummary,
} from "@/lib/types";
import { generateToken, slugify } from "@/lib/utils";

function now() {
  return new Date().toISOString();
}

function mapOption(row: Record<string, unknown>): QuestionOption {
  return {
    id: row.id as string,
    questionId: row.question_id as string,
    label: row.label as string,
    value: row.value as string,
    orderIndex: row.order_index as number,
  };
}

function mapQuestion(
  row: Record<string, unknown>,
  options: QuestionOption[]
): Question {
  return {
    id: row.id as string,
    templateId: row.template_id as string,
    sectionId: (row.section_id as string | null) ?? null,
    key: row.key as string,
    type: row.type as QuestionType,
    title: row.title as string,
    description: (row.description as string | null) ?? null,
    required: Boolean(row.required),
    orderIndex: row.order_index as number,
    config: (row.config as Question["config"]) ?? {},
    repeatSourceQuestionId:
      (row.repeat_source_question_id as string | null) ?? null,
    options,
  };
}

function mapSection(row: Record<string, unknown>): Section {
  return {
    id: row.id as string,
    templateId: row.template_id as string,
    title: row.title as string,
    description: (row.description as string | null) ?? null,
    orderIndex: row.order_index as number,
  };
}

function mapBranch(row: Record<string, unknown>): BranchRule {
  return {
    id: row.id as string,
    templateId: row.template_id as string,
    sourceQuestionId: row.source_question_id as string,
    operator: row.operator as BranchRule["operator"],
    value: (row.value as string | null) ?? null,
    targetQuestionId: (row.target_question_id as string | null) ?? null,
    action: row.action as BranchRule["action"],
    priority: row.priority as number,
  };
}

function mapResponse(row: Record<string, unknown>): ResponseRecord {
  const instanceKey = row.instance_key as string | null;
  return {
    id: row.id as string,
    sessionId: row.session_id as string,
    questionId: row.question_id as string,
    instanceKey: !instanceKey ? null : instanceKey,
    value: row.value as AnswerValue,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapSession(
  row: Record<string, unknown>,
  responses: ResponseRecord[] = []
): InterviewSession {
  return {
    id: row.id as string,
    templateId: row.template_id as string,
    respondentToken: row.respondent_token as string,
    status: row.status as InterviewSession["status"],
    currentQuestionKey: (row.current_question_key as string | null) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    startedAt: row.started_at as string,
    completedAt: (row.completed_at as string | null) ?? null,
    lastSavedAt: row.last_saved_at as string,
    responses,
  };
}

async function hydrateTemplate(templateId: string): Promise<Template | null> {
  const supabase = createAdminClient();

  const { data: t, error } = await supabase
    .from("templates")
    .select("*")
    .eq("id", templateId)
    .maybeSingle();
  if (error) throw error;
  if (!t) return null;

  const [{ data: sections }, { data: questions }, { data: rules }] =
    await Promise.all([
      supabase
        .from("sections")
        .select("*")
        .eq("template_id", templateId)
        .order("order_index"),
      supabase
        .from("questions")
        .select("*")
        .eq("template_id", templateId)
        .order("order_index"),
      supabase
        .from("branch_rules")
        .select("*")
        .eq("template_id", templateId)
        .order("priority", { ascending: false }),
    ]);

  const questionIds = (questions ?? []).map((q) => q.id as string);
  let options: QuestionOption[] = [];
  if (questionIds.length) {
    const { data: optionRows } = await supabase
      .from("question_options")
      .select("*")
      .in("question_id", questionIds)
      .order("order_index");
    options = (optionRows ?? []).map(mapOption);
  }

  const optionsByQuestion = new Map<string, QuestionOption[]>();
  for (const opt of options) {
    const list = optionsByQuestion.get(opt.questionId) ?? [];
    list.push(opt);
    optionsByQuestion.set(opt.questionId, list);
  }

  return {
    id: t.id,
    title: t.title,
    description: t.description,
    slug: t.slug,
    status: t.status,
    thankYouMessage: t.thank_you_message,
    createdBy: t.created_by,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
    sections: (sections ?? []).map(mapSection),
    questions: (questions ?? []).map((q) =>
      mapQuestion(q, optionsByQuestion.get(q.id as string) ?? [])
    ),
    branchRules: (rules ?? []).map(mapBranch),
  };
}

async function loadSessionResponses(
  sessionId: string
): Promise<ResponseRecord[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("responses")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at");
  if (error) throw error;
  return (data ?? []).map(mapResponse);
}

export async function listTemplates(): Promise<TemplateSummary[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("templates")
    .select("id, title, description, slug, status, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;

  const summaries: TemplateSummary[] = [];
  for (const t of data ?? []) {
    const { count } = await supabase
      .from("questions")
      .select("id", { count: "exact", head: true })
      .eq("template_id", t.id)
      .is("repeat_source_question_id", null);
    summaries.push({
      id: t.id,
      title: t.title,
      description: t.description,
      slug: t.slug,
      status: t.status as TemplateStatus,
      questionCount: count ?? 0,
      updatedAt: t.updated_at,
    });
  }
  return summaries;
}

export async function getTemplateBySlug(slug: string): Promise<Template | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("templates")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return hydrateTemplate(data.id);
}

export async function getTemplateById(id: string): Promise<Template | null> {
  return hydrateTemplate(id);
}

export async function createTemplate(input: {
  title: string;
  description?: string;
  slug?: string;
}): Promise<Template> {
  const supabase = createAdminClient();
  const stamp = now();
  const { data, error } = await supabase
    .from("templates")
    .insert({
      title: input.title,
      description: input.description ?? null,
      slug: input.slug ?? slugify(input.title),
      status: "draft",
      thank_you_message: "Thank you for completing this interview.",
      created_at: stamp,
      updated_at: stamp,
    })
    .select("*")
    .single();
  if (error) throw error;
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    slug: data.slug,
    status: data.status,
    thankYouMessage: data.thank_you_message,
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    sections: [],
    questions: [],
    branchRules: [],
  };
}

async function replaceTemplateChildren(template: Template): Promise<void> {
  const supabase = createAdminClient();
  const templateId = template.id;

  // Delete children (cascade would work if we deleted template; here we replace)
  await supabase.from("branch_rules").delete().eq("template_id", templateId);
  await supabase.from("questions").delete().eq("template_id", templateId);
  await supabase.from("sections").delete().eq("template_id", templateId);

  if (template.sections.length) {
    const { error } = await supabase.from("sections").insert(
      template.sections.map((s) => ({
        id: s.id,
        template_id: templateId,
        title: s.title,
        description: s.description,
        order_index: s.orderIndex,
      }))
    );
    if (error) throw error;
  }

  // Insert non-repeat questions first, then repeats (FK on repeat_source)
  const base = template.questions.filter((q) => !q.repeatSourceQuestionId);
  const repeats = template.questions.filter((q) => q.repeatSourceQuestionId);

  async function insertQuestions(list: Question[]) {
    if (!list.length) return;
    const { error } = await supabase.from("questions").insert(
      list.map((q) => ({
        id: q.id,
        template_id: templateId,
        section_id: q.sectionId,
        key: q.key,
        type: q.type,
        title: q.title,
        description: q.description,
        required: q.required,
        order_index: q.orderIndex,
        config: q.config,
        repeat_source_question_id: q.repeatSourceQuestionId,
      }))
    );
    if (error) throw error;

    const allOptions = list.flatMap((q) =>
      q.options.map((o) => ({
        id: o.id,
        question_id: q.id,
        label: o.label,
        value: o.value,
        order_index: o.orderIndex,
      }))
    );
    if (allOptions.length) {
      const { error: optErr } = await supabase
        .from("question_options")
        .insert(allOptions);
      if (optErr) throw optErr;
    }
  }

  await insertQuestions(base);
  await insertQuestions(repeats);

  if (template.branchRules.length) {
    const { error } = await supabase.from("branch_rules").insert(
      template.branchRules.map((r) => ({
        id: r.id,
        template_id: templateId,
        source_question_id: r.sourceQuestionId,
        operator: r.operator,
        value: r.value,
        target_question_id: r.targetQuestionId,
        action: r.action,
        priority: r.priority,
      }))
    );
    if (error) throw error;
  }
}

export async function updateTemplate(
  id: string,
  patch: Partial<Template>
): Promise<Template | null> {
  const supabase = createAdminClient();
  const existing = await hydrateTemplate(id);
  if (!existing) return null;

  const next: Template = {
    ...existing,
    ...patch,
    id,
    updatedAt: now(),
  };

  const { error } = await supabase
    .from("templates")
    .update({
      title: next.title,
      description: next.description,
      slug: next.slug,
      status: next.status,
      thank_you_message: next.thankYouMessage,
      updated_at: next.updatedAt,
    })
    .eq("id", id);
  if (error) throw error;

  if (
    patch.sections !== undefined ||
    patch.questions !== undefined ||
    patch.branchRules !== undefined
  ) {
    await replaceTemplateChildren(next);
  }

  return hydrateTemplate(id);
}

export async function setTemplateStatus(
  id: string,
  status: TemplateStatus
): Promise<Template | null> {
  return updateTemplate(id, { status });
}

export async function duplicateTemplate(id: string): Promise<Template | null> {
  const source = await hydrateTemplate(id);
  if (!source) return null;

  const stamp = now();
  const newTemplateId = crypto.randomUUID();
  const sectionMap = new Map<string, string>();
  const questionMap = new Map<string, string>();

  for (const s of source.sections) sectionMap.set(s.id, crypto.randomUUID());
  for (const q of source.questions) questionMap.set(q.id, crypto.randomUUID());

  const clone: Template = {
    ...source,
    id: newTemplateId,
    title: `${source.title} (Copy)`,
    slug: `${source.slug}-copy-${Date.now().toString(36)}`,
    status: "draft",
    createdAt: stamp,
    updatedAt: stamp,
    sections: source.sections.map((s) => ({
      ...s,
      id: sectionMap.get(s.id)!,
      templateId: newTemplateId,
    })),
    questions: source.questions.map((q) => {
      const newQid = questionMap.get(q.id)!;
      return {
        ...q,
        id: newQid,
        templateId: newTemplateId,
        sectionId: q.sectionId ? (sectionMap.get(q.sectionId) ?? null) : null,
        repeatSourceQuestionId: q.repeatSourceQuestionId
          ? (questionMap.get(q.repeatSourceQuestionId) ?? null)
          : null,
        options: q.options.map((o) => ({
          ...o,
          id: crypto.randomUUID(),
          questionId: newQid,
        })),
      };
    }),
    branchRules: source.branchRules.map((r) => ({
      ...r,
      id: crypto.randomUUID(),
      templateId: newTemplateId,
      sourceQuestionId: questionMap.get(r.sourceQuestionId) ?? r.sourceQuestionId,
      targetQuestionId: r.targetQuestionId
        ? (questionMap.get(r.targetQuestionId) ?? null)
        : null,
    })),
  };

  const supabase = createAdminClient();
  const { error } = await supabase.from("templates").insert({
    id: clone.id,
    title: clone.title,
    description: clone.description,
    slug: clone.slug,
    status: clone.status,
    thank_you_message: clone.thankYouMessage,
    created_at: stamp,
    updated_at: stamp,
  });
  if (error) throw error;
  await replaceTemplateChildren(clone);
  return hydrateTemplate(newTemplateId);
}

export async function deleteTemplate(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { error, count } = await supabase
    .from("templates")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function startSession(
  templateId: string,
  existingToken?: string | null
): Promise<InterviewSession> {
  const supabase = createAdminClient();
  const template = await hydrateTemplate(templateId);
  if (!template) throw new Error("Template not found");

  if (existingToken) {
    const { data: existing } = await supabase
      .from("interview_sessions")
      .select("*")
      .eq("respondent_token", existingToken)
      .eq("template_id", templateId)
      .eq("status", "in_progress")
      .maybeSingle();
    if (existing) {
      const responses = await loadSessionResponses(existing.id);
      return mapSession(existing, responses);
    }
  }

  const stamp = now();
  const { data, error } = await supabase
    .from("interview_sessions")
    .insert({
      template_id: templateId,
      respondent_token: generateToken(28),
      status: "in_progress",
      current_question_key: template.questions[0]?.key ?? null,
      metadata: {},
      started_at: stamp,
      last_saved_at: stamp,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapSession(data, []);
}

export async function getSessionByToken(
  token: string
): Promise<InterviewSession | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("interview_sessions")
    .select("*")
    .eq("respondent_token", token)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const responses = await loadSessionResponses(data.id);
  return mapSession(data, responses);
}

export async function getSessionById(
  id: string
): Promise<InterviewSession | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("interview_sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const responses = await loadSessionResponses(data.id);
  return mapSession(data, responses);
}

export async function saveResponse(input: {
  sessionId: string;
  questionId: string;
  instanceKey?: string | null;
  value: AnswerValue;
  currentQuestionKey?: string | null;
}): Promise<InterviewSession> {
  const supabase = createAdminClient();
  const session = await getSessionById(input.sessionId);
  if (!session) throw new Error("Session not found");
  if (session.status === "completed") {
    throw new Error("Session already completed");
  }

  const stamp = now();
  const instanceKey = input.instanceKey ?? null;

  // Unique constraint treats NULL instance_key as distinct in Postgres —
  // use empty string sentinel for "no instance"
  const storedInstanceKey = instanceKey ?? "";

  const { error: upsertError } = await supabase.from("responses").upsert(
    {
      session_id: input.sessionId,
      question_id: input.questionId,
      instance_key: storedInstanceKey,
      value: input.value as never,
      updated_at: stamp,
    },
    { onConflict: "session_id,question_id,instance_key" }
  );
  if (upsertError) throw upsertError;

  const metadata = { ...session.metadata };
  const template = await hydrateTemplate(session.templateId);
  const question = template?.questions.find((q) => q.id === input.questionId);
  if (question?.key === "email" && typeof input.value === "string") {
    metadata.email = input.value.trim();
  }

  const { error: sessionError } = await supabase
    .from("interview_sessions")
    .update({
      last_saved_at: stamp,
      current_question_key:
        input.currentQuestionKey !== undefined
          ? input.currentQuestionKey
          : session.currentQuestionKey,
      metadata,
    })
    .eq("id", input.sessionId);
  if (sessionError) throw sessionError;

  return (await getSessionById(input.sessionId))!;
}

export async function completeSession(
  sessionId: string
): Promise<InterviewSession> {
  const supabase = createAdminClient();
  const stamp = now();
  const { error } = await supabase
    .from("interview_sessions")
    .update({
      status: "completed",
      completed_at: stamp,
      last_saved_at: stamp,
    })
    .eq("id", sessionId);
  if (error) throw error;
  const session = await getSessionById(sessionId);
  if (!session) throw new Error("Session not found");
  return session;
}

export async function getResultsOverview(filters?: {
  templateId?: string;
  role?: string;
}): Promise<ResultsOverview> {
  const supabase = createAdminClient();
  let query = supabase.from("interview_sessions").select("*");
  if (filters?.templateId) {
    query = query.eq("template_id", filters.templateId);
  }
  const { data: sessionRows, error } = await query.order("started_at", {
    ascending: false,
  });
  if (error) throw error;

  const sessions: InterviewSession[] = [];
  for (const row of sessionRows ?? []) {
    const responses = await loadSessionResponses(row.id);
    sessions.push(mapSession(row, responses));
  }

  const templates = await listTemplates();
  const templateTitle = new Map(templates.map((t) => [t.id, t.title]));

  const roleByTemplate = new Map<string, string>();
  for (const t of templates) {
    const full = await hydrateTemplate(t.id);
    const roleQ = full?.questions.find((q) => q.key === "role");
    if (roleQ) roleByTemplate.set(t.id, roleQ.id);
  }

  let filtered = sessions;
  if (filters?.role) {
    filtered = sessions.filter((s) => {
      const roleQId = roleByTemplate.get(s.templateId);
      if (!roleQId) return false;
      const response = s.responses.find((r) => r.questionId === roleQId);
      return response?.value === filters.role;
    });
  }

  const completed = filtered.filter((s) => s.status === "completed");
  const inProgress = filtered.filter((s) => s.status === "in_progress");
  const durations = completed
    .map((s) =>
      s.completedAt
        ? new Date(s.completedAt).getTime() - new Date(s.startedAt).getTime()
        : null
    )
    .filter((d): d is number => d !== null && d > 0);

  return {
    totalSessions: filtered.length,
    completedSessions: completed.length,
    inProgressSessions: inProgress.length,
    completionRate:
      filtered.length === 0
        ? 0
        : Math.round((completed.length / filtered.length) * 1000) / 10,
    averageCompletionMs:
      durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : null,
    sessions: filtered.map((s) => {
      const roleQId = roleByTemplate.get(s.templateId);
      const roleResponse = roleQId
        ? s.responses.find((r) => r.questionId === roleQId)
        : undefined;
      return {
        id: s.id,
        templateId: s.templateId,
        templateTitle: templateTitle.get(s.templateId) ?? "Unknown",
        status: s.status,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
        lastSavedAt: s.lastSavedAt,
        answeredCount: s.responses.length,
        durationMs: s.completedAt
          ? new Date(s.completedAt).getTime() - new Date(s.startedAt).getTime()
          : null,
        role:
          typeof roleResponse?.value === "string"
            ? roleResponse.value
            : undefined,
      };
    }),
  };
}

export async function getResponsesGroupedByQuestion(templateId: string) {
  const template = await hydrateTemplate(templateId);
  if (!template) return [];

  const overview = await getResultsOverview({ templateId });
  const sessionStatus = new Map(
    overview.sessions.map((s) => [s.id, s.status] as const)
  );
  const sessionIds = overview.sessions.map((s) => s.id);

  const supabase = createAdminClient();
  const { data: responseRows } = await supabase
    .from("responses")
    .select("*")
    .in(
      "session_id",
      sessionIds.length
        ? sessionIds
        : ["00000000-0000-0000-0000-000000000000"]
    );

  const byQuestion = (responseRows ?? []).map(mapResponse);

  return template.questions
    .filter((q) => !q.repeatSourceQuestionId)
    .map((question) => ({
      question,
      answers: byQuestion
        .filter((r) => r.questionId === question.id)
        .map((r) => ({
          sessionId: r.sessionId,
          instanceKey: r.instanceKey === "" ? null : r.instanceKey,
          value: r.value,
          status: sessionStatus.get(r.sessionId) ?? ("in_progress" as const),
        })),
    }));
}

export async function exportSessionsCsv(filters?: {
  templateId?: string;
  role?: string;
}): Promise<string> {
  const overview = await getResultsOverview(filters);
  const templateIds = filters?.templateId
    ? [filters.templateId]
    : [...new Set(overview.sessions.map((s) => s.templateId))];

  const rows: string[][] = [
    [
      "session_id",
      "template",
      "status",
      "started_at",
      "completed_at",
      "question_key",
      "instance_key",
      "answer",
    ],
  ];

  for (const templateId of templateIds) {
    const template = await hydrateTemplate(templateId);
    if (!template) continue;
    const qById = new Map(template.questions.map((q) => [q.id, q]));
    for (const summary of overview.sessions.filter(
      (s) => s.templateId === templateId
    )) {
      const session = await getSessionById(summary.id);
      if (!session) continue;
      for (const response of session.responses) {
        const question = qById.get(response.questionId);
        rows.push([
          session.id,
          template.title,
          session.status,
          session.startedAt,
          session.completedAt ?? "",
          question?.key ?? response.questionId,
          response.instanceKey ?? "",
          Array.isArray(response.value)
            ? response.value.join("; ")
            : String(response.value ?? ""),
        ]);
      }
    }
  }

  return rows
    .map((row) =>
      row
        .map((cell) => {
          const s = String(cell);
          if (s.includes(",") || s.includes('"') || s.includes("\n")) {
            return `"${s.replace(/"/g, '""')}"`;
          }
          return s;
        })
        .join(",")
    )
    .join("\n");
}

/** Upsert the seeded NeuroTriage template into Supabase */
export async function seedSupabaseTemplate(template: Template): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("templates").upsert({
    id: template.id,
    title: template.title,
    description: template.description,
    slug: template.slug,
    status: template.status,
    thank_you_message: template.thankYouMessage,
    created_at: template.createdAt,
    updated_at: template.updatedAt,
  });
  if (error) throw error;
  await replaceTemplateChildren(template);
}

export async function resetStoreToSeed(): Promise<void> {
  throw new Error("Use npm run seed:supabase to reset the NeuroTriage template in Supabase.");
}
