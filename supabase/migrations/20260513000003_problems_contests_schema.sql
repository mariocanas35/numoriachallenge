-- ==========================================================
-- Numoria Challenge — Migration 0013: Problems + Contests + Attempts
--
-- Phase 3 Chunk 3.1 — Schema completo para contests al estilo ASMA.
--
-- Estructura:
-- - problems: banco de problemas reutilizables, bilingüe es/en, con
--   categoría controlada (4 tiers de frecuencia), stars 1-3, answer_type
--   tipado, format_directive opcional, diagrama opcional, tracking IA.
-- - contests: eventos timed (35 min default) con division, status lifecycle,
--   scheduled_at, calculator_allowed flag, tracking IA.
-- - contest_problems: junction ordenada (position 1-7+).
-- - contest_attempts: 1 por (student, contest) — student inicia y submite
--   el contest entero.
-- - problem_attempts: 1 por (contest_attempt, problem) — respuesta a cada
--   problema dentro del contest.
--
-- RLS:
-- - Students ven contests no-draft + sus propios attempts + sus problem_attempts
-- - Teachers ven attempts de students en sus teams
-- - Admins ven todo y curan problems/contests
-- ==========================================================

-- ============================================================
-- ENUMS
-- ============================================================

-- Categoría matemática del problema, con 4 tiers de frecuencia.
-- Las descripciones de tiers viven en metadata de admin (no en DB),
-- pero el orden refleja la prioridad recomendada en el prompt ASMA.
create type public.problem_category as enum (
  -- Tier 1: muy_frecuente (aparece casi siempre)
  'algebra',
  'number_theory',
  'plane_geometry',
  -- Tier 2: frecuente
  'counting_combinatorics',
  'probability',
  'ratios_proportions',
  'percentages',
  'rate_time_distance',
  'money',
  'statistics',
  -- Tier 3: ocasional
  'sequences_patterns',
  'logic',
  'fractions_decimals',
  'time_clocks',
  'mixtures',
  -- Tier 4: raro (máximo 1 por contest)
  'sets_venn',
  'custom_operators',
  'geometry_3d',
  'pythagoras'
);

comment on type public.problem_category is
  'Taxonomía de categorías matemáticas según prompt ASMA. 4 tiers de frecuencia (muy_frecuente, frecuente, ocasional, raro). Cada contest debe muestrear 5+ ramas distintas sin repetir.';

-- Tipo de respuesta esperada — determina cómo el server action valida
-- el submission del student y cómo el UI renderiza el input.
create type public.answer_type as enum (
  'integer',              -- "20", "146" (~55% de respuestas ASMA)
  'pair_integer',         -- "3,5" — dos enteros, "ambos requeridos"
  'pair_decimal',         -- "1.40,1.60" — dos decimales
  'fraction_simplified',  -- "3/8" — fracción en forma más simple
  'decimal_cents',        -- "1.40" — dinero, 2 decimales exactos
  'symbolic_pi',          -- "12π" — geometría con π simbólico
  'with_units',           -- "48 cm²", "40 mL" — incluye unidad
  'multiple_choice'       -- "A", "B", "C", "D", "E"
);

comment on type public.answer_type is
  'Tipo canónico de la respuesta esperada. El server action de submit normaliza el answer_submitted del student y lo compara con expected_answer según este tipo.';

-- Lifecycle del contest
create type public.contest_status as enum (
  'draft',      -- en edición por admin, invisible
  'scheduled',  -- visible con countdown, no se puede tomar todavía
  'active',     -- los students pueden tomar
  'closed'      -- terminado, solo review/practice
);

comment on type public.contest_status is
  'Lifecycle de un contest. draft → scheduled → active → closed. Las transiciones las hace admin o un cron job.';

-- ============================================================
-- TABLE: problems
-- ============================================================

