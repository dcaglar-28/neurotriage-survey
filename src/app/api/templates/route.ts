import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createTemplate,
  listTemplates,
} from "@/lib/db/store";

export async function GET() {
  const templates = await listTemplates();
  return NextResponse.json({ templates });
}

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  slug: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const template = await createTemplate(parsed.data);
  return NextResponse.json({ template }, { status: 201 });
}
