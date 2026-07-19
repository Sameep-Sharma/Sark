import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth/admin-session";
import {
  setActiveQuiz,
  validateQuizDocumentInput,
} from "@/lib/quiz/db";
import { getSupabaseAdmin } from "@/lib/db/supabase";

type RouteContext = {
  params: Promise<{ quizId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const { quizId } = await context.params;

  if (!quizId) {
    return NextResponse.json({ ok: false, message: "Invalid quiz id." }, { status: 400 });
  }

  const body = await request.json();

  if (typeof body?.isActive === "boolean" && Object.keys(body).length === 1) {
    const quiz = await setActiveQuiz(quizId, body.isActive);

    if (!quiz) {
      return NextResponse.json({ ok: false, message: "Quiz not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  }

  const validation = validateQuizDocumentInput(body);

  if (!validation.ok) {
    return NextResponse.json({ ok: false, message: validation.message }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  const now = new Date().toISOString();
  
  const { data, error } = await db
    .from("quizzes")
    .update({
      name: validation.quiz.name,
      config: validation.quiz.config,
      questions: validation.quiz.questions,
      result_invite: validation.quiz.resultInvite,
      is_active: false,
      updated_at: now,
    })
    .eq("id", quizId)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, message: "Failed to update quiz." }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ ok: false, message: "Quiz not found." }, { status: 404 });
  }

  if (validation.quiz.isActive) {
    await setActiveQuiz(quizId, true);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const { quizId } = await context.params;

  if (!quizId) {
    return NextResponse.json({ ok: false, message: "Invalid quiz id." }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  const { data: deletedData, error } = await db
    .from("quizzes")
    .delete()
    .eq("id", quizId)
    .select("id");

  if (error) {
    return NextResponse.json({ ok: false, message: "Failed to delete quiz." }, { status: 500 });
  }

  if (!deletedData || deletedData.length === 0) {
    return NextResponse.json({ ok: false, message: "Quiz not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
