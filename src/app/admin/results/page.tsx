import { AdminShell } from "@/components/admin/AdminShell";
import { ResultsDashboard } from "@/components/admin/ResultsDashboard";
import {
  getResponsesGroupedByQuestion,
  getResultsOverview,
  listTemplates,
} from "@/lib/db/store";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const templates = await listTemplates();
  const defaultTemplateId = templates[0]?.id;
  const overview = await getResultsOverview(
    defaultTemplateId ? { templateId: defaultTemplateId } : undefined
  );
  const grouped = defaultTemplateId
    ? await getResponsesGroupedByQuestion(defaultTemplateId)
    : [];

  return (
    <AdminShell active="results">
      <ResultsDashboard
        initialOverview={overview}
        templates={templates}
        initialGrouped={grouped}
      />
    </AdminShell>
  );
}
