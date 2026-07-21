import { NextResponse } from "next/server";
import { exportSessionsCsv } from "@/lib/db/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const templateId = searchParams.get("templateId") ?? undefined;
  const role = searchParams.get("role") ?? undefined;
  const csv = await exportSessionsCsv({ templateId, role });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="eia-survey-export.csv"`,
    },
  });
}
