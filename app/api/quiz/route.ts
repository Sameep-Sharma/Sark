import { NextResponse } from "next/server";

import { getQuizPayload, validateQuizSubmission } from "@/lib/quiz/data";
import type { QuizSubmission } from "@/lib/quiz/types";

export async function GET() {
  const payload = await getQuizPayload();

  return NextResponse.json(payload);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<QuizSubmission>;

    if (!body.answers || typeof body.answers !== "object" || Array.isArray(body.answers)) {
      return NextResponse.json({ ok: false, message: "Invalid quiz submission." }, { status: 400 });
    }

    const result = await validateQuizSubmission(body.answers);

    console.log("Quiz submission validated", result);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Quiz submission failed", error);

    return NextResponse.json({ ok: false, message: "Unable to submit quiz." }, { status: 500 });
  }
}
