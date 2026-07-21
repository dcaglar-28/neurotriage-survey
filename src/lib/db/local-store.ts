import { promises as fs } from "fs";
import path from "path";
import { SEED_TEMPLATES } from "@/data/seed-prehospital";
import type {
  AnswerValue,
  InterviewSession,
  ResponseRecord,
  ResultsOverview,
  Template,
  TemplateStatus,
  TemplateSummary,
} from "@/lib/types";
import { generateToken, slugify } from "@/lib/utils";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

interface StoreData {
  templates: Template[];
  sessions: InterviewSession[];
}

async function ensureStore(): Promise<StoreData> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const store = JSON.parse(raw) as StoreData;

    // Keep the seeded NeuroTriage template definition up to date
    for (const seed of SEED_TEMPLATES) {
      const index = store.templates.findIndex((t) => t.id === seed.id);
      if (index === -1) {
        store.templates.unshift(structuredClone(seed));
        continue;
      }
      const existing = store.templates[index];
      store.templates[index] = {
        ...structuredClone(seed),
        status: existing.status,
        createdAt: existing.createdAt,
        updatedAt: now(),
      };
    }
    await saveStore(store);
    return store;
  } catch {
    const initial: StoreData = {
      templates: structuredClone(SEED_TEMPLATES),
      sessions: [],
    };
    await fs.writeFile(STORE_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
}

async function saveStore(data: StoreData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(data, null, 2));
}

function now() {
  return new Date().toISOString();
}

function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export async function listTemplates(): Promise<TemplateSummary[]> {
  const store = await ensureStore();
  return store.templates.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    slug: t.slug,
    status: t.status,
    questionCount: t.questions.filter((q) => !q.repeatSourceQuestionId).length,
    updatedAt: t.updatedAt,
  }));
}

export async function getTemplateBySlug(slug: string): Promise<Template | null> {
  const store = await ensureStore();
  return store.templates.find((t) => t.slug === slug) ?? null;
}

export async function getTemplateById(id: string): Promise<Template | null> {
  const store = await ensureStore();
  return store.templates.find((t) => t.id === id) ?? null;
}

export async function createTemplate(input: {
  title: string;
  description?: string;
  slug?: string;
}): Promise<Template> {
  const store = await ensureStore();
  const stamp = now();
  const template: Template = {
    id: newId("tmpl"),
    title: input.title,
    description: input.description ?? null,
    slug: input.slug ?? slugify(input.title),
    status: "draft",
    thankYouMessage: "Thank you for completing this interview.",
    createdBy: null,
    createdAt: stamp,
    updatedAt: stamp,
    sections: [],
    questions: [],
    branchRules: [],
  };
  store.templates.push(template);
  await saveStore(store);
  return template;
}

export async function updateTemplate(
  id: string,
  patch: Partial<Template>
): Promise<Template | null> {
  const store = await ensureStore();
  const index = store.templates.findIndex((t) => t.id === id);
  if (index === -1) return null;
  store.templates[index] = {
    ...store.templates[index],
    ...patch,
    id: store.templates[index].id,
    updatedAt: now(),
  };
  await saveStore(store);
  return store.templates[index];
}

export async function setTemplateStatus(
  id: string,
  status: TemplateStatus
): Promise<Template | null> {
  return updateTemplate(id, { status });
}

