import { NextResponse } from "next/server";
import {
  getResponsesGroupedByQuestion,
  getResultsOverview,
} from "@/lib/db/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const templateId = searchParams.get("templateId") ?? undefined;
  const role = searchParams.get("role") ?? undefined;
  const grouped = searchParams.get("grouped") === "1";

  const overview = await getResultsOverview({ templateId, role });

  if (grouped && templateId) {
    const byQuestion = await getResponsesGroupedByQuestion(templateId);
    return NextResponse.json({ overview, byQuestion });
  }

  return NextResponse.json({ overview });
}
