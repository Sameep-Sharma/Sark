-- ============================================================
-- SARK Quiz Platform — Supabase Schema
-- Run this once in the Supabase SQL Editor for your project.
-- ============================================================

-- ── quiz_users ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_users (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name             TEXT NOT NULL,
  usn              TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT NOT NULL,
  password_hash    TEXT NOT NULL,
  score            INTEGER,
  timetaken        INTEGER,
  latest_quiz_id   TEXT,
  latest_quiz_name TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT quiz_users_email_key UNIQUE (email),
  CONSTRAINT quiz_users_usn_key   UNIQUE (usn)
);

-- ── quizzes ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quizzes (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name          TEXT NOT NULL,
  config        JSONB NOT NULL,
  questions     JSONB NOT NULL,
  result_invite JSONB NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS quizzes_is_active_idx ON quizzes (is_active);

-- ── quiz_submissions ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_submissions (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  quiz_id          TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  quiz_name        TEXT NOT NULL,
  user_id          TEXT NOT NULL REFERENCES quiz_users(id) ON DELETE CASCADE,
  answers          JSONB NOT NULL,
  score            INTEGER NOT NULL,
  correct_count    INTEGER NOT NULL,
  total_questions  INTEGER NOT NULL,
  answered_count   INTEGER NOT NULL,
  unanswered_count INTEGER NOT NULL,
  timetaken        INTEGER NOT NULL,
  started_at       TIMESTAMPTZ NOT NULL,
  submitted_at     TIMESTAMPTZ NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT quiz_submissions_user_quiz_key UNIQUE (user_id, quiz_id)
);

CREATE INDEX IF NOT EXISTS quiz_submissions_leaderboard_idx
  ON quiz_submissions (quiz_id, score DESC, timetaken ASC);

-- ── Enable Row Level Security ──────────────────────────────────
-- (Our server uses the Service Role key, which bypasses RLS,
-- but this secures the tables against anon access and clears the warning)
ALTER TABLE quiz_users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_submissions  ENABLE ROW LEVEL SECURITY;