export async function duplicateTemplate(id: string): Promise<Template | null> {
  const store = await ensureStore();
  const source = store.templates.find((t) => t.id === id);
  if (!source) return null;

  const stamp = now();
  const newTemplateId = newId("tmpl");
  const sectionMap = new Map<string, string>();
  const questionMap = new Map<string, string>();

  const sections = source.sections.map((s) => {
    const newSectionId = newId("sect");
    sectionMap.set(s.id, newSectionId);
    return { ...s, id: newSectionId, templateId: newTemplateId };
  });

  // First pass: new question IDs
  for (const q of source.questions) {
    questionMap.set(q.id, newId("ques"));
  }

  const questions = source.questions.map((q) => {
    const newQuestionId = questionMap.get(q.id)!;
    return {
      ...q,
      id: newQuestionId,
      templateId: newTemplateId,
      sectionId: q.sectionId ? (sectionMap.get(q.sectionId) ?? null) : null,
      repeatSourceQuestionId: q.repeatSourceQuestionId
        ? (questionMap.get(q.repeatSourceQuestionId) ?? null)
        : null,
      options: q.options.map((o, i) => ({
        ...o,
        id: `${newQuestionId}-opt-${i}`,
        questionId: newQuestionId,
      })),
    };
  });

  const branchRules = source.branchRules.map((r) => ({
    ...r,
    id: newId("rule"),
    templateId: newTemplateId,
    sourceQuestionId: questionMap.get(r.sourceQuestionId) ?? r.sourceQuestionId,
    targetQuestionId: r.targetQuestionId
      ? (questionMap.get(r.targetQuestionId) ?? null)
      : null,
  }));

  const clone: Template = {
    ...source,
    id: newTemplateId,
    title: `${source.title} (Copy)`,
    slug: `${source.slug}-copy-${Date.now().toString(36)}`,
    status: "draft",
    createdAt: stamp,
    updatedAt: stamp,
    sections,
    questions,
    branchRules,
  };

  store.templates.push(clone);
  await saveStore(store);
  return clone;
}

export async function deleteTemplate(id: string): Promise<boolean> {
  const store = await ensureStore();
  const before = store.templates.length;
  store.templates = store.templates.filter((t) => t.id !== id);
  store.sessions = store.sessions.filter((s) => s.templateId !== id);
  if (store.templates.length === before) return false;
  await saveStore(store);
  return true;
}

export async function startSession(
  templateId: string,
  existingToken?: string | null
): Promise<InterviewSession> {
  const store = await ensureStore();
  const template = store.templates.find((t) => t.id === templateId);
  if (!template) throw new Error("Template not found");

  if (existingToken) {
    const existing = store.sessions.find(
      (s) =>
        s.respondentToken === existingToken &&
        s.templateId === templateId &&
        s.status === "in_progress"
    );
    if (existing) return existing;
  }

  const session: InterviewSession = {
    id: newId("sess"),
    templateId,
    respondentToken: generateToken(28),
    status: "in_progress",
    currentQuestionKey: template.questions[0]?.key ?? null,
    metadata: {},
    startedAt: now(),
    completedAt: null,
    lastSavedAt: now(),
    responses: [],
  };
  store.sessions.push(session);
  await saveStore(store);
  return session;
}

export async function getSessionByToken(
  token: string
): Promise<InterviewSession | null> {
  const store = await ensureStore();
  return store.sessions.find((s) => s.respondentToken === token) ?? null;
}

export async function getSessionById(
  id: string
): Promise<InterviewSession | null> {
  const store = await ensureStore();
  return store.sessions.find((s) => s.id === id) ?? null;
}

export async function saveResponse(input: {
  sessionId: string;
  questionId: string;
  instanceKey?: string | null;
  value: AnswerValue;
  currentQuestionKey?: string | null;
}): Promise<InterviewSession> {
  const store = await ensureStore();
  const session = store.sessions.find((s) => s.id === input.sessionId);
  if (!session) throw new Error("Session not found");
  if (session.status === "completed") throw new Error("Session already completed");

  const instanceKey = input.instanceKey ?? null;
  const existing = session.responses.find(
    (r) =>
      r.questionId === input.questionId &&
      (r.instanceKey ?? null) === instanceKey
  );

  const stamp = now();
  if (existing) {
    existing.value = input.value;
    existing.updatedAt = stamp;
  } else {
    const record: ResponseRecord = {
      id: newId("resp"),
      sessionId: session.id,
      questionId: input.questionId,
      instanceKey,
      value: input.value,
      createdAt: stamp,
      updatedAt: stamp,
    };
    session.responses.push(record);
  }

  session.lastSavedAt = stamp;
  if (input.currentQuestionKey !== undefined) {
    session.currentQuestionKey = input.currentQuestionKey;
  }

  const template = store.templates.find((t) => t.id === session.templateId);
  const question = template?.questions.find((q) => q.id === input.questionId);
  if (question?.key === "email" && typeof input.value === "string") {
    session.metadata = { ...session.metadata, email: input.value.trim() };
  }

  await saveStore(store);
  return session;
}