create table public.problems (
  id uuid primary key default extensions.uuid_generate_v4(),

  -- Identification
  slug text unique not null
    check (slug ~ '^[a-z0-9-]+$' and length(slug) between 3 and 80),

  -- Classification
  category public.problem_category not null,
  stars smallint not null check (stars between 1 and 3),
  division public.school_division not null,

  -- Bilingual content (NUNCA mezclar idiomas en una misma columna)
  title_es text not null check (length(trim(title_es)) between 3 and 100),
  title_en text not null check (length(trim(title_en)) between 3 and 100),
  body_es text not null check (length(trim(body_es)) between 20 and 1500),
  body_en text not null check (length(trim(body_en)) between 20 and 1500),
  explanation_es text not null check (length(trim(explanation_es)) between 20 and 3000),
  explanation_en text not null check (length(trim(explanation_en)) between 20 and 3000),

  -- Answer
  answer_type public.answer_type not null,
  expected_answer text not null check (length(trim(expected_answer)) between 1 and 200),

  -- Directiva de formato ASMA (opcional, ej. "(Ambos números requeridos)")
  format_directive_es text,
  format_directive_en text,

  -- Diagrama opcional (SVG en bucket o URL externa)
  has_diagram boolean not null default false,
  diagram_svg_url text,
  diagram_caption_es text,    -- ej. "(no dibujado a escala)"
  diagram_caption_en text,    -- ej. "(not drawn to scale)"

  -- Puntos: 1 por defecto, ajustable por admin
  points smallint not null default 1 check (points between 1 and 10),

  -- Atribución
  source text,           -- "ASMA-style original", "MOEMS 2019", etc.
  source_year smallint check (source_year is null or source_year between 1980 and 2100),

  -- Tracking IA
  generated_by_ai boolean not null default false,
  generation_metadata jsonb,

  -- Lifecycle
  published boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index problems_category_idx on public.problems (category);
create index problems_stars_idx on public.problems (stars);
create index problems_division_idx on public.problems (division);
create index problems_published_idx on public.problems (published) where published = true;

create trigger problems_set_updated_at
  before update on public.problems
  for each row execute function public.set_updated_at();

comment on table public.problems is
  'Banco reutilizable de problemas. Un problema puede aparecer en múltiples contests via contest_problems. Bilingüe es/en obligatorio. Difficulty stars 1=fácil 2=medio 3=difícil con colores fijos en UI.';

comment on column public.problems.expected_answer is
  'Forma canónica de la respuesta. Para integer: "20". Para pair_integer/pair_decimal: "a,b" (comma-separated, sin espacios). Para fraction_simplified: "3/8". Para multiple_choice: "A". El server action normaliza la respuesta del student antes de comparar.';

comment on column public.problems.format_directive_es is
  'Directiva ASMA opcional en español, ej. "(Ambos números requeridos)". Se muestra en cursiva debajo del enunciado.';

-- ============================================================
-- TABLE: contests
-- ============================================================

create table public.contests (
  id uuid primary key default extensions.uuid_generate_v4(),

  -- Identification
  slug text unique not null check (slug ~ '^[a-z0-9-]+$'),
  contest_number smallint not null check (contest_number between 1 and 20),
  -- Año del ciclo escolar. Numoria corre 7 contests/año/división:
  --   #1 noviembre, #2 diciembre, #3 enero, #4 febrero, #5 marzo,
  --   #6 abril, #7 summer special (julio/agosto)
  -- season_year permite repetir #1, #2, etc. en años subsiguientes.
  season_year smallint not null check (season_year between 2020 and 2100),

  -- Classification
  division public.school_division not null,

  -- Bilingual title
  title_es text not null check (length(trim(title_es)) between 3 and 100),
  title_en text not null check (length(trim(title_en)) between 3 and 100),

  -- Timing
  scheduled_at timestamptz not null,
  duration_minutes smallint not null default 35
    check (duration_minutes between 5 and 120),

  -- Settings
  calculator_allowed boolean not null default true,

  -- Tracking IA
  generated_by_ai boolean not null default false,
  generation_metadata jsonb,

  -- Lifecycle
  status public.contest_status not null default 'draft',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- (contest_number, division, season_year) único garantiza ciclos anuales
  -- Ej. Contest #1 Division E 2026 ≠ Contest #1 Division E 2027
  unique (contest_number, division, season_year)
);

create index contests_status_idx on public.contests (status);
create index contests_division_status_idx on public.contests (division, status);
create index contests_scheduled_idx on public.contests (scheduled_at)
  where status in ('scheduled', 'active');
create index contests_season_division_idx on public.contests (season_year, division);

create trigger contests_set_updated_at
  before update on public.contests
  for each row execute function public.set_updated_at();

comment on table public.contests is
  'Numoria Challenge Contest. Eventos timed de 35 min, 7 problemas ordenados via contest_problems, dificultad ★→★★★. Cadencia: 7 contests/año/división (6 oficiales + summer special), agrupados por season_year. División E (4°-6°) o M (6°-8°). El teacher asigna la división al crear su team.';

-- ============================================================
-- TABLE: contest_problems (junction ordenada)
-- ============================================================

create table public.contest_problems (
  contest_id uuid not null references public.contests(id) on delete cascade,
  problem_id uuid not null references public.problems(id) on delete restrict,
  position smallint not null check (position between 1 and 20),

  primary key (contest_id, position),
  unique (contest_id, problem_id)
);

create index contest_problems_problem_idx on public.contest_problems (problem_id);

comment on table public.contest_problems is
  'Asociación ordenada problemas↔contest. Position 1-7 para contests ASMA estándar. Garantía: un problema no se repite dentro del mismo contest.';

-- ============================================================
-- TABLE: contest_attempts (1 por student por contest)
-- ============================================================

create table public.contest_attempts (
  id uuid primary key default extensions.uuid_generate_v4(),

  contest_id uuid not null references public.contests(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,

  started_at timestamptz not null default now(),
  submitted_at timestamptz,   -- null = en progreso

  -- Scores (recalculados por trigger al insertar/actualizar problem_attempts)
  total_score smallint not null default 0,
  total_correct smallint not null default 0,
  max_possible_score smallint not null default 0,

  -- Time tracking
  time_spent_seconds integer
    check (time_spent_seconds is null or time_spent_seconds >= 0),

  unique (contest_id, student_id)
);

create index contest_attempts_student_idx on public.contest_attempts (student_id);
create index contest_attempts_contest_idx on public.contest_attempts (contest_id);
create index contest_attempts_submitted_idx on public.contest_attempts (submitted_at)
  where submitted_at is not null;

comment on table public.contest_attempts is
  'Un attempt = un student tomando un contest. Constraint unique garantiza 1 attempt máximo por (contest, student). submitted_at=null significa "en progreso".';

-- ============================================================
-- TABLE: problem_attempts (1 por contest_attempt por problem)
-- ============================================================

create table public.problem_attempts (
  id uuid primary key default extensions.uuid_generate_v4(),

  contest_attempt_id uuid not null references public.contest_attempts(id) on delete cascade,
  problem_id uuid not null references public.problems(id) on delete restrict,

  -- La respuesta
  answer_submitted text,
  is_correct boolean,
  points_earned smallint not null default 0 check (points_earned >= 0),

  -- Timing por problema (opcional, para analytics)
  answered_at timestamptz,
  time_spent_seconds integer
    check (time_spent_seconds is null or time_spent_seconds >= 0),

  unique (contest_attempt_id, problem_id)
);

create index problem_attempts_attempt_idx on public.problem_attempts (contest_attempt_id);
create index problem_attempts_problem_idx on public.problem_attempts (problem_id);

comment on table public.problem_attempts is
  'Respuesta del student a un problema específico dentro de un contest_attempt. is_correct y points_earned los calcula el server action al recibir el answer_submitted, comparándolo con problems.expected_answer.';

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- ---------- problems ----------
alter table public.problems enable row level security;

create policy "authenticated_view_published_problems"
  on public.problems for select
  to authenticated
  using (published = true or public.is_admin());

create policy "admins_insert_problems"
  on public.problems for insert
  to authenticated
  with check (public.is_admin());

create policy "admins_update_problems"
  on public.problems for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins_delete_problems"
  on public.problems for delete
  to authenticated
  using (public.is_admin());

-- ---------- contests ----------
alter table public.contests enable row level security;

create policy "authenticated_view_non_draft_contests"
  on public.contests for select
  to authenticated
  using (status != 'draft' or public.is_admin());

create policy "admins_insert_contests"
  on public.contests for insert
  to authenticated
  with check (public.is_admin());

create policy "admins_update_contests"
  on public.contests for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins_delete_contests"
  on public.contests for delete
  to authenticated
  using (public.is_admin());

-- ---------- contest_problems ----------
alter table public.contest_problems enable row level security;

create policy "authenticated_view_contest_problems"
  on public.contest_problems for select
  to authenticated
  using (
    exists (
      select 1 from public.contests
      where id = contest_problems.contest_id
        and (status != 'draft' or public.is_admin())
    )
  );

create policy "admins_manage_contest_problems_insert"
  on public.contest_problems for insert
  to authenticated
  with check (public.is_admin());

create policy "admins_manage_contest_problems_update"
  on public.contest_problems for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins_manage_contest_problems_delete"
  on public.contest_problems for delete
  to authenticated
  using (public.is_admin());

-- ---------- contest_attempts ----------
alter table public.contest_attempts enable row level security;

-- Students ven sus propios attempts
create policy "students_view_own_contest_attempts"
  on public.contest_attempts for select
  to authenticated
  using (student_id = auth.uid());

-- Teachers ven attempts de students en sus teams
create policy "teachers_view_team_contest_attempts"
  on public.contest_attempts for select
  to authenticated
  using (
    exists (
      select 1 from public.team_members tm
      join public.teams t on t.id = tm.team_id
      where tm.student_id = contest_attempts.student_id
        and t.coach_id = auth.uid()
    )
  );

create policy "admins_view_all_contest_attempts"
  on public.contest_attempts for select
  to authenticated
  using (public.is_admin());

-- Students inician sus propios attempts
create policy "students_create_own_contest_attempts"
  on public.contest_attempts for insert
  to authenticated
  with check (student_id = auth.uid());

-- Students actualizan sus propios attempts (ej. para submit)
-- Las reglas de negocio (ventana de tiempo, status del contest) las valida
-- el server action submitContestAttempt, no RLS.
create policy "students_update_own_contest_attempts"
  on public.contest_attempts for update
  to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

-- ---------- problem_attempts ----------
alter table public.problem_attempts enable row level security;

create policy "students_view_own_problem_attempts"
  on public.problem_attempts for select
  to authenticated
  using (
    exists (
      select 1 from public.contest_attempts
      where id = problem_attempts.contest_attempt_id
        and student_id = auth.uid()
    )
  );

create policy "teachers_view_team_problem_attempts"
  on public.problem_attempts for select
  to authenticated
  using (
    exists (
      select 1 from public.contest_attempts ca
      join public.team_members tm on tm.student_id = ca.student_id
      join public.teams t on t.id = tm.team_id
      where ca.id = problem_attempts.contest_attempt_id
        and t.coach_id = auth.uid()
    )
  );

create policy "admins_view_all_problem_attempts"
  on public.problem_attempts for select
  to authenticated
  using (public.is_admin());

create policy "students_create_own_problem_attempts"
  on public.problem_attempts for insert
  to authenticated
  with check (
    exists (
      select 1 from public.contest_attempts
      where id = problem_attempts.contest_attempt_id
        and student_id = auth.uid()
    )
  );

create policy "students_update_own_problem_attempts"
  on public.problem_attempts for update
  to authenticated
  using (
    exists (
      select 1 from public.contest_attempts
      where id = problem_attempts.contest_attempt_id
        and student_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.contest_attempts
      where id = problem_attempts.contest_attempt_id
        and student_id = auth.uid()
    )
  );
