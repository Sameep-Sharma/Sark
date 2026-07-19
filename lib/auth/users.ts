import "server-only";

import { getSupabaseAdmin } from "@/lib/db/supabase";

// ── Raw Supabase row type ─────────────────────────────────────
type QuizUserRow = {
  id: string;
  name: string;
  usn: string;
  email: string;
  phone: string;
  password_hash: string;
  score: number | null;
  timetaken: number | null;
  latest_quiz_id: string | null;
  latest_quiz_name: string | null;
  created_at: string;
  updated_at: string;
};

// ── Domain types ─────────────────────────────────────────────
export type QuizUser = {
  id: string;
  name: string;
  usn: string;
  email: string;
  phone: string;
  passwordHash: string;
  score: number | null;
  timetaken: number | null;
  latestQuizId: string | null;
  latestQuizName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicQuizUser = Pick<
  QuizUser,
  "id" | "name" | "usn" | "email" | "phone" | "score" | "timetaken"
>;

// ── Mapper ───────────────────────────────────────────────────
function mapUserRow(row: QuizUserRow): QuizUser {
  return {
    id: row.id,
    name: row.name,
    usn: row.usn,
    email: row.email,
    phone: row.phone,
    passwordHash: row.password_hash,
    score: row.score,
    timetaken: row.timetaken,
    latestQuizId: row.latest_quiz_id,
    latestQuizName: row.latest_quiz_name,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// ── Normalisation helpers ────────────────────────────────────
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeUsn(usn: string): string {
  return usn.trim().toUpperCase();
}

// ── No-op: indexes are defined in the SQL schema ─────────────
export async function ensureQuizUserIndexes(): Promise<void> {
  // Indexes are created via supabase/schema.sql — nothing to do at runtime.
}

// ── Queries ──────────────────────────────────────────────────
export async function findQuizUserByEmail(
  email: string,
): Promise<QuizUser | null> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("quiz_users")
    .select("*")
    .eq("email", normalizeEmail(email))
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapUserRow(data as QuizUserRow);
}

export async function findQuizUserById(
  userId: string,
): Promise<QuizUser | null> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("quiz_users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapUserRow(data as QuizUserRow);
}

export async function findQuizUsersByIds(
  userIds: string[],
): Promise<QuizUser[]> {
  if (userIds.length === 0) return [];
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("quiz_users")
    .select("*")
    .in("id", userIds);

  if (error) throw error;
  return ((data ?? []) as QuizUserRow[]).map(mapUserRow);
}

// ── Mutations ─────────────────────────────────────────────────
export async function createQuizUser(input: {
  name: string;
  usn: string;
  email: string;
  phone: string;
  passwordHash: string;
}): Promise<{ id: string }> {
  const db = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data, error } = await db
    .from("quiz_users")
    .insert({
      name: input.name,
      usn: input.usn,
      email: input.email,
      phone: input.phone,
      password_hash: input.passwordHash,
      score: null,
      timetaken: null,
      created_at: now,
      updated_at: now,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data as { id: string };
}

export async function updateQuizUserScore(
  userId: string,
  update: {
    score: number;
    timetaken: number;
    latestQuizId: string;
    latestQuizName: string;
  },
): Promise<void> {
  const db = getSupabaseAdmin();
  const { error } = await db
    .from("quiz_users")
    .update({
      score: update.score,
      timetaken: update.timetaken,
      latest_quiz_id: update.latestQuizId,
      latest_quiz_name: update.latestQuizName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw error;
}
