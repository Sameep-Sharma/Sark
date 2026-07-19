import { NextResponse } from "next/server";

import { getQuizSession } from "@/lib/auth/session";
import { findQuizUserById, updateQuizUserScore } from "@/lib/auth/users";
import { findQuizSubmission, validateQuizSubmission } from "@/lib/quiz/data";
import { getActiveQuiz, hasQuizStarted, toQuizPayload } from "@/lib/quiz/db";
import { getSupabaseAdmin } from "@/lib/db/supabase";
import type { QuizSubmission } from "@/lib/quiz/types";

export async function GET() {
  const session = await getQuizSession();

  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const user = await findQuizUserById(session.userId);

  if (!user) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const quiz = await getActiveQuiz();

  if (!quiz) {
    return NextResponse.json({ ok: false, message: "No active quiz is available." }, { status: 404 });
  }

  if (!hasQuizStarted(quiz)) {
    return NextResponse.json(
      { ok: false, message: `This quiz starts at ${new Date(quiz.config.startsAt).toLocaleString()}.` },
      { status: 403 },
    );
  }

  const existingSubmission = await findQuizSubmission(user.id, quiz.id);

  if (existingSubmission) {
    return NextResponse.json(
      { ok: false, message: "Quiz already submitted.", score: existingSubmission.score, quizName: existingSubmission.quiz_name },
      { status: 409 },
    );
  }

  return NextResponse.json(toQuizPayload(quiz));
}

export async function POST(request: Request) {
  try {
    const session = await getQuizSession();

    if (!session) {
      return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
    }

    const user = await findQuizUserById(session.userId);

    if (!user) {
      return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
    }

    const quiz = await getActiveQuiz();

    if (!quiz) {
      return NextResponse.json({ ok: false, message: "No active quiz is available." }, { status: 404 });
    }

    if (!hasQuizStarted(quiz)) {
      return NextResponse.json({ ok: false, message: "This quiz has not started yet." }, { status: 403 });
    }

    const body = (await request.json()) as Partial<QuizSubmission>;

    if (!body.answers || typeof body.answers !== "object" || Array.isArray(body.answers)) {
      return NextResponse.json({ ok: false, message: "Invalid quiz submission." }, { status: 400 });
    }

    if (body.quizId && body.quizId !== quiz.id) {
      return NextResponse.json({ ok: false, message: "The active quiz changed. Please reload before submitting." }, { status: 409 });
    }

    const existingSubmission = await findQuizSubmission(user.id, quiz.id);

    if (existingSubmission) {
      return NextResponse.json(
        { ok: false, message: "Quiz already submitted.", score: existingSubmission.score, quizName: existingSubmission.quiz_name },
        { status: 409 },
      );
    }

    const result = await validateQuizSubmission(quiz, body.answers);
    const score = Math.round((result.correctCount / result.totalQuestions) * 100);
    const startedAt = typeof body.startedAt === "number" ? body.startedAt : Date.now();
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
    const timetaken = Math.min(elapsedSeconds, quiz.config.durationSeconds);
    const now = new Date().toISOString();
    
    const db = getSupabaseAdmin();

    const { error: insertError } = await db.from("quiz_submissions").insert({
      quiz_id: quiz.id,
      quiz_name: quiz.name,
      user_id: user.id,
      answers: result.answers,
      score,
      correct_count: result.correctCount,
      total_questions: result.totalQuestions,
      answered_count: result.answeredCount,
      unanswered_count: result.unansweredCount,
      timetaken,
      started_at: new Date(startedAt).toISOString(),
      submitted_at: now,
      created_at: now,
      updated_at: now,
    });

    if (insertError) {
      if (insertError.code === "23505") { // unique violation
        return NextResponse.json({ ok: false, message: "Quiz already submitted." }, { status: 409 });
      }
      throw insertError;
    }

    await updateQuizUserScore(user.id, {
      score,
      timetaken,
      latestQuizId: quiz.id,
      latestQuizName: quiz.name,
    });

    return NextResponse.json({ ok: true, score, timetaken, quizId: quiz.id, quizName: quiz.name });
  } catch (error) {
    console.error("Quiz submission failed", error);

    return NextResponse.json({ ok: false, message: "Unable to submit quiz." }, { status: 500 });
  }
}
