-- ============================================================
-- Numoria Challenge — Seguridad: respuestas y puntajes solo desde el servidor
-- ============================================================
-- Problema 1: la política authenticated_view_published_problems deja leer
-- todas las columnas de problems, incluidas expected_answer y las
-- explicaciones. Cualquier usuario con sesión podía pedir las respuestas
-- correctas por la API REST.
--
-- Problema 2: los estudiantes podían insertar y modificar sus propios
-- contest_attempts y problem_attempts (total_score, is_correct,
-- points_earned, submitted_at...) directamente por la API REST.
--
-- Arreglo:
-- 1. authenticated solo puede leer las columnas públicas de problems.
--    expected_answer, explanation_es, explanation_en y generation_metadata
--    se leen solo en el servidor con la service role (createAdminClient),
--    después de validar quién pregunta.
--    OJO: si se agrega una columna nueva a problems, hay que darle
--    "grant select (columna)" a authenticated si la app la lee con la
--    sesión del usuario.
-- 2. anon y authenticated ya no pueden insertar ni modificar intentos.
--    Todas las escrituras pasan por las server actions de
--    apps/web/src/lib/contests/actions.ts, que validan y escriben con la
--    service role. La lectura (SELECT) y las políticas de lectura no cambian.
--
-- Orden de despliegue: primero el código que escribe con la service role,
-- después esta migración. Al revés, el sitio publicado dejaría de guardar
-- respuestas.
-- ============================================================

-- 1. problems: lectura solo de columnas públicas
revoke select on table public.problems from anon, authenticated;

grant select (
  id,
  slug,
  category,
  stars,
  division,
  title_es,
  title_en,
  body_es,
  body_en,
  answer_type,
  format_directive_es,
  format_directive_en,
  has_diagram,
  diagram_svg_url,
  diagram_caption_es,
  diagram_caption_en,
  points,
  source,
  source_year,
  generated_by_ai,
  published,
  created_at,
  updated_at
) on table public.problems to authenticated;

-- 2. intentos: sin escritura directa desde la API
revoke insert, update on table public.contest_attempts from anon, authenticated;
revoke insert, update on table public.problem_attempts from anon, authenticated;

drop policy if exists "students_create_own_contest_attempts" on public.contest_attempts;
drop policy if exists "students_update_own_contest_attempts" on public.contest_attempts;
drop policy if exists "students_create_own_problem_attempts" on public.problem_attempts;
drop policy if exists "students_update_own_problem_attempts" on public.problem_attempts;
