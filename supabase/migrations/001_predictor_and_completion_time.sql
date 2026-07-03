-- Migration: Add predictor_sessions table and completion_time_logs (for C_tier derivation)
-- Run this in Supabase SQL Editor

-- Predictor sessions table (phone OTP flow)
CREATE TABLE IF NOT EXISTS predictor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  otp_expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  exam_name TEXT NOT NULL DEFAULT 'JEE Main',
  target_date DATE NOT NULL,
  user_id TEXT,
  exam_profile_id UUID REFERENCES exam_profiles(profile_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predictor_sessions_phone_otp ON predictor_sessions(phone, otp_hash);
CREATE INDEX IF NOT EXISTS idx_predictor_sessions_user ON predictor_sessions(user_id);

-- Add phone and target_date to exam_profiles if not present
ALTER TABLE exam_profiles 
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS target_date DATE;

-- Completion time logs for deriving C_tier caps per difficulty tier
CREATE TABLE IF NOT EXISTS completion_time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  session_id UUID REFERENCES sessions(id),
  skill_domain TEXT NOT NULL,
  difficulty_tier TEXT NOT NULL CHECK (difficulty_tier IN ('foundation', 'application', 'advanced', 'expert')),
  questions_attempted INT,
  questions_correct INT,
  time_to_mastery_minutes INT, -- time from first attempt to mastery (streak >= 3)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_completion_time_user_domain ON completion_time_logs(user_id, skill_domain);
CREATE INDEX IF NOT EXISTS idx_completion_time_tier ON completion_time_logs(difficulty_tier);

-- Add calibration_source to predictions if not present
-- (already in types, but ensure column exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'predictions' AND column_name = 'calibration_source') THEN
    ALTER TABLE predictions ADD COLUMN calibration_source TEXT DEFAULT 'public_nta';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'predictions' AND column_name = 'sessions_used') THEN
    ALTER TABLE predictions ADD COLUMN sessions_used INT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'predictions' AND column_name = 'subject_breakdown') THEN
    ALTER TABLE predictions ADD COLUMN subject_breakdown JSONB;
  END IF;
END $$;

-- Add session_intent check for 'tracked' and 'quiet' (already in types, ensure DB matches)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_intent_enum') THEN
    CREATE TYPE session_intent_enum AS ENUM ('spaced_review', 'active_target', 'custom_mock', 'diagnostic', 'tracked', 'quiet');
  END IF
END $$;

ALTER TABLE sessions ALTER COLUMN session_intent TYPE session_intent_enum USING session_intent::session_intent_enum;