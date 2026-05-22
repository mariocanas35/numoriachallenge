-- ==========================================================
-- Numoria Challenge — Migration 0031b: Extender contest_type con 'summer_bowl'
--
-- Founder decision 2026-05-16: lanzar Summer Bowl 2026 (3 contests gratis
-- jun-jul) como funnel pre-ciclo pago. Esta migración SOLO añade el valor
-- al enum — el resto del framework (tablas summer_bowls, bowl_registrations,
-- subscriptions, etc.) va en la siguiente migración separada.
--
-- ⚠️  Postgres restriction: ALTER TYPE ADD VALUE no puede usarse el nuevo
-- valor en la misma transacción que lo añadió. Por eso esta migración va
-- aislada — el constraint CHECK y los inserts que referencian 'summer_bowl'
-- van en 20260518000001_summer_bowl_and_subscription_framework.sql.
-- ==========================================================

alter type public.contest_type add value if not exists 'summer_bowl';

comment on type public.contest_type is
  'Tipo de contest: practice (siempre disponible), official (con calendario + ranking pago), summer_bowl (gratis, jun-jul 2026 antes del ciclo pago).';
