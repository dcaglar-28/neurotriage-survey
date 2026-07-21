import { notFound } from "next/navigation";
import { InterviewPlayer } from "@/components/interview/InterviewPlayer";
import { getTemplateById } from "@/lib/db/store";
import type { InterviewSession } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = await getTemplateById(id);
  if (!template) notFound();

  const session: InterviewSession = {
    id: "preview-session",
    templateId: template.id,
    respondentToken: "preview",
    status: "in_progress",
    currentQuestionKey: template.questions[0]?.key ?? null,
    metadata: { preview: true },
    startedAt: new Date().toISOString(),
    completedAt: null,
    lastSavedAt: new Date().toISOString(),
    responses: [],
  };

  return (
    <InterviewPlayer template={template} initialSession={session} preview />
  );
}
