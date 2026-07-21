"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, ExternalLink, Plus, Pencil } from "lucide-react";
import type { TemplateSummary } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateTemplateForm } from "@/components/admin/CreateTemplateForm";

export function TemplatesManager({
  initialTemplates,
}: {
  initialTemplates: TemplateSummary[];
}) {
  const router = useRouter();
  const [templates, setTemplates] = useState(initialTemplates);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  async function duplicate(id: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/templates/${id}/duplicate`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Duplicate failed");
      setTemplates((prev) => [
        {
          id: data.template.id,
          title: data.template.title,
          description: data.template.description,
          slug: data.template.slug,
          status: data.template.status,
          questionCount: data.template.questions.filter(
            (q: { repeatSourceQuestionId: string | null }) =>
              !q.repeatSourceQuestionId
          ).length,
          updatedAt: data.template.updatedAt,
        },
        ...prev,
      ]);
      router.push(`/admin/templates/${data.template.id}`);
    } finally {
      setBusy(false);
    }
  }

  async function togglePublish(id: string, status: string) {
    const next = status === "published" ? "draft" : "published";
    const res = await fetch(`/api/templates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) return;
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: next as TemplateSummary["status"] }
          : t
      )
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Templates</h1>
          <p className="mt-1 text-muted-foreground">
            Create, edit, and publish adaptive interview templates.
          </p>
        </div>
        <Button onClick={() => setCreating((v) => !v)} className="gap-2">
          <Plus className="h-4 w-4" />
          New template
        </Button>
      </div>

      {creating && (
        <Card>
          <CardHeader>
            <CardTitle>Create template</CardTitle>
            <CardDescription>
              Start blank, then add sections, questions, and branch rules.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateTemplateForm
              onCreated={(id) => router.push(`/admin/templates/${id}`)}
              onCancel={() => setCreating(false)}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {templates.map((t) => (
          <Card key={t.id}>
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">{t.title}</h2>
                  <Badge
                    variant={
                      t.status === "published"
                        ? "success"
                        : t.status === "draft"
                          ? "warning"
                          : "secondary"
                    }
                  >
                    {t.status}
                  </Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {t.description}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  /{t.slug} · {t.questionCount} questions
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <Link href={`/admin/templates/${t.id}`}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  disabled={busy}
                  onClick={() => void duplicate(t.id)}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Duplicate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void togglePublish(t.id, t.status)}
                >
                  {t.status === "published" ? "Unpublish" : "Publish"}
                </Button>
                {t.status === "published" && (
                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className="gap-1.5"
                  >
                    <Link href={`/interview/${t.slug}`} target="_blank">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {templates.length === 0 && (
          <p className="text-muted-foreground">No templates yet.</p>
        )}
      </div>
    </div>
  );
}
