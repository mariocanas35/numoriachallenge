-- ==========================================================
-- Numoria Challenge — Migration 0021: Team max_members default 30
--
-- Founder feedback (2026-05-12): "La maxima cantidad de estudiantes debe ser
-- de 30 por equipo. Al pasarse de 30, se debera incrementar el precio por
-- cada uno extra que se incluya. Cada equipo tendra un precio para ambos
-- papel version y online version."
--
-- Cambios:
--   - Default cambia 35 → 30 (alineado con tier base de subscription)
--   - Constraint max sigue 100 (techo absoluto)
--   - Equipos existentes con max_members=35 NO se tocan (no auto-migration
--     destructiva)
--
-- Phase 5b billing usará la diferencia (members > 30) para calcular cobro
-- adicional. Schema actual ya soporta esto.
-- ==========================================================

alter table public.teams
  alter column max_members set default 30;

comment on column public.teams.max_members is
  'Cantidad máxima de estudiantes en el equipo. Default 30 (tier base subscription). Estudiantes sobre 30 incrementan precio del team (Phase 5b billing). Techo absoluto: 100.';
