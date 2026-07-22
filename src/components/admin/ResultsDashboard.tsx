"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import type { ResultsOverview, SessionStatus, TemplateSummary } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLE_LABELS: Record<string, string> = {
  emt: "EMT",
  paramedic: "Paramedic",
  emergency_physician: "Emergency Physician",
  emergency_nurse: "Emergency Nurse",
  trauma_surgeon: "Trauma Surgeon",
  military_medic: "Military Medic",
  disaster_response: "Disaster Response",
  critical_care_transport: "Critical Care Transport",
  other: "Other",
};

type StatusFilter = "all" | SessionStatus;

function statusLabel(status: SessionStatus) {
  return status === "completed" ? "Completed" : "Incomplete";
}

export function ResultsDashboard({
  initialOverview,
  templates,
  initialGrouped,
}: {
  initialOverview: ResultsOverview;
  templates: TemplateSummary[];
  initialGrouped: Array<{
    question: { id: string; key: string; title: string; type: string };
    answers: Array<{
      sessionId: string;
      instanceKey: string | null;
      value: unknown;
      status: SessionStatus;
    }>;
  }>;
}) {
  const [overview, setOverview] = useState(initialOverview);
  const [grouped, setGrouped] = useState(initialGrouped);
  const [templateId, setTemplateId] = useState<string>(
    templates[0]?.id ?? "all"
  );
  const [role, setRole] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  async function refresh(nextTemplateId: string, nextRole: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (nextTemplateId !== "all") params.set("templateId", nextTemplateId);
      if (nextRole !== "all") params.set("role", nextRole);
      if (nextTemplateId !== "all") params.set("grouped", "1");
      const res = await fetch(`/api/results?${params.toString()}`);
      const data = await res.json();
      setOverview(data.overview);
      if (data.byQuestion) setGrouped(data.byQuestion);
      else setGrouped([]);
    } finally {
      setLoading(false);
    }
  }

  const roles = useMemo(() => {
    const set = new Set(
      overview.sessions.map((s) => s.role).filter(Boolean) as string[]
    );
    return Array.from(set);
  }, [overview.sessions]);

  const filteredSessions = useMemo(() => {
    if (statusFilter === "all") return overview.sessions;
    return overview.sessions.filter((s) => s.status === statusFilter);
  }, [overview.sessions, statusFilter]);

  const selectedSession = filteredSessions.find(
    (s) => s.id === selectedSessionId
  );

  const filteredGrouped = useMemo(() => {
    if (statusFilter === "all") return grouped;
    return grouped.map(({ question, answers }) => ({
      question,
      answers: answers.filter((a) => a.status === statusFilter),
    }));
  }, [grouped, statusFilter]);

  const exportHref = (() => {
    const params = new URLSearchParams();
    if (templateId !== "all") params.set("templateId", templateId);
    if (role !== "all") params.set("role", role);
    return `/api/results/export?${params.toString()}`;
  })();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Results</h1>
          <p className="mt-1 text-muted-foreground">
            Completion metrics, individual responses, and CSV export. Incomplete
            interviews are saved and shown separately.
          </p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <a href={exportHref}>
            <Download className="h-4 w-4" />
            Export CSV
          </a>
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={templateId}
          onValueChange={(v) => {
            setTemplateId(v);
            void refresh(v, role);
          }}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All templates</SelectItem>
            {templates.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={role}
          onValueChange={(v) => {
            setRole(v);
            void refresh(templateId, v);
          }}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {roles.map((r) => (
              <SelectItem key={r} value={r}>
                {ROLE_LABELS[r] ?? r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as StatusFilter);
            setSelectedSessionId(null);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="completed">Completed only</SelectItem>
            <SelectItem value="in_progress">Incomplete only</SelectItem>
          </SelectContent>
        </Select>
        {loading && (
          <span className="self-center text-sm text-muted-foreground">
            Updating…
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total interviews", value: overview.totalSessions },
          { label: "Completed", value: overview.completedSessions },
          { label: "Incomplete", value: overview.inProgressSessions },
          {
            label: "Completion rate",
            value: `${overview.completionRate}%`,
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Individual responses</CardTitle>
            <CardDescription>
              Incomplete sessions show how far someone got before leaving.
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[480px] space-y-2 overflow-y-auto">
            {filteredSessions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSessionId(s.id)}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition ${
                  selectedSessionId === s.id
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
              >
                <div>
                  <p className="text-sm font-medium">{s.templateTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(s.startedAt).toLocaleString()}
                    {s.role ? ` · ${ROLE_LABELS[s.role] ?? s.role}` : ""}
                    {s.status === "in_progress"
                      ? ` · ${s.answeredCount} answered`
                      : ""}
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      s.status === "completed" ? "success" : "warning"
                    }
                  >
                    {statusLabel(s.status)}
                  </Badge>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.status === "completed"
                      ? formatDuration(s.durationMs)
                      : `Last save ${new Date(s.lastSavedAt).toLocaleString()}`}
                  </p>
                </div>
              </button>
            ))}
            {filteredSessions.length === 0 && (
              <p className="text-sm text-muted-foreground">No sessions yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session detail</CardTitle>
            <CardDescription>
              {selectedSession
                ? selectedSession.id
                : "Select a session from the list"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedSession ? (
              <div className="space-y-3 text-sm">
                <p>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  {statusLabel(selectedSession.status)}
                </p>
                <p>
                  <span className="text-muted-foreground">Answers saved:</span>{" "}
                  {selectedSession.answeredCount}
                </p>
                <p>
                  <span className="text-muted-foreground">Started:</span>{" "}
                  {new Date(selectedSession.startedAt).toLocaleString()}
                </p>
                <p>
                  <span className="text-muted-foreground">Last saved:</span>{" "}
                  {new Date(selectedSession.lastSavedAt).toLocaleString()}
                </p>
                <p>
                  <span className="text-muted-foreground">Completed:</span>{" "}
                  {selectedSession.completedAt
                    ? new Date(selectedSession.completedAt).toLocaleString()
                    : "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">Role:</span>{" "}
                  {selectedSession.role
                    ? ROLE_LABELS[selectedSession.role] ?? selectedSession.role
                    : "—"}
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/results/${selectedSession.id}`}>
                    View full answers
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No session selected.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Responses by question</CardTitle>
          <CardDescription>
            Includes incomplete interviews (amber badge). Use the status filter
            above to focus on completed or incomplete only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {filteredGrouped.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Select a template to view grouped responses.
            </p>
          )}
          {filteredGrouped.map(({ question, answers }) => (
            <div key={question.id} className="rounded-xl border p-4">
              <h3 className="font-medium">{question.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {question.key} · {question.type} · {answers.length} answers
                {answers.some((a) => a.status === "in_progress")
                  ? ` · ${answers.filter((a) => a.status === "in_progress").length} incomplete`
                  : ""}
              </p>
              <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto text-sm">
                {answers.slice(0, 40).map((a, i) => (
                  <li
                    key={`${a.sessionId}-${a.instanceKey}-${i}`}
                    className={`rounded-md px-3 py-2 ${
                      a.status === "in_progress"
                        ? "border border-amber-500/30 bg-amber-500/10"
                        : "bg-muted/50"
                    }`}
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      {a.status === "in_progress" && (
                        <Badge variant="warning" className="text-[10px]">
                          Incomplete
                        </Badge>
                      )}
                      {a.instanceKey && (
                        <span className="text-xs font-medium text-primary">
                          [{a.instanceKey}]
                        </span>
                      )}
                    </div>
                    {Array.isArray(a.value)
                      ? a.value.join(", ")
                      : String(a.value ?? "")}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