export async function completeSession(
  sessionId: string
): Promise<InterviewSession> {
  const store = await ensureStore();
  const session = store.sessions.find((s) => s.id === sessionId);
  if (!session) throw new Error("Session not found");
  session.status = "completed";
  session.completedAt = now();
  session.lastSavedAt = session.completedAt;
  await saveStore(store);
  return session;
}

export async function getResultsOverview(filters?: {
  templateId?: string;
  role?: string;
}): Promise<ResultsOverview> {
  const store = await ensureStore();
  let sessions = store.sessions;

  if (filters?.templateId) {
    sessions = sessions.filter((s) => s.templateId === filters.templateId);
  }

  const roleQuestionIds = new Map(
    store.templates.map((t) => {
      const roleQ = t.questions.find((q) => q.key === "role");
      return [t.id, roleQ?.id] as const;
    })
  );

  if (filters?.role) {
    sessions = sessions.filter((s) => {
      const roleQId = roleQuestionIds.get(s.templateId);
      if (!roleQId) return false;
      const response = s.responses.find((r) => r.questionId === roleQId);
      return response?.value === filters.role;
    });
  }

  const completed = sessions.filter((s) => s.status === "completed");
  const inProgress = sessions.filter((s) => s.status === "in_progress");

  const durations = completed
    .map((s) => {
      if (!s.completedAt) return null;
      return (
        new Date(s.completedAt).getTime() - new Date(s.startedAt).getTime()
      );
    })
    .filter((d): d is number => d !== null && d > 0);

  const averageCompletionMs =
    durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : null;

  return {
    totalSessions: sessions.length,
    completedSessions: completed.length,
    inProgressSessions: inProgress.length,
    completionRate:
      sessions.length === 0
        ? 0
        : Math.round((completed.length / sessions.length) * 1000) / 10,
    averageCompletionMs,
    sessions: sessions
      .map((s) => {
        const template = store.templates.find((t) => t.id === s.templateId);
        const roleQId = roleQuestionIds.get(s.templateId);
        const roleResponse = roleQId
          ? s.responses.find((r) => r.questionId === roleQId)
          : undefined;
        const durationMs =
          s.completedAt
            ? new Date(s.completedAt).getTime() - new Date(s.startedAt).getTime()
            : null;
        return {
          id: s.id,
          templateId: s.templateId,
          templateTitle: template?.title ?? "Unknown",
          status: s.status,
          startedAt: s.startedAt,
          completedAt: s.completedAt,
          durationMs,
          role:
            typeof roleResponse?.value === "string"
              ? roleResponse.value
              : undefined,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      ),
  };
}

export async function getResponsesGroupedByQuestion(templateId: string) {
  const store = await ensureStore();
  const template = store.templates.find((t) => t.id === templateId);
  if (!template) return [];

  const sessions = store.sessions.filter(
    (s) => s.templateId === templateId && s.status === "completed"
  );

  return template.questions
    .filter((q) => !q.repeatSourceQuestionId)
    .map((question) => {
      const answers = sessions.flatMap((s) =>
        s.responses
          .filter((r) => r.questionId === question.id)
          .map((r) => ({
            sessionId: s.id,
            instanceKey: r.instanceKey,
            value: r.value,
          }))
      );
      return { question, answers };
    });
}

export async function exportSessionsCsv(filters?: {
  templateId?: string;
  role?: string;
}): Promise<string> {
  const overview = await getResultsOverview(filters);
  const store = await ensureStore();
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
    const template = store.templates.find((t) => t.id === templateId);
    if (!template) continue;
    const qById = new Map(template.questions.map((q) => [q.id, q]));
    const sessions = store.sessions.filter((s) => {
      if (s.templateId !== templateId) return false;
      if (!overview.sessions.some((o) => o.id === s.id)) return false;
      return true;
    });

    for (const session of sessions) {
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

export async function resetStoreToSeed(): Promise<void> {
  const initial: StoreData = {
    templates: structuredClone(SEED_TEMPLATES),
    sessions: [],
  };
  await saveStore(initial);
}
