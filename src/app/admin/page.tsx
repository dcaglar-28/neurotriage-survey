import { AdminShell } from "@/components/admin/AdminShell";
import { TemplatesManager } from "@/components/admin/TemplatesManager";
import { listTemplates } from "@/lib/db/store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const templates = await listTemplates();
  return (
    <AdminShell active="templates">
      <TemplatesManager initialTemplates={templates} />
    </AdminShell>
  );
}
