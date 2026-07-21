import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { TemplateEditor } from "@/components/admin/TemplateEditor";
import { getTemplateById } from "@/lib/db/store";

export const dynamic = "force-dynamic";

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = await getTemplateById(id);
  if (!template) notFound();

  return (
    <AdminShell active="templates">
      <TemplateEditor initial={template} />
    </AdminShell>
  );
}
