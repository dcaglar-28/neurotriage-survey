import { NextResponse } from "next/server";
import { z } from "zod";
import { completeSession, saveResponse } from "@/lib/db/store";

const schema = z.object({
  questionId: z.string(),
  instanceKey: z.string().nullable().optional(),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.null(),
  ]),
  currentQuestionKey: z.string().nullable().optional(),
  complete: z.boolean().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    let session = await saveResponse({
      sessionId: id,
      questionId: parsed.data.questionId,
      instanceKey: parsed.data.instanceKey,
      value: parsed.data.value,
      currentQuestionKey: parsed.data.currentQuestionKey,
    });

    if (parsed.data.complete) {
      session = await completeSession(id);
    }

    return NextResponse.json({ session });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to save" },
      { status: 400 }
    );
  }
}
