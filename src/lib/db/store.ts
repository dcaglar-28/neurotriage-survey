/**
 * Data access facade.
 *
 * Intended production workflow (single domain):
 *   https://your-domain.com/survey  →  anonymous session  →  answers in Supabase  →  /admin/results
 *
 * When Supabase is configured AND reachable, use it.
 * If tables are missing / schema not applied yet, fall back to local .data/store.json.
 */
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import * as local from "@/lib/db/local-store";
import * as supabase from "@/lib/db/supabase-store";

function isSchemaMissingError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: string; message?: string };
  return (
    e.code === "PGRST205" ||
    e.code === "42P01" ||
    Boolean(e.message?.includes("Could not find the table")) ||
    Boolean(e.message?.includes("does not exist"))
  );
}

function formatSupabaseError(error: unknown): Error {
  if (error && typeof error === "object" && "message" in error) {
    const e = error as { code?: string; message?: string; hint?: string };
    return new Error(
      `[Supabase ${e.code ?? "error"}] ${e.message ?? "Unknown error"}${
        e.hint ? ` Hint: ${e.hint}` : ""
      }`
    );
  }
  return error instanceof Error ? error : new Error(String(error));
}

async function withBackend<T>(
  operation: string,
  run: (api: typeof supabase | typeof local) => Promise<T>
): Promise<T> {
  if (!isSupabaseConfigured()) {
    return run(local);
  }

  try {
    return await run(supabase);
  } catch (error) {
    if (isSchemaMissingError(error)) {
      console.warn(
        `[NeuroTriage] Supabase schema missing during ${operation}; using local store. Run supabase/migrations/001_schema.sql and 002_anon_survey_policies.sql in the SQL Editor, then npm run seed:supabase.`
      );
      return run(local);
    }
    throw formatSupabaseError(error);
  }
}

export const listTemplates = async () => {
  if (!isSupabaseConfigured()) {
    return local.listTemplates();
  }
  try {
    const templates = await supabase.listTemplates();
    if (templates.length === 0) {
      console.warn(
        "[NeuroTriage] No templates in Supabase yet; using local seed. Run supabase/seed-prehospital.sql in the SQL Editor."
      );
      return local.listTemplates();
    }
    return templates;
  } catch (error) {
    if (isSchemaMissingError(error)) {
      console.warn(
        "[NeuroTriage] Supabase schema missing during listTemplates; using local store."
      );
      return local.listTemplates();
    }
    throw formatSupabaseError(error);
  }
};

export const getTemplateBySlug = async (slug: string) => {
  if (!isSupabaseConfigured()) {
    return local.getTemplateBySlug(slug);
  }
  try {
    const template = await supabase.getTemplateBySlug(slug);
    if (!template) {
      return local.getTemplateBySlug(slug);
    }
    return template;
  } catch (error) {
    if (isSchemaMissingError(error)) {
      return local.getTemplateBySlug(slug);
    }
    throw formatSupabaseError(error);
  }
};

export const getTemplateById = async (id: string) => {
  if (!isSupabaseConfigured()) {
    return local.getTemplateById(id);
  }
  try {
    const template = await supabase.getTemplateById(id);
    if (!template) {
      return local.getTemplateById(id);
    }
    return template;
  } catch (error) {
    if (isSchemaMissingError(error)) {
      return local.getTemplateById(id);
    }
    throw formatSupabaseError(error);
  }
};

export const createTemplate = (
  ...args: Parameters<typeof local.createTemplate>
) => withBackend("createTemplate", (api) => api.createTemplate(...args));

export const updateTemplate = (
  ...args: Parameters<typeof local.updateTemplate>
) => withBackend("updateTemplate", (api) => api.updateTemplate(...args));

export const setTemplateStatus = (
  ...args: Parameters<typeof local.setTemplateStatus>
) => withBackend("setTemplateStatus", (api) => api.setTemplateStatus(...args));

export const duplicateTemplate = (
  ...args: Parameters<typeof local.duplicateTemplate>
) => withBackend("duplicateTemplate", (api) => api.duplicateTemplate(...args));

export const deleteTemplate = (
  ...args: Parameters<typeof local.deleteTemplate>
) => withBackend("deleteTemplate", (api) => api.deleteTemplate(...args));

export const startSession = (
  ...args: Parameters<typeof local.startSession>
) => withBackend("startSession", (api) => api.startSession(...args));

export const getSessionByToken = (
  ...args: Parameters<typeof local.getSessionByToken>
) => withBackend("getSessionByToken", (api) => api.getSessionByToken(...args));

export const getSessionById = (
  ...args: Parameters<typeof local.getSessionById>
) => withBackend("getSessionById", (api) => api.getSessionById(...args));

export const saveResponse = (
  ...args: Parameters<typeof local.saveResponse>
) => withBackend("saveResponse", (api) => api.saveResponse(...args));

export const completeSession = (
  ...args: Parameters<typeof local.completeSession>
) => withBackend("completeSession", (api) => api.completeSession(...args));

export const getResultsOverview = (
  ...args: Parameters<typeof local.getResultsOverview>
) => withBackend("getResultsOverview", (api) => api.getResultsOverview(...args));

export const getResponsesGroupedByQuestion = (
  ...args: Parameters<typeof local.getResponsesGroupedByQuestion>
) =>
  withBackend("getResponsesGroupedByQuestion", (api) =>
    api.getResponsesGroupedByQuestion(...args)
  );

export const exportSessionsCsv = (
  ...args: Parameters<typeof local.exportSessionsCsv>
) => withBackend("exportSessionsCsv", (api) => api.exportSessionsCsv(...args));

export const resetStoreToSeed = (
  ...args: Parameters<typeof local.resetStoreToSeed>
) => withBackend("resetStoreToSeed", (api) => api.resetStoreToSeed(...args));

export { isSupabaseConfigured };
