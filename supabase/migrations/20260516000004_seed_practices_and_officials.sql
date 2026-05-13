-- ==========================================================
-- Numoria Challenge — Migration 0023: Seed practices + officials
--
-- Phase 4.5a — crea infraestructura completa de contests para soft launch:
--
--   5 PRÁCTICAS × 3 versiones (E sin-calc, M sin-calc, M con-calc) = 15 contests
--   3 OFICIALES × 3 versiones × 3 fechas = 9 contests
--   Total: 24 contests
--
-- Practice #1 (3 contests) viene fully populated con 21 problemas bilingues.
-- Las demás 23 vienen como SHELLS (status='draft', sin problemas) — autoring
-- progresivo en sesiones futuras (ver memory: soft-launch-plan.md).
--
-- Fechas oficiales (calendar_window_days=30):
--   Official #1 — 15 Jun 2026
--   Official #2 — 30 Jun 2026
--   Official #3 — 15 Jul 2026
--
-- Practices: scheduled_at = ahora, calendar_window_days = 365 (siempre disponibles)
-- ==========================================================

-- ============================================================
-- 5 PRACTICES × 3 VERSIONES = 15 contest shells
-- ============================================================
insert into public.contests (
  slug, contest_number, season_year, division,
  title_es, title_en,
  scheduled_at, duration_minutes, calendar_window_days,
  calculator_allowed,
  contest_type,
  status
) values
-- Practice #1
  ('numoria-p1e-2026', 1, 2026, 'elementary',
   'Práctica #1 — División E (sin calculadora)', 'Practice #1 — Division E (no calculator)',
   '2026-05-12T00:00:00Z', 35, 365, false, 'practice', 'active'),
  ('numoria-p1m-2026', 1, 2026, 'middle',
   'Práctica #1 — División M (sin calculadora)', 'Practice #1 — Division M (no calculator)',
   '2026-05-12T00:00:00Z', 35, 365, false, 'practice', 'active'),
  ('numoria-p1mc-2026', 1, 2026, 'middle',
   'Práctica #1 — División M (con calculadora)', 'Practice #1 — Division M (with calculator)',
   '2026-05-12T00:00:00Z', 35, 365, true, 'practice', 'active'),

-- Practice #2 (shells - status draft hasta autoring)
  ('numoria-p2e-2026', 2, 2026, 'elementary',
   'Práctica #2 — División E (sin calculadora)', 'Practice #2 — Division E (no calculator)',
   '2026-05-12T00:00:00Z', 35, 365, false, 'practice', 'draft'),
  ('numoria-p2m-2026', 2, 2026, 'middle',
   'Práctica #2 — División M (sin calculadora)', 'Practice #2 — Division M (no calculator)',
   '2026-05-12T00:00:00Z', 35, 365, false, 'practice', 'draft'),
  ('numoria-p2mc-2026', 2, 2026, 'middle',
   'Práctica #2 — División M (con calculadora)', 'Practice #2 — Division M (with calculator)',
   '2026-05-12T00:00:00Z', 35, 365, true, 'practice', 'draft'),

-- Practice #3
  ('numoria-p3e-2026', 3, 2026, 'elementary',
   'Práctica #3 — División E (sin calculadora)', 'Practice #3 — Division E (no calculator)',
   '2026-05-12T00:00:00Z', 35, 365, false, 'practice', 'draft'),
  ('numoria-p3m-2026', 3, 2026, 'middle',
   'Práctica #3 — División M (sin calculadora)', 'Practice #3 — Division M (no calculator)',
   '2026-05-12T00:00:00Z', 35, 365, false, 'practice', 'draft'),
  ('numoria-p3mc-2026', 3, 2026, 'middle',
   'Práctica #3 — División M (con calculadora)', 'Practice #3 — Division M (with calculator)',
   '2026-05-12T00:00:00Z', 35, 365, true, 'practice', 'draft'),

