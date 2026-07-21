import { NextResponse } from "next/server";
import { duplicateTemplate } from "@/lib/db/store";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const template = await duplicateTemplate(id);
  if (!template) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ template }, { status: 201 });
}
