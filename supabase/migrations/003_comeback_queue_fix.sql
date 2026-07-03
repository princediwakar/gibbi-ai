-- Migration: Fix comeback_queue_items.question_id type + add calibration admin
-- question_id was number but session questions use UUID strings

ALTER TABLE comeback_queue_items 
  ALTER COLUMN question_id TYPE text USING question_id::text;

-- Add indexes for comeback queue queries
CREATE INDEX IF NOT EXISTS idx_comeback_queue_user_due 
  ON comeback_queue_items(user_id, cleared, stage_deadline);
CREATE INDEX IF NOT EXISTS idx_comeback_queue_session 
  ON comeback_queue_items(original_session_id);

-- Add predictor_sessions to generated types will be picked up on next `supabase gen types`
