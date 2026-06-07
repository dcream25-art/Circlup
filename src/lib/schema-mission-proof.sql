-- ════════════════════════════════════════════════════════════
-- Migration : preuve de mission (anti-triche / revue admin)
-- À exécuter dans Supabase → SQL Editor
-- ════════════════════════════════════════════════════════════

ALTER TABLE missions ADD COLUMN IF NOT EXISTS proof_url text;
