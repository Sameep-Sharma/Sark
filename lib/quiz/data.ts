import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import type { QuizPayload } from "./types";

export async function getQuizPayload(): Promise<QuizPayload> {
  const filePath = path.join(process.cwd(), "data", "quiz.json");
  const file = await readFile(filePath, "utf8");
  const payload = JSON.parse(file) as QuizPayload;

  return {
    ...payload,
    config: {
      ...payload.config,
      totalQuestions: payload.questions.length,
    },
  };
}
