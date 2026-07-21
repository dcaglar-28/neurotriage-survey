"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { InterviewPlayer } from "@/components/interview/InterviewPlayer";
import type { InterviewSession, Template } from "@/lib/types";

const TOKEN_KEY = (slug: string) => `eia-session-${slug}`;

export function InterviewBootstrap({ template }: { template: Template }) {
  const router = useRouter();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const stored = localStorage.getItem(TOKEN_KEY(template.slug));
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateId: template.id,
            token: stored || undefined,
          }),
        });
        if (!res.ok) throw new Error("Could not start interview");
        const data = await res.json();
        const next = data.session as InterviewSession;

        if (next.status === "completed") {
          localStorage.removeItem(TOKEN_KEY(template.slug));
          router.replace(`/interview/${template.slug}/thank-you`);
          return;
        }

        localStorage.setItem(TOKEN_KEY(template.slug), next.respondentToken);
        if (!cancelled) setSession(next);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load interview");
        }
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [router, template.id, template.slug]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <InterviewPlayer template={template} initialSession={session} />;
}
