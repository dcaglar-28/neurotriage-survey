import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTemplateBySlug } from "@/lib/db/store";

export const dynamic = "force-dynamic";

export default async function ThankYouPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);
  if (!template) notFound();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
      <div className="interview-atmosphere pointer-events-none absolute inset-0" />
      <div className="relative z-10 max-w-lg text-center">
        <CheckCircle2 className="mx-auto mb-6 h-14 w-14 text-primary" />
        <p className="mb-4 font-display text-2xl font-semibold tracking-tight">
          NeuroTriage
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Thank you
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {template.thankYouMessage}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/">Home</Link>
          </Button>
          <Button asChild>
            <Link href="/survey">Start another response</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
