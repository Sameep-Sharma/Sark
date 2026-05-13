import { NextResponse } from "next/server";

import { getQuizSession } from "@/lib/auth/session";
import { findQuizUserById, getQuizUsersCollection } from "@/lib/auth/users";
import { findQuizSubmission, validateQuizSubmission } from "@/lib/quiz/data";
import { ensureQuizSubmissionIndexes, getActiveQuiz, getQuizSubmissionsCollection, hasQuizStarted, toQuizPayload } from "@/lib/quiz/db";
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

  const existingSubmission = await findQuizSubmission(user._id, quiz._id);

  if (existingSubmission) {
    return NextResponse.json(
      { ok: false, message: "Quiz already submitted.", score: existingSubmission.score, quizName: existingSubmission.quizName },
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

    if (body.quizId && body.quizId !== quiz._id.toString()) {
      return NextResponse.json({ ok: false, message: "The active quiz changed. Please reload before submitting." }, { status: 409 });
    }

    const existingSubmission = await findQuizSubmission(user._id, quiz._id);

    if (existingSubmission) {
      return NextResponse.json(
        { ok: false, message: "Quiz already submitted.", score: existingSubmission.score, quizName: existingSubmission.quizName },
        { status: 409 },
      );
    }

    const result = await validateQuizSubmission(quiz, body.answers);
    const score = Math.round((result.correctCount / result.totalQuestions) * 100);
    const startedAt = typeof body.startedAt === "number" ? body.startedAt : Date.now();
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
    const timetaken = Math.min(elapsedSeconds, quiz.config.durationSeconds);
    const users = await getQuizUsersCollection();
    await ensureQuizSubmissionIndexes();
    const submissions = await getQuizSubmissionsCollection();
    const now = new Date();

    try {
      await submissions.insertOne({
        quizId: quiz._id,
        quizName: quiz.name,
        userId: user._id,
        answers: result.answers,
        score,
        correctCount: result.correctCount,
        totalQuestions: result.totalQuestions,
        answeredCount: result.answeredCount,
        unansweredCount: result.unansweredCount,
        timetaken,
        startedAt: new Date(startedAt),
        submittedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    } catch {
      return NextResponse.json({ ok: false, message: "Quiz already submitted." }, { status: 409 });
    }

    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          score,
          timetaken,
          latestQuizId: quiz._id.toString(),
          latestQuizName: quiz.name,
          updatedAt: now,
        },
      },
    );

    return NextResponse.json({ ok: true, score, timetaken, quizId: quiz._id.toString(), quizName: quiz.name });
  } catch (error) {
    console.error("Quiz submission failed", error);

    return NextResponse.json({ ok: false, message: "Unable to submit quiz." }, { status: 500 });
  }
}
