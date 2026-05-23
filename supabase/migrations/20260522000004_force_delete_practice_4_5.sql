-- ==========================================================
-- Numoria Challenge — Force delete Practice #4 and #5 (if they survived)
--
-- Problem: Migration 20260517000002 tried to DELETE Practice #4 and #5
-- shells but may have failed silently due to foreign key constraints
-- (contest_attempts, contest_problems referencing them).
--
-- Solution: Cascade delete the related rows first, then delete the
-- contests themselves. Safe because Practice #4 and #5 were shells
-- (status='draft') and should not have legitimate data.
-- ==========================================================

-- Identify the contests to delete (by slug since IDs are random)
WITH targets AS (
  SELECT id FROM public.contests
  WHERE slug IN (
    'numoria-p4e-2026', 'numoria-p4m-2026', 'numoria-p4mc-2026',
    'numoria-p5e-2026', 'numoria-p5m-2026', 'numoria-p5mc-2026'
  )
)
DELETE FROM public.contest_attempts WHERE contest_id IN (SELECT id FROM targets);

WITH targets AS (
  SELECT id FROM public.contests
  WHERE slug IN (
    'numoria-p4e-2026', 'numoria-p4m-2026', 'numoria-p4mc-2026',
    'numoria-p5e-2026', 'numoria-p5m-2026', 'numoria-p5mc-2026'
  )
)
DELETE FROM public.contest_problems WHERE contest_id IN (SELECT id FROM targets);

-- Now delete the contests themselves
DELETE FROM public.contests
WHERE slug IN (
  'numoria-p4e-2026', 'numoria-p4m-2026', 'numoria-p4mc-2026',
  'numoria-p5e-2026', 'numoria-p5m-2026', 'numoria-p5mc-2026'
);
