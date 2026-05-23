-- ==========================================================
-- Numoria Challenge — Activate ALL practice contests
--
-- Problem: Practices #2 and #3 are in status='draft' since seed migration.
-- Students can't access them because:
--   1. fetchContestsListData filters with .neq('status', 'draft')
--   2. startContestAttempt requires status='active'
--
-- Decision (2026-05-22, founder): All 3 practices must be 'active' so students
-- can train freely before official competitions.
--
-- Side effect: Practice #2 and #3 may not have problems seeded yet — students
-- will see an empty contest, which is acceptable for soft launch.
-- ==========================================================

-- Activate ALL practices (regardless of current status)
UPDATE public.contests
SET status = 'active'
WHERE contest_type = 'practice'
  AND status = 'draft';

-- Also ensure contest_type is set for any contests with practice in name
-- (safety net for legacy contests without contest_type)
UPDATE public.contests
SET contest_type = 'practice'
WHERE contest_type IS NULL
  AND (title_es ILIKE '%práctica%' OR title_en ILIKE '%practice%');
