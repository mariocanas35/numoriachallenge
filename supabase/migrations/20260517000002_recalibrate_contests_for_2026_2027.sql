-- ==========================================================
-- Numoria Challenge — Migration 0031: Recalibrar contests para ciclo 2026-2027
--
-- Plan recalibrado por founder el 2026-05-15:
--   ANTES: 5 prácticas + 3 oficiales (Jun-Jul 2026)
--   AHORA: 3 prácticas (ya existen)  + 6 oficiales (Nov 2026 - Abr 2027)
--
-- Cambios:
--   1. Eliminar shells de Practice #4 y Practice #5 (6 contests, status=draft,
--      nunca poblados con problemas) — el nuevo plan tiene solo 3 prácticas.
--   2. Eliminar las 9 shells de oficiales viejos (Jun/Jul 2026, status=draft) —
--      cambiamos a ciclo académico Nov 2026 - Abr 2027.
--   3. Insertar 18 shells nuevas: 6 oficiales × 3 variantes (E sin-calc,
--      M sin-calc, M con-calc).
--
-- Fechas confirmadas por founder (sábados de la 1ra semana del mes,
-- excepto Contest #3 que es 2da semana de Enero):
--   Official #1 — sábado 7 Noviembre 2026
--   Official #2 — sábado 5 Diciembre 2026
--   Official #3 — sábado 10 Enero 2027 (2da semana)
--   Official #4 — sábado 7 Febrero 2027 (1ra sábado)
--   Official #5 — sábado 7 Marzo 2027
--   Official #6 — sábado 4 Abril 2027
--
-- Hora: 14:00 UTC = 8 AM Tegucigalpa / 9 AM CDMX / 10 AM Bogotá / 11 AM
-- Santiago Chile — buena ventana matutina para administración en clase.
--
-- Status='draft' para todos — el founder activará cada uno cuando esté
-- listo (con problemas generados + verificación final).
--
-- Calendar_window_days = 30 → cada oficial está abierto durante el mes
-- siguiente a su scheduled_at para que cada escuela administre en su
-- horario interno.
-- ==========================================================

-- ============================================================
-- PASO 1: Eliminar shells de Practice #4 y #5 (nuevo plan: solo 3 prácticas)
-- ============================================================
delete from public.contests
where slug in (
  'numoria-p4e-2026', 'numoria-p4m-2026', 'numoria-p4mc-2026',
  'numoria-p5e-2026', 'numoria-p5m-2026', 'numoria-p5mc-2026'
);

-- ============================================================
-- PASO 2: Eliminar shells de oficiales viejos (Jun/Jul 2026)
-- ============================================================
delete from public.contests
where slug in (
  'numoria-c1e-jun15-2026', 'numoria-c1m-jun15-2026', 'numoria-c1mc-jun15-2026',
  'numoria-c2e-jun30-2026', 'numoria-c2m-jun30-2026', 'numoria-c2mc-jun30-2026',
  'numoria-c3e-jul15-2026', 'numoria-c3m-jul15-2026', 'numoria-c3mc-jul15-2026'
);

-- ============================================================
-- PASO 3: Insertar 18 shells nuevas (6 oficiales × 3 variantes)
-- ============================================================
insert into public.contests (
  slug, contest_number, season_year, division,
  title_es, title_en,
  scheduled_at, duration_minutes, calendar_window_days,
  calculator_allowed,
  contest_type,
  status
) values
-- ---------- Contest oficial #1 — Sábado 7 Noviembre 2026 ----------
  ('numoria-c1e-nov07-2026', 1, 2026, 'elementary',
   'Contest #1 — División E (7 Nov 2026)', 'Contest #1 — Division E (Nov 7, 2026)',
   '2026-11-07T14:00:00Z', 35, 30, false, 'official', 'draft'),
  ('numoria-c1m-nov07-2026', 1, 2026, 'middle',
   'Contest #1 — División M (7 Nov 2026)', 'Contest #1 — Division M (Nov 7, 2026)',
   '2026-11-07T14:00:00Z', 35, 30, false, 'official', 'draft'),
  ('numoria-c1mc-nov07-2026', 1, 2026, 'middle',
   'Contest #1 — División M con calc (7 Nov 2026)', 'Contest #1 — Division M with calc (Nov 7, 2026)',
   '2026-11-07T14:00:00Z', 35, 30, true, 'official', 'draft'),

-- ---------- Contest oficial #2 — Sábado 5 Diciembre 2026 ----------
  ('numoria-c2e-dic05-2026', 2, 2026, 'elementary',
   'Contest #2 — División E (5 Dic 2026)', 'Contest #2 — Division E (Dec 5, 2026)',
   '2026-12-05T14:00:00Z', 35, 30, false, 'official', 'draft'),
  ('numoria-c2m-dic05-2026', 2, 2026, 'middle',
   'Contest #2 — División M (5 Dic 2026)', 'Contest #2 — Division M (Dec 5, 2026)',
   '2026-12-05T14:00:00Z', 35, 30, false, 'official', 'draft'),
  ('numoria-c2mc-dic05-2026', 2, 2026, 'middle',
   'Contest #2 — División M con calc (5 Dic 2026)', 'Contest #2 — Division M with calc (Dec 5, 2026)',
   '2026-12-05T14:00:00Z', 35, 30, true, 'official', 'draft'),

-- ---------- Contest oficial #3 — Sábado 10 Enero 2027 (2da semana) ----------
-- season_year=2027 porque ya es nuevo año académico
  ('numoria-c3e-ene10-2027', 3, 2027, 'elementary',
   'Contest #3 — División E (10 Ene 2027)', 'Contest #3 — Division E (Jan 10, 2027)',
   '2027-01-10T14:00:00Z', 35, 30, false, 'official', 'draft'),
  ('numoria-c3m-ene10-2027', 3, 2027, 'middle',
   'Contest #3 — División M (10 Ene 2027)', 'Contest #3 — Division M (Jan 10, 2027)',
   '2027-01-10T14:00:00Z', 35, 30, false, 'official', 'draft'),
  ('numoria-c3mc-ene10-2027', 3, 2027, 'middle',
   'Contest #3 — División M con calc (10 Ene 2027)', 'Contest #3 — Division M with calc (Jan 10, 2027)',
   '2027-01-10T14:00:00Z', 35, 30, true, 'official', 'draft'),

-- ---------- Contest oficial #4 — Sábado 7 Febrero 2027 ----------
  ('numoria-c4e-feb07-2027', 4, 2027, 'elementary',
   'Contest #4 — División E (7 Feb 2027)', 'Contest #4 — Division E (Feb 7, 2027)',
   '2027-02-07T14:00:00Z', 35, 30, false, 'official', 'draft'),
  ('numoria-c4m-feb07-2027', 4, 2027, 'middle',
   'Contest #4 — División M (7 Feb 2027)', 'Contest #4 — Division M (Feb 7, 2027)',
   '2027-02-07T14:00:00Z', 35, 30, false, 'official', 'draft'),
  ('numoria-c4mc-feb07-2027', 4, 2027, 'middle',
   'Contest #4 — División M con calc (7 Feb 2027)', 'Contest #4 — Division M with calc (Feb 7, 2027)',
   '2027-02-07T14:00:00Z', 35, 30, true, 'official', 'draft'),

-- ---------- Contest oficial #5 — Sábado 7 Marzo 2027 ----------
  ('numoria-c5e-mar07-2027', 5, 2027, 'elementary',
   'Contest #5 — División E (7 Mar 2027)', 'Contest #5 — Division E (Mar 7, 2027)',
   '2027-03-07T14:00:00Z', 35, 30, false, 'official', 'draft'),
  ('numoria-c5m-mar07-2027', 5, 2027, 'middle',
   'Contest #5 — División M (7 Mar 2027)', 'Contest #5 — Division M (Mar 7, 2027)',
   '2027-03-07T14:00:00Z', 35, 30, false, 'official', 'draft'),
  ('numoria-c5mc-mar07-2027', 5, 2027, 'middle',
   'Contest #5 — División M con calc (7 Mar 2027)', 'Contest #5 — Division M with calc (Mar 7, 2027)',
   '2027-03-07T14:00:00Z', 35, 30, true, 'official', 'draft'),

-- ---------- Contest oficial #6 — Sábado 4 Abril 2027 (cierre del año) ----------
  ('numoria-c6e-abr04-2027', 6, 2027, 'elementary',
   'Contest #6 — División E (4 Abr 2027)', 'Contest #6 — Division E (Apr 4, 2027)',
   '2027-04-04T14:00:00Z', 35, 30, false, 'official', 'draft'),
  ('numoria-c6m-abr04-2027', 6, 2027, 'middle',
   'Contest #6 — División M (4 Abr 2027)', 'Contest #6 — Division M (Apr 4, 2027)',
   '2027-04-04T14:00:00Z', 35, 30, false, 'official', 'draft'),
  ('numoria-c6mc-abr04-2027', 6, 2027, 'middle',
   'Contest #6 — División M con calc (4 Abr 2027)', 'Contest #6 — Division M with calc (Apr 4, 2027)',
   '2027-04-04T14:00:00Z', 35, 30, true, 'official', 'draft');
