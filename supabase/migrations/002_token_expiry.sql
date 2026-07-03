-- Migration: Token expiry for result_cards (Sprint 7 — Viral Security)
-- Prevents seed-share leakage by expiring share links after 7 days

-- Add expires_at to result_cards
ALTER TABLE result_cards 
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Set expiry for existing cards (7 days from created_at, or now if no created_at)
UPDATE result_cards 
  SET expires_at = COALESCE(created_at, NOW()) + INTERVAL '7 days'
  WHERE expires_at IS NULL;

-- Make it non-null for future inserts
ALTER TABLE result_cards 
  ALTER COLUMN expires_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_result_cards_expires_at ON result_cards(expires_at);
