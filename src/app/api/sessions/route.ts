import { NextResponse } from "next/server";
import { z } from "zod";
import { getTemplateBySlug, startSession } from "@/lib/db/store";

const schema = z.object({
  templateId: z.string().optional(),
  slug: z.string().optional(),
  token: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  let templateId = parsed.data.templateId;
  if (!templateId && parsed.data.slug) {
    const template = await getTemplateBySlug(parsed.data.slug);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    templateId = template.id;
  }
  if (!templateId) {
    return NextResponse.json({ error: "templateId or slug required" }, { status: 400 });
  }

  const session = await startSession(templateId, parsed.data.token);
  return NextResponse.json({ session }, { status: 201 });
}
