/**
 * Data access facade.
 *
 * Intended production workflow (single domain):
 *   https://your-domain.com/survey  →  anonymous session  →  answers in Supabase  →  /admin/results
 *
 * When SUPABASE_SERVICE_ROLE_KEY is set, all reads/writes go to Supabase.
 * Otherwise falls back to local .data/store.json for offline development.
 */
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import * as local from "@/lib/db/local-store";
import * as supabase from "@/lib/db/supabase-store";

function backend() {
  return isSupabaseConfigured() ? supabase : local;
}

export const listTemplates = (...args: Parameters<typeof local.listTemplates>) =>
  backend().listTemplates(...args);

export const getTemplateBySlug = (
  ...args: Parameters<typeof local.getTemplateBySlug>
) => backend().getTemplateBySlug(...args);

export const getTemplateById = (
  ...args: Parameters<typeof local.getTemplateById>
) => backend().getTemplateById(...args);

export const createTemplate = (
  ...args: Parameters<typeof local.createTemplate>
) => backend().createTemplate(...args);

export const updateTemplate = (
  ...args: Parameters<typeof local.updateTemplate>
) => backend().updateTemplate(...args);

export const setTemplateStatus = (
  ...args: Parameters<typeof local.setTemplateStatus>
) => backend().setTemplateStatus(...args);

export const duplicateTemplate = (
  ...args: Parameters<typeof local.duplicateTemplate>
) => backend().duplicateTemplate(...args);

export const deleteTemplate = (
  ...args: Parameters<typeof local.deleteTemplate>
) => backend().deleteTemplate(...args);

export const startSession = (
  ...args: Parameters<typeof local.startSession>
) => backend().startSession(...args);

export const getSessionByToken = (
  ...args: Parameters<typeof local.getSessionByToken>
) => backend().getSessionByToken(...args);

export const getSessionById = (
  ...args: Parameters<typeof local.getSessionById>
) => backend().getSessionById(...args);

export const saveResponse = (
  ...args: Parameters<typeof local.saveResponse>
) => backend().saveResponse(...args);

export const completeSession = (
  ...args: Parameters<typeof local.completeSession>
) => backend().completeSession(...args);

export const getResultsOverview = (
  ...args: Parameters<typeof local.getResultsOverview>
) => backend().getResultsOverview(...args);

export const getResponsesGroupedByQuestion = (
  ...args: Parameters<typeof local.getResponsesGroupedByQuestion>
) => backend().getResponsesGroupedByQuestion(...args);

export const exportSessionsCsv = (
  ...args: Parameters<typeof local.exportSessionsCsv>
) => backend().exportSessionsCsv(...args);

export const resetStoreToSeed = (
  ...args: Parameters<typeof local.resetStoreToSeed>
) => backend().resetStoreToSeed(...args);

export { isSupabaseConfigured };
