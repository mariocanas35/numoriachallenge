-- ============================================================
-- Numoria Challenge — Nuevos valores de enum
-- ============================================================
-- - contest_status 'archived': competencias de temporadas anteriores, ocultas
--   para todos menos admin (las políticas se actualizan en la migración
--   siguiente, porque un valor nuevo de enum no se puede usar en la misma
--   transacción en que se crea).
-- - answer_type 'integer_list': tres o más enteros en orden ("2,5,7").
-- - answer_type 'text_options': texto con variantes aceptadas separadas por
--   "|" ("wednesday|miercoles"), comparado sin mayúsculas ni tildes.
-- ============================================================

alter type public.contest_status add value if not exists 'archived';
alter type public.answer_type add value if not exists 'integer_list';
alter type public.answer_type add value if not exists 'text_options';
