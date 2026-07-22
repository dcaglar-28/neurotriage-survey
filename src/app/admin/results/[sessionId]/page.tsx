import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { buildRuntimePath, getAnswerMap } from "@/lib/interview/engine";
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
  const answers = getAnswerMap(session.responses, template.questions);
  const path = buildRuntimePath(template, answers);
  const answeredKeys = new Set(
    session.responses.map((r) => {
      const q = qById.get(r.questionId);
      if (!q) return r.questionId;
      return r.instanceKey ? `${q.key}::${r.instanceKey}` : q.key;
    })
  );
  const remaining = path.filter((rq) => !answeredKeys.has(rq.runtimeId));
  const isIncomplete = session.status === "in_progress";
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

      <div className="mb-8 flex flex-wrap items-center gap-3 text-sm">
        <Badge variant={isIncomplete ? "warning" : "success"}>
          {isIncomplete ? "Incomplete" : "Completed"}
        </Badge>
        <span className="text-muted-foreground">{template.title}</span>
        <span className="text-muted-foreground">
          {session.responses.length} of {path.length} on path answered
        </span>
        {durationMs !== null && (
          <span className="text-muted-foreground">{formatDuration(durationMs)}</span>
        )}
        {isIncomplete && (
          <span className="text-muted-foreground">
            Last saved {new Date(session.lastSavedAt).toLocaleString()}
          </span>
        )}
      </div>

      {isIncomplete && (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
          This interview was not finished. Saved answers are below; remaining
          questions on their path are listed at the end.
        </div>
      )}

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

        {session.responses.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No answers were saved for this session.
          </p>
        )}

        {isIncomplete && remaining.length > 0 && (
          <div className="mt-8 space-y-3">
            <h2 className="font-display text-lg font-semibold text-muted-foreground">
              Remaining on path
            </h2>
            {remaining.map((rq) => (
              <div
                key={rq.runtimeId}
                className="rounded-xl border border-dashed p-4 opacity-60"
              >
                <p className="font-medium">{rq.question.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {rq.question.key}
                  {rq.instanceKey ? ` · ${rq.instanceKey}` : ""}
                </p>
                <p className="mt-3 text-sm italic text-muted-foreground">
                  No response
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
