import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { getAdminSession } from "@/lib/auth/admin-session";
import { getQuizSubmissionsCollection, getQuizzesCollection, setActiveQuiz, validateQuizDocumentInput } from "@/lib/quiz/db";

type RouteContext = {
  params: Promise<{ quizId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const { quizId } = await context.params;

  if (!ObjectId.isValid(quizId)) {
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

  const quizzes = await getQuizzesCollection();
  const now = new Date();
  const result = await quizzes.updateOne(
    { _id: new ObjectId(quizId) },
    {
      $set: {
        ...validation.quiz,
        isActive: false,
        updatedAt: now,
      },
    },
  );

  if (result.matchedCount === 0) {
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

  if (!ObjectId.isValid(quizId)) {
    return NextResponse.json({ ok: false, message: "Invalid quiz id." }, { status: 400 });
  }

  const quizObjectId = new ObjectId(quizId);
  const quizzes = await getQuizzesCollection();
  const submissions = await getQuizSubmissionsCollection();
  const result = await quizzes.deleteOne({ _id: quizObjectId });

  if (result.deletedCount === 0) {
    return NextResponse.json({ ok: false, message: "Quiz not found." }, { status: 404 });
  }

  await submissions.deleteMany({ quizId: quizObjectId });

  return NextResponse.json({ ok: true });
}
