"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import type { ResultsOverview, TemplateSummary } from "@/lib/types";
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
    }>;
  }>;
}) {
  const [overview, setOverview] = useState(initialOverview);
  const [grouped, setGrouped] = useState(initialGrouped);
  const [templateId, setTemplateId] = useState<string>(
    templates[0]?.id ?? "all"
  );
  const [role, setRole] = useState<string>("all");
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

  const selectedSession = overview.sessions.find((s) => s.id === selectedSessionId);

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
            Completion metrics, individual responses, and CSV export.
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
          {
            label: "Completion rate",
            value: `${overview.completionRate}%`,
          },
          {
            label: "Avg. completion time",
            value: formatDuration(overview.averageCompletionMs),
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
              Click a session to inspect details.
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[480px] space-y-2 overflow-y-auto">
            {overview.sessions.map((s) => (
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
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      s.status === "completed" ? "success" : "warning"
                    }
                  >
                    {s.status}
                  </Badge>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDuration(s.durationMs)}
                  </p>
                </div>
              </button>
            ))}
            {overview.sessions.length === 0 && (
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
                  {selectedSession.status}
                </p>
                <p>
                  <span className="text-muted-foreground">Started:</span>{" "}
                  {new Date(selectedSession.startedAt).toLocaleString()}
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
            Grouped answers for the selected template.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {grouped.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Select a template to view grouped responses.
            </p>
          )}
          {grouped.map(({ question, answers }) => (
            <div key={question.id} className="rounded-xl border p-4">
              <h3 className="font-medium">{question.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {question.key} · {question.type} · {answers.length} answers
              </p>
              <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto text-sm">
                {answers.slice(0, 40).map((a, i) => (
                  <li
                    key={`${a.sessionId}-${a.instanceKey}-${i}`}
                    className="rounded-md bg-muted/50 px-3 py-2"
                  >
                    {a.instanceKey && (
                      <span className="mr-2 text-xs font-medium text-primary">
                        [{a.instanceKey}]
                      </span>
                    )}
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
