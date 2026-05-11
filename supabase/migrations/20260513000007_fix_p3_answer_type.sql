-- ==========================================================
-- Numoria Challenge — Migration 0017: UX fix Contest #1 D-E P3
--
-- E2E test (2026-05-11) reveló UX flaw:
--   P3 (Geometría plana) pedía la respuesta como `with_units` = "44 cm²"
--   pero el enunciado ya dice "...¿Cuál es el área..., en cm²?".
--   Los kids 8-14 no pueden tipear "²" (superíndice unicode) sin pelearse
--   con el teclado, y la unidad es REDUNDANTE porque el enunciado la fija.
--
-- Convención post-fix:
--   - `with_units` SOLO para problemas donde la unidad discrimina la
--     respuesta (ej. "¿Cuánto mide? 1500 cm vs 15 m vs 0.015 km").
--   - Si el enunciado dice "responde en X", usar `integer`/`decimal_cents`/etc
--     + `format_directive` opcional que recuerde la unidad.
--
-- Cambios:
--   1. P3 schema: answer_type=integer, expected_answer="44",
--      format_directive_es/en con la pista textual.
--   2. Re-score problem_attempts del histórico (cualquier student que
--      respondió "44" ahora cuenta correcto).
--   3. Re-agregar total_score + total_correct en contest_attempts afectados.
-- ==========================================================

-- 1. Update P3 schema
update public.problems
   set answer_type         = 'integer',
       expected_answer     = '44',
       format_directive_es = 'Solo el número (en cm²).',
       format_directive_en = 'Just the number (in cm²).'
 where slug = 'numoria-c1e-p3-geometria-rectangulo-cuadrado';

-- 2. Re-score problem_attempts: cualquiera que envió "44" (con o sin
--    espacios al frente/final) ahora es correcto.
update public.problem_attempts
   set is_correct    = true,
       points_earned = 2
 where problem_id = (select id from public.problems
                      where slug = 'numoria-c1e-p3-geometria-rectangulo-cuadrado')
   and trim(answer_submitted) = '44';

-- 3. Re-agregar total_score y total_correct en contest_attempts que
--    tenían un problem_attempt afectado por el cambio.
update public.contest_attempts ca
   set total_score   = (select coalesce(sum(points_earned), 0)
                          from public.problem_attempts
                         where contest_attempt_id = ca.id),
       total_correct = (select count(*)
                          from public.problem_attempts
                         where contest_attempt_id = ca.id
                           and is_correct = true)
 where ca.id in (
   select pa.contest_attempt_id
     from public.problem_attempts pa
     join public.problems p on p.id = pa.problem_id
    where p.slug = 'numoria-c1e-p3-geometria-rectangulo-cuadrado'
 );