-- Practice #4
  ('numoria-p4e-2026', 4, 2026, 'elementary',
   'Práctica #4 — División E (sin calculadora)', 'Practice #4 — Division E (no calculator)',
   '2026-05-12T00:00:00Z', 35, 365, false, 'practice', 'draft'),
  ('numoria-p4m-2026', 4, 2026, 'middle',
   'Práctica #4 — División M (sin calculadora)', 'Practice #4 — Division M (no calculator)',
   '2026-05-12T00:00:00Z', 35, 365, false, 'practice', 'draft'),
  ('numoria-p4mc-2026', 4, 2026, 'middle',
   'Práctica #4 — División M (con calculadora)', 'Practice #4 — Division M (with calculator)',
   '2026-05-12T00:00:00Z', 35, 365, true, 'practice', 'draft'),

-- Practice #5
  ('numoria-p5e-2026', 5, 2026, 'elementary',
   'Práctica #5 — División E (sin calculadora)', 'Practice #5 — Division E (no calculator)',
   '2026-05-12T00:00:00Z', 35, 365, false, 'practice', 'draft'),
  ('numoria-p5m-2026', 5, 2026, 'middle',
   'Práctica #5 — División M (sin calculadora)', 'Practice #5 — Division M (no calculator)',
   '2026-05-12T00:00:00Z', 35, 365, false, 'practice', 'draft'),
  ('numoria-p5mc-2026', 5, 2026, 'middle',
   'Práctica #5 — División M (con calculadora)', 'Practice #5 — Division M (with calculator)',
   '2026-05-12T00:00:00Z', 35, 365, true, 'practice', 'draft'),

-- ============================================================
-- 3 OFFICIAL × 3 VERSIONES = 9 contest shells
-- Dates: 15 Jun, 30 Jun, 15 Jul 2026
-- ============================================================
  ('numoria-c1e-jun15-2026', 1, 2026, 'elementary',
   'Contest #1 — División E (15 Jun 2026)', 'Contest #1 — Division E (Jun 15, 2026)',
   '2026-06-15T14:00:00Z', 35, 30, false, 'official', 'draft'),
  ('numoria-c1m-jun15-2026', 1, 2026, 'middle',
   'Contest #1 — División M (15 Jun 2026)', 'Contest #1 — Division M (Jun 15, 2026)',
   '2026-06-15T14:00:00Z', 35, 30, false, 'official', 'draft'),
  ('numoria-c1mc-jun15-2026', 1, 2026, 'middle',
   'Contest #1 — División M con calc (15 Jun 2026)', 'Contest #1 — Division M with calc (Jun 15, 2026)',
   '2026-06-15T14:00:00Z', 35, 30, true, 'official', 'draft'),

  ('numoria-c2e-jun30-2026', 2, 2026, 'elementary',
   'Contest #2 — División E (30 Jun 2026)', 'Contest #2 — Division E (Jun 30, 2026)',
   '2026-06-30T14:00:00Z', 35, 30, false, 'official', 'draft'),
  ('numoria-c2m-jun30-2026', 2, 2026, 'middle',
   'Contest #2 — División M (30 Jun 2026)', 'Contest #2 — Division M (Jun 30, 2026)',
   '2026-06-30T14:00:00Z', 35, 30, false, 'official', 'draft'),
  ('numoria-c2mc-jun30-2026', 2, 2026, 'middle',
   'Contest #2 — División M con calc (30 Jun 2026)', 'Contest #2 — Division M with calc (Jun 30, 2026)',
   '2026-06-30T14:00:00Z', 35, 30, true, 'official', 'draft'),

  ('numoria-c3e-jul15-2026', 3, 2026, 'elementary',
   'Contest #3 — División E (15 Jul 2026)', 'Contest #3 — Division E (Jul 15, 2026)',
   '2026-07-15T14:00:00Z', 35, 30, false, 'official', 'draft'),
  ('numoria-c3m-jul15-2026', 3, 2026, 'middle',
   'Contest #3 — División M (15 Jul 2026)', 'Contest #3 — Division M (Jul 15, 2026)',
   '2026-07-15T14:00:00Z', 35, 30, false, 'official', 'draft'),
  ('numoria-c3mc-jul15-2026', 3, 2026, 'middle',
   'Contest #3 — División M con calc (15 Jul 2026)', 'Contest #3 — Division M with calc (Jul 15, 2026)',
   '2026-07-15T14:00:00Z', 35, 30, true, 'official', 'draft');
