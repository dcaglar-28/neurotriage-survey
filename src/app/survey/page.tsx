import { redirect } from "next/navigation";
import { listTemplates } from "@/lib/db/store";

export const dynamic = "force-dynamic";

/**
 * Canonical shareable survey link for a single domain:
 *   https://your-domain.com/survey
 *
 * Resolves to the published NeuroTriage interview. Anonymous session IDs
 * are created when the participant starts — they are not part of the URL.
 */
export default async function SurveyRedirectPage() {
  const templates = await listTemplates();
  const survey =
    templates.find((t) => t.slug === "prehospital-emergency-care") ??
    templates.find((t) => t.status === "published") ??
    templates[0];

  if (!survey) {
    redirect("/");
  }

  redirect(`/interview/${survey.slug}`);
}
