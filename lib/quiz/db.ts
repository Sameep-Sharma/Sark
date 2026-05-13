import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { ObjectId, type Collection, type WithId } from "mongodb";

import { getQuizDb } from "@/lib/auth/mongodb";
import type { QuizPayload, QuizQuestionWithAnswer, ResultInvite } from "./types";

export const QUIZZES_COLLECTION = "quizzes";
export const QUIZ_SUBMISSIONS_COLLECTION = "quiz-submissions";

export type QuizDocument = {
  name: string;
  config: Omit<QuizPayload["config"], "totalQuestions">;
  questions: QuizQuestionWithAnswer[];
  resultInvite: ResultInvite;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type QuizSubmissionDocument = {
  quizId: ObjectId;
  quizName: string;
  userId: ObjectId;
  answers: Record<string, string>;
  score: number;
  correctCount: number;
  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;
  timetaken: number;
  startedAt: Date;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

type LegacyQuizData = Omit<QuizPayload, "id" | "questions" | "isActive"> & {
  questions: QuizQuestionWithAnswer[];
};

export type Quiz = WithId<QuizDocument>;
export type QuizSubmissionResult = WithId<QuizSubmissionDocument>;

let quizIndexesPromise: Promise<void> | null = null;
let submissionIndexesPromise: Promise<void> | null = null;
let defaultQuizPromise: Promise<void> | null = null;

export async function getQuizzesCollection(): Promise<Collection<QuizDocument>> {
  const db = await getQuizDb();

  return db.collection<QuizDocument>(QUIZZES_COLLECTION);
}

export async function getQuizSubmissionsCollection(): Promise<Collection<QuizSubmissionDocument>> {
  const db = await getQuizDb();

  return db.collection<QuizSubmissionDocument>(QUIZ_SUBMISSIONS_COLLECTION);
}

export async function ensureQuizIndexes() {
  if (!quizIndexesPromise) {
    quizIndexesPromise = getQuizzesCollection().then(async (collection) => {
      await Promise.all([collection.createIndex({ isActive: 1 }), collection.createIndex({ name: 1 })]);
    });
  }

  return quizIndexesPromise;
}

export async function ensureQuizSubmissionIndexes() {
  if (!submissionIndexesPromise) {
    submissionIndexesPromise = getQuizSubmissionsCollection().then(async (collection) => {
      await Promise.all([
        collection.createIndex({ quizId: 1, score: -1, timetaken: 1 }),
        collection.createIndex({ userId: 1, quizId: 1 }, { unique: true }),
      ]);
    });
  }

  return submissionIndexesPromise;
}

export async function ensureDefaultQuiz() {
  if (defaultQuizPromise) {
    return defaultQuizPromise;
  }

  defaultQuizPromise = seedDefaultQuizIfNeeded();
  return defaultQuizPromise;
}

async function seedDefaultQuizIfNeeded() {
  const quizzes = await getQuizzesCollection();
  const existingCount = await quizzes.estimatedDocumentCount();

  if (existingCount > 0) {
    return;
  }

  const filePath = path.join(process.cwd(), "data", "quiz.json");
  const file = await readFile(filePath, "utf8");
  const legacyQuiz = JSON.parse(file) as LegacyQuizData;
  const now = new Date();

  await quizzes.insertOne({
    name: legacyQuiz.config.title,
    config: normalizeStoredConfig(legacyQuiz.config, legacyQuiz.config.title),
    questions: legacyQuiz.questions,
    resultInvite: legacyQuiz.resultInvite,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });
}

export async function listQuizzes() {
  await ensureDefaultQuiz();
  const quizzes = await getQuizzesCollection();

  return quizzes.find({}).sort({ updatedAt: -1 }).toArray();
}

export async function listQuizSummaries() {
  await ensureDefaultQuiz();
  const quizzes = await getQuizzesCollection();

  return quizzes
    .find({})
    .project<Pick<Quiz, "_id" | "name" | "isActive">>({ _id: 1, name: 1, isActive: 1 })
    .sort({ updatedAt: -1 })
    .toArray();
}

export async function getActiveQuiz() {
  await ensureDefaultQuiz();
  const quizzes = await getQuizzesCollection();

  return quizzes.findOne({ isActive: true });
}

export function hasQuizStarted(quiz: Pick<QuizDocument, "config">) {
  const startsAt = new Date(quiz.config.startsAt);

  return Number.isNaN(startsAt.getTime()) || startsAt.getTime() <= Date.now();
}

export async function findQuizById(quizId: string) {
  if (!ObjectId.isValid(quizId)) {
    return null;
  }

  await ensureDefaultQuiz();
  const quizzes = await getQuizzesCollection();

  return quizzes.findOne({ _id: new ObjectId(quizId) });
}

export async function setActiveQuiz(quizId: string, isActive: boolean) {
  if (!ObjectId.isValid(quizId)) {
    return null;
  }

  const quizzes = await getQuizzesCollection();
  const quizObjectId = new ObjectId(quizId);
  const now = new Date();

  if (isActive) {
    await quizzes.updateMany({ _id: { $ne: quizObjectId }, isActive: true }, { $set: { isActive: false, updatedAt: now } });
  }

  const result = await quizzes.findOneAndUpdate(
    { _id: quizObjectId },
    { $set: { isActive, updatedAt: now } },
    { returnDocument: "after" },
  );

  return result;
}

export function toQuizPayload(quiz: Quiz): QuizPayload {
  return {
    id: quiz._id.toString(),
    config: {
      ...quiz.config,
      totalQuestions: quiz.questions.length,
    },
    questions: quiz.questions.map(({ answer: _answer, ...question }) => question),
    resultInvite: {
      title: quiz.resultInvite.title,
      description: quiz.resultInvite.description,
      image: false,
    },
    isActive: quiz.isActive,
  };
}

export function validateQuizDocumentInput(input: unknown): { ok: true; quiz: Omit<QuizDocument, "createdAt" | "updatedAt"> } | { ok: false; message: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, message: "Invalid quiz payload." };
  }

  const body = input as Partial<QuizDocument>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const config = body.config;
  const resultInvite = body.resultInvite;
  const inviteInput = resultInvite && typeof resultInvite === "object" && !Array.isArray(resultInvite) ? resultInvite : null;
  const questions = body.questions;

  if (!name) {
    return { ok: false, message: "Quiz name is required." };
  }

  if (!config || typeof config !== "object") {
    return { ok: false, message: "Quiz settings are required." };
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    return { ok: false, message: "Add at least one question." };
  }

  const normalizedQuestions: QuizQuestionWithAnswer[] = [];

  for (const [index, question] of questions.entries()) {
    if (!question || typeof question !== "object") {
      return { ok: false, message: `Question ${index + 1} is invalid.` };
    }

    const optionList = Array.isArray(question.options) ? question.options : [];
    const options = optionList
      .map((option) => ({
        id: typeof option.id === "string" ? option.id.trim() : "",
        label: typeof option.label === "string" ? option.label.trim() : "",
      }))
      .filter((option) => option.id && option.label);

    const answer = typeof question.answer === "string" ? question.answer.trim() : "";

    if (!question.prompt?.trim() || options.length < 2 || !options.some((option) => option.id === answer)) {
      return { ok: false, message: `Question ${index + 1} needs a prompt, at least two options, and a valid answer.` };
    }

    normalizedQuestions.push({
      id: question.id?.trim() || createSlug(question.prompt, `q${index + 1}`),
      category: question.category?.trim() || "General",
      difficulty: isDifficulty(question.difficulty) ? question.difficulty : "Core",
      prompt: question.prompt.trim(),
      description: question.description?.trim() || undefined,
      options,
      answer,
    });
  }

  const durationSeconds = Number(config.durationSeconds);

  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return { ok: false, message: "Duration must be greater than zero seconds." };
  }

  const startsAt = typeof config.startsAt === "string" ? config.startsAt.trim() : "";
  const startsAtDate = new Date(startsAt);

  if (!startsAt || Number.isNaN(startsAtDate.getTime())) {
    return { ok: false, message: "Start date and time are required." };
  }

  const normalizedConfig: Omit<QuizPayload["config"], "totalQuestions"> = {
    title: config.title?.trim() || name,
    description: config.description?.trim() || "",
    duration: formatDuration(durationSeconds),
    durationSeconds: Math.floor(durationSeconds),
    startsAt: startsAtDate.toISOString(),
    rules: Array.isArray(config.rules) ? config.rules.map((rule) => String(rule).trim()).filter(Boolean) : [],
    highlights: Array.isArray(config.highlights)
      ? config.highlights
          .map((highlight) => ({
            label: String(highlight.label ?? "").trim(),
            value: String(highlight.value ?? "").trim(),
          }))
          .filter((highlight) => highlight.label && highlight.value)
      : [],
  };

  return {
    ok: true,
    quiz: {
      name,
      config: normalizedConfig,
      questions: normalizedQuestions,
      resultInvite: {
        title: typeof inviteInput?.title === "string" ? inviteInput.title.trim() : "",
        description: typeof inviteInput?.description === "string" ? inviteInput.description.trim() : "",
        image: typeof inviteInput?.image === "string" && inviteInput.image.trim() ? inviteInput.image.trim() : false,
      },
      isActive: Boolean(body.isActive),
    },
  };
}

