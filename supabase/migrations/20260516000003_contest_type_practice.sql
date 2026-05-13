-- ==========================================================
-- Numoria Challenge — Migration 0022: Contest type (practice vs official)
--
-- Phase 4.5a — separar tests de práctica (siempre disponibles, demo
-- para escuelas) de contests oficiales (con fechas + ranking).
--
-- Use cases:
--   - 'practice': 5 prácticas × 3 versiones (E sin-calc, M sin-calc, M con-calc)
--     = 15 contests siempre disponibles para que escuelas demoeen el sistema
--     antes del soft launch.
--   - 'official': 3 contests oficiales (15 Jun, 30 Jun, 15 Jul 2026) × 3 versiones
--     = 9 contests con fechas reales y ranking nacional.
--
-- Default 'official' — backward compat con seed actual (Contest #1 D-E,
-- Contest #2 D-M creados como official).
-- ==========================================================

create type public.contest_type as enum (
  'practice',   -- Tests de práctica siempre disponibles
  'official'    -- Contests oficiales con fechas + ranking
);

alter table public.contests
  add column contest_type public.contest_type not null default 'official';

create index contests_type_idx on public.contests(contest_type);

comment on type public.contest_type is
  'Tipo de contest: practice (siempre disponible, demo) o official (con calendario + ranking nacional).';
comment on column public.contests.contest_type is
  'Diferencia practices de oficiales. Phase 4.5 soft launch crea 5 practices + 3 oficiales.';
