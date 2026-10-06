-- ============================================================
-- LeetCode Tracker — Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Table: users
-- Stores registered LeetCode users and their contact info
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leetcode_username    TEXT UNIQUE NOT NULL,
  telegram_chat_id     TEXT NOT NULL,
  notification_enabled BOOLEAN DEFAULT true,
  last_checked_at      TIMESTAMPTZ,
  total_solved         INTEGER DEFAULT 0,
  easy_solved          INTEGER DEFAULT 0,
  medium_solved        INTEGER DEFAULT 0,
  hard_solved          INTEGER DEFAULT 0,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Table: submissions
-- Tracks each accepted LeetCode submission per user
-- ============================================================
CREATE TABLE IF NOT EXISTS submissions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  leetcode_submission_id  BIGINT UNIQUE NOT NULL,
  problem_name            TEXT NOT NULL,
  problem_slug            TEXT,
  difficulty              TEXT,
  language                TEXT,
  status                  TEXT NOT NULL,
  submitted_at            TIMESTAMPTZ,
  notification_sent       BOOLEAN DEFAULT false,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_submissions_user_id
  ON submissions(user_id);

CREATE INDEX IF NOT EXISTS idx_submissions_leetcode_id
  ON submissions(leetcode_submission_id);

CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at
  ON submissions(submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_users_username
  ON users(leetcode_username);

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
