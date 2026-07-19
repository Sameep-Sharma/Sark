import "server-only";

import { getSupabaseAdmin } from "@/lib/db/supabase";
import {
  findQuizById,
  getActiveQuiz,
  toQuizPayload,
  validateQuizAnswers,
  type Quiz,
} from "./db";

export async function getQuizPayload() {
  const quiz = await getActiveQuiz();

  return quiz ? toQuizPayload(quiz) : null;
}

export async function getQuizPayloadById(quizId: string) {
  const quiz = await findQuizById(quizId);

  return quiz ? toQuizPayload(quiz) : null;
}

export async function validateQuizSubmission(quiz: Quiz, answers: Record<string, string>) {
  return validateQuizAnswers(quiz, answers);
}

export async function findQuizSubmission(userId: string, quizId: string) {
  const db = getSupabaseAdmin();
  
  const { data, error } = await db
    .from("quiz_submissions")
    .select("*")
    .eq("user_id", userId)
    .eq("quiz_id", quizId)
    .maybeSingle();

  if (error) throw error;
  
  return data;
}
