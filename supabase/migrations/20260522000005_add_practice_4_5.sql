-- ==========================================================
-- Numoria Challenge — Add Practice #4 and #5 (3 variants each)
--
-- User request 2026-05-22: faltan 2 prácticas más para tener las 5
-- originales en cada división. Copiar los problemas de Práctica #1
-- como contenido temporal.
--
-- Cobertura: 6 nuevos contests
--   - Práctica #4 División E, M sin calc, M con calc
--   - Práctica #5 División E, M sin calc, M con calc
--
-- Problemas: copiar contest_problems desde la variante correspondiente
-- de Práctica #1 (E→E, M→M, MC→MC).
-- ==========================================================

-- ============================================================
-- PASO 1: Insertar los 6 contests nuevos (status='active' directamente)
-- ============================================================
INSERT INTO public.contests (
  slug, contest_number, season_year, division,
  title_es, title_en,
  scheduled_at, duration_minutes, calendar_window_days,
  calculator_allowed,
  contest_type,
  status
) VALUES
-- Practice #4
('numoria-p4e-2026', 4, 2026, 'elementary',
 'Práctica #4 — División E (sin calculadora)', 'Practice #4 — Division E (no calculator)',
 '2026-05-12T00:00:00Z', 35, 365, false, 'practice', 'active'),
('numoria-p4m-2026', 4, 2026, 'middle',
 'Práctica #4 — División M (sin calculadora)', 'Practice #4 — Division M (no calculator)',
 '2026-05-12T00:00:00Z', 35, 365, false, 'practice', 'active'),
('numoria-p4mc-2026', 4, 2026, 'middle',
 'Práctica #4 — División M (con calculadora)', 'Practice #4 — Division M (with calculator)',
 '2026-05-12T00:00:00Z', 35, 365, true, 'practice', 'active'),

-- Practice #5
('numoria-p5e-2026', 5, 2026, 'elementary',
 'Práctica #5 — División E (sin calculadora)', 'Practice #5 — Division E (no calculator)',
 '2026-05-12T00:00:00Z', 35, 365, false, 'practice', 'active'),
('numoria-p5m-2026', 5, 2026, 'middle',
 'Práctica #5 — División M (sin calculadora)', 'Practice #5 — Division M (no calculator)',
 '2026-05-12T00:00:00Z', 35, 365, false, 'practice', 'active'),
('numoria-p5mc-2026', 5, 2026, 'middle',
 'Práctica #5 — División M (con calculadora)', 'Practice #5 — Division M (with calculator)',
 '2026-05-12T00:00:00Z', 35, 365, true, 'practice', 'active');

-- ============================================================
-- PASO 2: Copiar problemas de Práctica #1 → Práctica #4 y #5
-- (mismo problema por variante: E→E, M→M, MC→MC)
-- ============================================================

-- p1e → p4e
INSERT INTO public.contest_problems (contest_id, problem_id, position)
SELECT
  (SELECT id FROM public.contests WHERE slug = 'numoria-p4e-2026'),
  cp.problem_id,
  cp.position
FROM public.contest_problems cp
WHERE cp.contest_id = (SELECT id FROM public.contests WHERE slug = 'numoria-p1e-2026');

-- p1e → p5e
INSERT INTO public.contest_problems (contest_id, problem_id, position)
SELECT
  (SELECT id FROM public.contests WHERE slug = 'numoria-p5e-2026'),
  cp.problem_id,
  cp.position
FROM public.contest_problems cp
WHERE cp.contest_id = (SELECT id FROM public.contests WHERE slug = 'numoria-p1e-2026');

-- p1m → p4m
INSERT INTO public.contest_problems (contest_id, problem_id, position)
SELECT
  (SELECT id FROM public.contests WHERE slug = 'numoria-p4m-2026'),
  cp.problem_id,
  cp.position
FROM public.contest_problems cp
WHERE cp.contest_id = (SELECT id FROM public.contests WHERE slug = 'numoria-p1m-2026');

-- p1m → p5m
INSERT INTO public.contest_problems (contest_id, problem_id, position)
SELECT
  (SELECT id FROM public.contests WHERE slug = 'numoria-p5m-2026'),
  cp.problem_id,
  cp.position
FROM public.contest_problems cp
WHERE cp.contest_id = (SELECT id FROM public.contests WHERE slug = 'numoria-p1m-2026');

-- p1mc → p4mc
INSERT INTO public.contest_problems (contest_id, problem_id, position)
SELECT
  (SELECT id FROM public.contests WHERE slug = 'numoria-p4mc-2026'),
  cp.problem_id,
  cp.position
FROM public.contest_problems cp
WHERE cp.contest_id = (SELECT id FROM public.contests WHERE slug = 'numoria-p1mc-2026');

-- p1mc → p5mc
INSERT INTO public.contest_problems (contest_id, problem_id, position)
SELECT
  (SELECT id FROM public.contests WHERE slug = 'numoria-p5mc-2026'),
  cp.problem_id,
  cp.position
FROM public.contest_problems cp
WHERE cp.contest_id = (SELECT id FROM public.contests WHERE slug = 'numoria-p1mc-2026');
