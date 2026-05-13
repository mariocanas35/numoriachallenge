-- ==========================================================
-- Numoria Challenge — Migration 0020: Contest calendar window
--
-- Founder feedback (2026-05-12): "respetando el periodo de tiempo establecido
-- por la competencia de numoria (1 mes)".
--
-- Problema: contests.duration_minutes confunde 2 conceptos:
--   1. Session duration (35 min — cuánto tiempo el student tiene para tomar)
--   2. Calendar window (1 mes — periodo oficial durante el cual el teacher
--      puede activar sesiones)
--
-- Solución: separar en 2 campos:
--   - duration_minutes (existente, UNCHANGED): SESSION duration (35 min)
--   - calendar_window_days (NEW, default 30): cuántos días el contest está
--     disponible para que teachers abran sesiones
--
-- Window oficial = [scheduled_at, scheduled_at + calendar_window_days)
-- Session window = [session.opened_at, session.opened_at + duration_minutes)
--
-- La session debe caer DENTRO de window oficial (validado en
-- openContestSession).
-- ==========================================================

alter table public.contests
  add column calendar_window_days integer not null default 30
  check (calendar_window_days between 1 and 365);

comment on column public.contests.calendar_window_days is
  'Cuántos días el contest está disponible para que teachers abran sesiones MOEMS. Default 30 (1 mes). Window oficial = [scheduled_at, scheduled_at + calendar_window_days). Cada session abierta dentro de este window dura duration_minutes (default 35).';

comment on column public.contests.duration_minutes is
  'SESSION duration (minutos) — cuánto tiempo el student tiene para tomar el contest una vez teacher abre la sesión. NO es el calendar window — eso es calendar_window_days.';
