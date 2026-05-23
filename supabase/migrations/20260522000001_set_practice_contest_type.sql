-- Chunk 5b.3 — Set contest_type='practice' for existing practice contests
-- Problem: Practices created before contest_type field was added don't have it set.
-- Solution: Set contest_type='practice' for all contests with "Práctica" or "Practice" in title.

UPDATE contests
SET contest_type = 'practice'
WHERE contest_type IS NULL
  AND (title_es ILIKE '%práctica%' OR title_en ILIKE '%practice%');

-- Verify the update
-- SELECT id, title_es, title_en, contest_type FROM contests WHERE contest_type = 'practice' LIMIT 5;
