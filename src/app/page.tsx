import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listTemplates } from "@/lib/db/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const templates = await listTemplates();
  const survey =
    templates.find((t) => t.status === "published") ?? templates[0] ?? null;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div className="interview-atmosphere pointer-events-none absolute inset-0" />

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <p className="font-display text-5xl font-semibold tracking-tight text-foreground sm:text-6xl md:text-7xl">
          NeuroTriage
        </p>

        {survey ? (
          <>
            <h1 className="mt-8 max-w-2xl text-xl font-medium leading-snug text-foreground sm:text-2xl">
              {survey.title}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {survey.description}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Takes about 10–15 minutes · your answers are saved as you go
            </p>
            <Button asChild size="lg" className="mt-10 gap-2 px-8">
              <Link href={`/interview/${survey.slug}`}>
                Start survey
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </>
        ) : (
          <p className="mt-8 text-muted-foreground">
            No survey is available yet.
          </p>
        )}
      </main>
    </div>
  );
}
