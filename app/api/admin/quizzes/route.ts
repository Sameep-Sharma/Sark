import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth/admin-session";
import { listQuizzes, setActiveQuiz, validateQuizDocumentInput } from "@/lib/quiz/db";
import { getSupabaseAdmin } from "@/lib/db/supabase";

export async function GET() {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const quizzes = await listQuizzes();

  return NextResponse.json({
    ok: true,
    quizzes,
  });
}

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const validation = validateQuizDocumentInput(await request.json());

  if (!validation.ok) {
    return NextResponse.json({ ok: false, message: validation.message }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data, error } = await db
    .from("quizzes")
    .insert({
      name: validation.quiz.name,
      config: validation.quiz.config,
      questions: validation.quiz.questions,
      result_invite: validation.quiz.resultInvite,
      is_active: false,
      created_at: now,
      updated_at: now,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Quiz creation failed", error);
    return NextResponse.json({ ok: false, message: "Failed to create quiz." }, { status: 500 });
  }

  if (validation.quiz.isActive) {
    await setActiveQuiz(data.id, true);
  }

  return NextResponse.json({ ok: true, quizId: data.id }, { status: 201 });
}
