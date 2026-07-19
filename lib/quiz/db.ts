import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { getSupabaseAdmin } from "@/lib/db/supabase";
import type { QuizPayload, QuizQuestionWithAnswer, ResultInvite } from "./types";

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
  quizId: string;
  quizName: string;
  userId: string;
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

export type Quiz = QuizDocument & { id: string };
export type QuizSubmissionResult = QuizSubmissionDocument & { id: string };

let defaultQuizPromise: Promise<void> | null = null;

// ── No-ops: indexes are in SQL ──────────────────────────────
export async function ensureQuizIndexes() {
  // no-op
}

export async function ensureQuizSubmissionIndexes() {
  // no-op
}

// ── Mappers ─────────────────────────────────────────────────
function mapQuizRow(row: any): Quiz {
  return {
    id: row.id,
    name: row.name,
    config: row.config,
    questions: row.questions,
    resultInvite: row.result_invite,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// ── Seeding ─────────────────────────────────────────────────
export async function ensureDefaultQuiz() {
  if (defaultQuizPromise) {
    return defaultQuizPromise;
  }

  defaultQuizPromise = seedDefaultQuizIfNeeded();
  return defaultQuizPromise;
}

async function seedDefaultQuizIfNeeded() {
  const db = getSupabaseAdmin();
  const { count, error } = await db
    .from("quizzes")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  if (count && count > 0) return;

  const filePath = path.join(process.cwd(), "data", "quiz.json");
  const file = await readFile(filePath, "utf8");
  const legacyQuiz = JSON.parse(file) as LegacyQuizData;
  const now = new Date().toISOString();

  await db.from("quizzes").insert({
    name: legacyQuiz.config.title,
    config: normalizeStoredConfig(legacyQuiz.config, legacyQuiz.config.title),
    questions: legacyQuiz.questions,
    result_invite: legacyQuiz.resultInvite,
    is_active: true,
    created_at: now,
    updated_at: now,
  });
}

// ── Queries ─────────────────────────────────────────────────
export async function listQuizzes(): Promise<Quiz[]> {
  await ensureDefaultQuiz();
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("quizzes")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(mapQuizRow);
}

export async function listQuizSummaries(): Promise<Pick<Quiz, "id" | "name" | "isActive">[]> {
  await ensureDefaultQuiz();
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("quizzes")
    .select("id, name, is_active")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    isActive: row.is_active,
  }));
}

export async function getActiveQuiz(): Promise<Quiz | null> {
  await ensureDefaultQuiz();
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("quizzes")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapQuizRow(data);
}

export function hasQuizStarted(quiz: Pick<QuizDocument, "config">) {
  const startsAt = new Date(quiz.config.startsAt);
  return Number.isNaN(startsAt.getTime()) || startsAt.getTime() <= Date.now();
}

export async function findQuizById(quizId: string): Promise<Quiz | null> {
  await ensureDefaultQuiz();
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapQuizRow(data);
}

export async function setActiveQuiz(quizId: string, isActive: boolean): Promise<Quiz | null> {
  const db = getSupabaseAdmin();
  const now = new Date().toISOString();

  if (isActive) {
    await db
      .from("quizzes")
      .update({ is_active: false, updated_at: now })
      .neq("id", quizId)
      .eq("is_active", true);
  }

  const { data, error } = await db
    .from("quizzes")
    .update({ is_active: isActive, updated_at: now })
    .eq("id", quizId)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapQuizRow(data);
}

export function toQuizPayload(quiz: Quiz): QuizPayload {
  return {
    id: quiz.id,
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
