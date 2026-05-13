import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { getAdminSession } from "@/lib/auth/admin-session";
import { getQuizSubmissionsCollection } from "@/lib/quiz/db";

type RouteContext = {
  params: Promise<{ quizId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const { quizId } = await context.params;

  if (!ObjectId.isValid(quizId)) {
    return NextResponse.json({ ok: false, message: "Invalid quiz id." }, { status: 400 });
  }

  const submissions = await getQuizSubmissionsCollection();
  const result = await submissions.deleteMany({ quizId: new ObjectId(quizId) });

  return NextResponse.json({ ok: true, deletedCount: result.deletedCount });
}
