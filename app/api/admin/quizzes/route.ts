import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth/admin-session";
import { ensureQuizIndexes, getQuizzesCollection, listQuizzes, setActiveQuiz, validateQuizDocumentInput } from "@/lib/quiz/db";

export async function GET() {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const quizzes = await listQuizzes();

  return NextResponse.json({
    ok: true,
    quizzes: quizzes.map((quiz) => ({
      ...quiz,
      _id: quiz._id.toString(),
    })),
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

  await ensureQuizIndexes();
  const quizzes = await getQuizzesCollection();
  const now = new Date();

  const result = await quizzes.insertOne({
    ...validation.quiz,
    isActive: false,
    createdAt: now,
    updatedAt: now,
  });

  if (validation.quiz.isActive) {
    await setActiveQuiz(result.insertedId.toString(), true);
  }

  return NextResponse.json({ ok: true, quizId: result.insertedId.toString() }, { status: 201 });
}
