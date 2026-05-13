-- ==========================================================
-- Numoria Challenge — Migration 0026: Unique constraint incluye calculator
--
-- Bug encontrado al re-aplicar migration 0023 (después del fix de migration
-- 0025 que agregó contest_type al constraint):
--
-- ERROR: 23505: duplicate key value violates unique constraint
-- "contests_contest_number_division_season_year_type_key"
-- DETAIL: Key (contest_number, division, season_year, contest_type)=
--         (1, middle, 2026, practice) already exists.
--
-- Causa: Practice #1 D-M tiene 2 variantes:
--   - numoria-p1m-2026  (sin calculadora)
--   - numoria-p1mc-2026 (con calculadora)
--
-- Ambas tienen (contest_number=1, division=middle, season_year=2026,
-- contest_type=practice) — solo se distinguen por calculator_allowed.
--
-- Fix: agregar calculator_allowed al unique constraint.
-- Ahora cada uno de los 3 variantes posibles por contest_number es único:
--   - (E, false) — Elementary sin calc
--   - (M, false) — Middle sin calc
--   - (M, true)  — Middle con calc
--
-- Y se distinguen entre practice/official por contest_type.
-- Total: 6 variantes posibles por (contest_number, season_year).
-- ==========================================================

alter table public.contests
  drop constraint if exists contests_contest_number_division_season_year_type_key;

alter table public.contests
  add constraint contests_unique_per_variant
  unique (contest_number, division, season_year, contest_type, calculator_allowed);

comment on constraint contests_unique_per_variant on public.contests is
  'Unique 5-tuple. Permite hasta 6 variantes por (contest_number, season_year): E sin-calc, M sin-calc, M con-calc — cada una para practice y official.';
