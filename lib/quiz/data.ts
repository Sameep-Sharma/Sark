import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import type { QuizPayload } from "./types";

type QuizDataQuestion = QuizPayload["questions"][number] & {
  answer: string;
};

export type QuizData = Omit<QuizPayload, "questions"> & {
  questions: QuizDataQuestion[];
};

async function getQuizData(): Promise<QuizData> {
  const filePath = path.join(process.cwd(), "data", "quiz.json");
  const file = await readFile(filePath, "utf8");

  return JSON.parse(file) as QuizData;
}

export async function getQuizPayload(): Promise<QuizPayload> {
  const payload = await getQuizData();

  return {
    ...payload,
    config: {
      ...payload.config,
      totalQuestions: payload.questions.length,
    },
    questions: payload.questions.map(({ answer: _answer, ...question }) => question),
  };
}

export async function validateQuizSubmission(answers: Record<string, string>) {
  const payload = await getQuizData();
  const validQuestionIds = new Set(payload.questions.map((question) => question.id));

  const normalizedAnswers = Object.fromEntries(
    Object.entries(answers).filter(([questionId, optionId]) => {
      const question = payload.questions.find((item) => item.id === questionId);

      return Boolean(question && validQuestionIds.has(questionId) && question.options.some((option) => option.id === optionId));
    }),
  );

  const correctCount = payload.questions.reduce((total, question) => {
    return total + (normalizedAnswers[question.id] === question.answer ? 1 : 0);
  }, 0);

  return {
    correctCount,
    totalQuestions: payload.questions.length,
    answeredCount: Object.keys(normalizedAnswers).length,
    unansweredCount: payload.questions.length - Object.keys(normalizedAnswers).length,
  };
}
