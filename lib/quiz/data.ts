import "server-only";

import type { ObjectId } from "mongodb";

import {
  findQuizById,
  getActiveQuiz,
  getQuizSubmissionsCollection,
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

export async function findQuizSubmission(userId: ObjectId, quizId: ObjectId) {
  const submissions = await getQuizSubmissionsCollection();

  return submissions.findOne({ userId, quizId });
}
