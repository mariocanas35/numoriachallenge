-- ==========================================================
-- Numoria Challenge — Migration 0025: Update contests unique constraint
--
-- Bug encontrado al aplicar migration 0023 (seed practices + officials):
-- el constraint `unique (contest_number, division, season_year)` no incluía
-- contest_type, por lo que Practice #1 D-E 2026 chocaba con Official Contest
-- #1 D-E 2026 (ambos contest_number=1, division=elementary, season_year=2026).
--
-- Fix: agregar contest_type al unique constraint. Ahora:
--   - Practice #1 D-E 2026 ✓ (contest_type=practice)
--   - Official Contest #1 D-E 2026 ✓ (contest_type=official)
--   - Pero NO duplicar dentro del mismo type.
--
-- Esta migration es idempotente — usa IF EXISTS / IF NOT EXISTS where posible.
-- ==========================================================

alter table public.contests
  drop constraint if exists contests_contest_number_division_season_year_key;

alter table public.contests
  add constraint contests_contest_number_division_season_year_type_key
  unique (contest_number, division, season_year, contest_type);

comment on constraint contests_contest_number_division_season_year_type_key
  on public.contests
  is 'Unique within (contest_number, division, season_year, contest_type). Permite que Practice #N y Official #N coexistan para la misma división/año.';
