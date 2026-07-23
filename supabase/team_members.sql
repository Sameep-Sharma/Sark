-- ============================================================
-- SARK Team Members — Supabase Schema
-- Run this in the Supabase SQL Editor for your project.
-- ============================================================

-- ── team_members ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name             TEXT NOT NULL,
  year             TEXT NOT NULL,               -- "1st Year", "2nd Year", "3rd Year", "4th Year"
  title            TEXT,                        -- role/title like "Lead Full-Stack Engineer"
  avatar_url       TEXT,                        -- Supabase Storage public URL
  banner_url       TEXT,                        -- Supabase Storage public URL
  github_url       TEXT,
  linkedin_url     TEXT,
  twitter_url      TEXT,
  portfolio_url    TEXT,
  tech_stack       TEXT[] DEFAULT '{}',         -- Array of tech names
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS team_members_year_idx ON team_members (year);

-- ── Enable Row Level Security ──────────────────────────────────
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- ── Create storage bucket for team member images ───────────────
-- Run these via Supabase Dashboard > Storage > New Bucket:
--   Bucket name: "team-avatars" (public)
--   Bucket name: "team-banners" (public)
-- Or use the API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('team-avatars', 'team-avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('team-banners', 'team-banners', true);