export function validateQuizAnswers(quiz: Quiz, answers: Record<string, string>) {
  const normalizedAnswers = Object.fromEntries(
    Object.entries(answers).filter(([questionId, optionId]) => {
      const question = quiz.questions.find((item) => item.id === questionId);

      return Boolean(question && question.options.some((option) => option.id === optionId));
    }),
  );

  const correctCount = quiz.questions.reduce((total, question) => {
    return total + (normalizedAnswers[question.id] === question.answer ? 1 : 0);
  }, 0);

  return {
    answers: normalizedAnswers,
    correctCount,
    totalQuestions: quiz.questions.length,
    answeredCount: Object.keys(normalizedAnswers).length,
    unansweredCount: quiz.questions.length - Object.keys(normalizedAnswers).length,
  };
}

function normalizeStoredConfig(config: Record<string, unknown>, fallbackTitle: string): Omit<QuizPayload["config"], "totalQuestions"> {
  const durationSeconds = Number(config.durationSeconds);
  const startsAt = typeof config.startsAt === "string" && !Number.isNaN(new Date(config.startsAt).getTime())
    ? new Date(config.startsAt).toISOString()
    : new Date().toISOString();

  return {
    title: typeof config.title === "string" && config.title.trim() ? config.title.trim() : fallbackTitle,
    description: typeof config.description === "string" ? config.description.trim() : "",
    duration: formatDuration(Number.isFinite(durationSeconds) && durationSeconds > 0 ? durationSeconds : 1080),
    durationSeconds: Number.isFinite(durationSeconds) && durationSeconds > 0 ? Math.floor(durationSeconds) : 1080,
    startsAt,
    rules: Array.isArray(config.rules) ? config.rules.map((rule) => String(rule).trim()).filter(Boolean) : [],
    highlights: Array.isArray(config.highlights)
      ? config.highlights
          .map((highlight) => ({
            label: String((highlight as { label?: unknown }).label ?? "").trim(),
            value: String((highlight as { value?: unknown }).value ?? "").trim(),
          }))
          .filter((highlight) => highlight.label && highlight.value)
      : [],
  };
}

function isDifficulty(value: unknown): value is QuizQuestionWithAnswer["difficulty"] {
  return value === "Core" || value === "Applied" || value === "Challenge";
}

function createSlug(value: string, fallback: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return slug || fallback;
}

function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));

  return `${minutes} min`;
}
