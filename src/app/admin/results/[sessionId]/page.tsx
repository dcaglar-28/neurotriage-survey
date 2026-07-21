import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSessionById, getTemplateById } from "@/lib/db/store";
import { formatDuration } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const session = await getSessionById(sessionId);
  if (!session) notFound();
  const template = await getTemplateById(session.templateId);
  if (!template) notFound();

  const qById = new Map(template.questions.map((q) => [q.id, q]));
  const durationMs = session.completedAt
    ? new Date(session.completedAt).getTime() -
      new Date(session.startedAt).getTime()
    : null;

  return (
    <AdminShell active="results">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Session</h1>
          <p className="mt-1 text-sm text-muted-foreground">{session.id}</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/results">Back</Link>
        </Button>
      </div>

      <div className="mb-8 flex flex-wrap gap-3 text-sm">
        <Badge variant={session.status === "completed" ? "success" : "warning"}>
          {session.status}
        </Badge>
        <span className="text-muted-foreground">{template.title}</span>
        <span className="text-muted-foreground">
          {formatDuration(durationMs)}
        </span>
      </div>

      <div className="space-y-4">
        {session.responses.map((r) => {
          const q = qById.get(r.questionId);
          return (
            <div key={r.id} className="rounded-xl border p-4">
              <p className="font-medium">
                {q?.title ?? r.questionId}
                {r.instanceKey ? ` (${r.instanceKey})` : ""}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{q?.key}</p>
              <p className="mt-3 whitespace-pre-wrap text-sm">
                {Array.isArray(r.value)
                  ? r.value.join(", ")
                  : String(r.value ?? "")}
              </p>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
