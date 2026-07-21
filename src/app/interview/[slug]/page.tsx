import { notFound } from "next/navigation";
import { InterviewBootstrap } from "@/components/interview/InterviewBootstrap";
import { getTemplateBySlug } from "@/lib/db/store";

export const dynamic = "force-dynamic";

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);
  if (!template) notFound();
  if (template.status !== "published") notFound();

  return <InterviewBootstrap template={template} />;
}
