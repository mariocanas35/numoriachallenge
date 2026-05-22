-- ==========================================================
-- Numoria Challenge — Migration 0032: Summer Bowl + Subscription Framework
--
-- Founder decision 2026-05-16: lanzar Summer Bowl 2026 (jun-jul, GRATIS)
-- como endurecimiento del MVP + funnel de adquisición antes de que el
-- ciclo pago empiece en agosto 2026.
--
-- 3 planes de suscripción para ciclo 2026-27:
--   - individual   ($15/año,  1 seat,   paper + acceso a material online)
--   - team_paper   ($50/año, 30 seats,  solo paper)
--   - team_online  ($90/año, 30 seats,  paper O online intercambiable por contest)
--
-- 3 Summer Bowls (jun, jul-early, jul-late) — GRATIS, reusan la tabla
-- contests vía contest_type='summer_bowl' + bowl_id FK.
--
-- Prerequisito: 20260517000004_extend_contest_type_summer_bowl.sql debe
-- estar aplicada (añade 'summer_bowl' al enum contest_type). Postgres no
-- permite usar un valor de enum recién añadido en la misma transacción.
--
-- Schema:
--   1. subscription_plans (lookup, 3 rows seeded)
--   2. subscriptions (user_id XOR team_id)
--   3. summer_bowls (agrupa 3 contests, uno por división)
--   4. bowl_registrations (signup gratis; trigger marca Founding Participant)
--   5. email_captures (lead capture para campaña agosto)
--   6. profiles.grade (4-8 — 4-5 elementary, 6-8 middle)
--   7. profiles.founding_participant_2026 (badge, auto-set por trigger)
--   8. schools.institutional_verified (gate para team_paper/team_online)
--   9. contests.bowl_id (nullable FK; solo set en contests summer_bowl)
--  10. helper function division_from_grade
-- ==========================================================

-- ============================================================
-- 1. Tabla subscription_plans (lookup, seeded)
-- ============================================================
create table if not exists public.subscription_plans (
  id text primary key check (id in ('individual', 'team_paper', 'team_online')),

  name_es text not null,
  name_en text not null,

  annual_price_usd numeric(8, 2) not null check (annual_price_usd >= 0),
  max_seats smallint not null check (max_seats between 1 and 100),

  allows_paper boolean not null,
  allows_online boolean not null,

  -- 'self_only' (individual ve solo sus stats) | 'team_and_continental' (equipo ve su tabla + ranking continental)
  stats_scope text not null check (stats_scope in ('self_only', 'team_and_continental')),

  -- Si true, requiere schools.institutional_verified=true para comprar
  requires_institutional_verification boolean not null default false,

  created_at timestamptz not null default now()
);

comment on table public.subscription_plans is
  'Catálogo de los 3 planes anuales lockeados 2026-05-16: individual $15, team_paper $50, team_online $90. Ciclo agosto-julio. Sin tier sobre 30 seats.';

-- Seed los 3 planes (idempotente)
insert into public.subscription_plans (
  id, name_es, name_en, annual_price_usd, max_seats,
  allows_paper, allows_online, stats_scope, requires_institutional_verification
) values
  ('individual',  'Individual',     'Individual',     15.00,  1, true, true,  'self_only',            false),
  ('team_paper',  'Equipo Paper',   'Team Paper',     50.00, 30, true, false, 'team_and_continental', true),
  ('team_online', 'Equipo Online',  'Team Online',    90.00, 30, true, true,  'team_and_continental', true)
on conflict (id) do nothing;

-- ============================================================
-- 2. Tabla subscriptions
-- ============================================================
create table if not exists public.subscriptions (
  id uuid primary key default extensions.uuid_generate_v4(),

  plan_id text not null references public.subscription_plans(id) on delete restrict,

  -- Exactamente uno de los dos: user_id (individual) o team_id (team plans)
  user_id uuid references public.profiles(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  check ((user_id is not null) != (team_id is not null)),

  -- Ciclo: para v1 todos son fijos agosto-julio (e.g. 2026-08-01 → 2027-07-31)
  -- Schema preparado para rolling subscriptions en el futuro.
  cycle_start date not null,
  cycle_end date not null,
  check (cycle_end > cycle_start),

  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'active', 'expired', 'cancelled')),

  payment_method text,
  payment_reference text,  -- Stripe payment_intent_id o ref local

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_user_idx on public.subscriptions(user_id) where user_id is not null;
create index subscriptions_team_idx on public.subscriptions(team_id) where team_id is not null;
create index subscriptions_status_idx on public.subscriptions(status);
create index subscriptions_cycle_idx on public.subscriptions(cycle_start, cycle_end);

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

comment on table public.subscriptions is
  'Suscripción activa de un user (individual) o team (team_paper/team_online). Ciclo fijo agosto-julio para v1; rolling preparado en schema. CHECK garantiza solo user_id O team_id.';

-- ============================================================
-- 3. Tabla summer_bowls
-- ============================================================
create table if not exists public.summer_bowls (
  id text primary key check (id ~ '^sb[0-9]+-[0-9]{4}$'),  -- 'sb1-2026', 'sb2-2026', 'sb3-2026'

  bowl_number smallint not null check (bowl_number between 1 and 10),
  year smallint not null check (year between 2026 and 2100),

  starts_at timestamptz not null,
  ends_at timestamptz not null,
  check (ends_at > starts_at),

  theme_es text,
  theme_en text,

  -- Solo admin lo ve — testing goal interno de cada bowl
  internal_testing_goal text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (bowl_number, year)
);

create index summer_bowls_window_idx on public.summer_bowls(starts_at, ends_at);

create trigger summer_bowls_set_updated_at
  before update on public.summer_bowls
  for each row execute function public.set_updated_at();

comment on table public.summer_bowls is
  'Agrupa los 3 contests (uno por división) de cada Summer Bowl. SB1=junio 2026 (E2E test), SB2=julio inicio (stats viz), SB3=julio fin (conversion). Edición Inaugural framing — nunca "beta".';

-- Seed los 3 bowls (idempotente; fechas aproximadas, founder confirmará exactas)
insert into public.summer_bowls (id, bowl_number, year, starts_at, ends_at, theme_es, theme_en, internal_testing_goal) values
  ('sb1-2026', 1, 2026,
   '2026-06-15 14:00:00+00', '2026-06-22 23:59:59+00',
   'Edición Inaugural — Bowl #1', 'Inaugural Edition — Bowl #1',
   'E2E flow validation (register → PDF/online → submit → results)'),
  ('sb2-2026', 2, 2026,
   '2026-07-01 14:00:00+00', '2026-07-08 23:59:59+00',
   'Edición Inaugural — Bowl #2', 'Inaugural Edition — Bowl #2',
   'Stats/ranking visualization (individual, team, continental)'),
  ('sb3-2026', 3, 2026,
   '2026-07-15 14:00:00+00', '2026-07-22 23:59:59+00',
   'Edición Inaugural — Bowl #3', 'Inaugural Edition — Bowl #3',
   'Conversion tracking (% click "Suscribirme al ciclo 2026-27")')
on conflict (id) do nothing;

-- ============================================================
-- 4. contests.bowl_id (nullable FK; solo set en summer_bowl contests)
-- ============================================================
alter table public.contests
  add column if not exists bowl_id text references public.summer_bowls(id) on delete restrict;

create index if not exists contests_bowl_idx on public.contests(bowl_id) where bowl_id is not null;

comment on column public.contests.bowl_id is
  'Si contest_type=summer_bowl, FK al summer_bowls.id. NULL para practice/official. Cada bowl tiene 3 contests (uno por división elementary/middle-no-calc/middle-calc).';

-- Constraint suave: si bowl_id está set, contest_type debe ser summer_bowl (y viceversa)
alter table public.contests
  add constraint contests_bowl_id_matches_type
  check (
    (bowl_id is null and contest_type != 'summer_bowl') or
    (bowl_id is not null and contest_type = 'summer_bowl')
  );

-- ============================================================
-- 5. profiles.founding_participant_2026
-- ============================================================
-- NOTA: profiles.grade ya existe desde migration 0006 (range 1-12).
-- No se redefine aquí. La inferencia a división vive en
-- division_from_grade() abajo — retorna NULL para grados fuera de 4-8,
-- lo cual la app layer interpreta como "no elegible para Summer Bowl".

alter table public.profiles
  add column if not exists founding_participant_2026 boolean not null default false;

comment on column public.profiles.grade is
  'Grado escolar del estudiante (1-12). Capturado al onboarding o al agregar student. Para Summer Bowl: 4-5=elementary, 6-8=middle (vía division_from_grade()). Grados fuera de 4-8 no son elegibles para bowls.';

comment on column public.profiles.founding_participant_2026 is
  'Badge permanente "Founding Participant 2026" — auto-set a true cuando user se registra en cualquier Summer Bowl 2026 vía trigger trg_bowl_registration_sets_founding.';

-- Helper function: división inferida del grado
create or replace function public.division_from_grade(p_grade smallint)
returns public.school_division
language sql
immutable
as $$
  select case
    when p_grade between 4 and 5 then 'elementary'::public.school_division
    when p_grade between 6 and 8 then 'middle'::public.school_division
    else null
  end;
$$;

comment on function public.division_from_grade(smallint) is
  'Mapea grado escolar → división. 4-5=elementary, 6-8=middle. Retorna NULL para grados fuera de rango.';

-- ============================================================
-- 6. schools.institutional_verified
-- ============================================================
alter table public.schools
  add column if not exists institutional_verified boolean not null default false;

alter table public.schools
  add column if not exists verified_at timestamptz;

alter table public.schools
  add column if not exists verified_by uuid references public.profiles(id) on delete set null;

comment on column public.schools.institutional_verified is
  'Si true, la escuela puede comprar suscripciones team_paper/team_online. Decision 2026-05-16: requerido para prevenir canibalización Individual ↔ Team Paper. Verificación inicial vía dominio del website o aprobación manual de admin.';

-- ============================================================
-- 7. Tabla bowl_registrations + trigger Founding Participant
-- ============================================================
create table if not exists public.bowl_registrations (
  id uuid primary key default extensions.uuid_generate_v4(),

  bowl_id text not null references public.summer_bowls(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,

  -- División a la que se registra (inferida del grado pero almacenada explícita
  -- por si user cambia de grado entre bowls)
  division public.school_division not null,

  -- Para Middle: si va a la variante con calculadora o sin
  calculator_variant boolean not null default false,

  registered_at timestamptz not null default now(),

  unique (bowl_id, user_id)
);

create index bowl_registrations_bowl_idx on public.bowl_registrations(bowl_id);
create index bowl_registrations_user_idx on public.bowl_registrations(user_id);

comment on table public.bowl_registrations is
  'Inscripción gratis de un user a un Summer Bowl. UNIQUE (bowl_id, user_id) garantiza una inscripción por bowl. Trigger marca founding_participant_2026=true en profiles.';

-- Trigger: al inscribirse a un bowl, marca el badge Founding Participant
create or replace function public.set_founding_participant_on_bowl_registration()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
    set founding_participant_2026 = true
    where id = new.user_id
      and founding_participant_2026 = false;  -- idempotent, evita update innecesario
  return new;
end;
$$;

create trigger trg_bowl_registration_sets_founding
  after insert on public.bowl_registrations
  for each row execute function public.set_founding_participant_on_bowl_registration();

-- ============================================================
-- 8. Tabla email_captures (lead capture para campaña agosto)
-- ============================================================
create table if not exists public.email_captures (
  id uuid primary key default extensions.uuid_generate_v4(),

  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),

  -- Fuente del lead — segmenta la campaña posterior
  source text not null check (length(trim(source)) between 1 and 50),

  -- Datos opcionales (nombre, escuela, país, role, etc.)
  metadata jsonb not null default '{}'::jsonb,

  captured_at timestamptz not null default now()
);

create index email_captures_email_idx on public.email_captures(email);
create index email_captures_source_idx on public.email_captures(source);

comment on table public.email_captures is
  'Lead capture para campaña agosto 2026. Source segmenta (summer_bowl_landing, sb1_completed, school_form, etc.) para que la campaña use template + tono distinto por warmth del lead.';

-- ============================================================
-- 9. RLS POLICIES
-- ============================================================

-- ---------- subscription_plans (lookup, public read) ----------
alter table public.subscription_plans enable row level security;

create policy "anyone_can_view_subscription_plans"
  on public.subscription_plans for select
  to authenticated, anon
  using (true);

create policy "admins_manage_subscription_plans_insert"
  on public.subscription_plans for insert
  to authenticated
  with check (public.is_admin());

create policy "admins_manage_subscription_plans_update"
  on public.subscription_plans for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins_manage_subscription_plans_delete"
  on public.subscription_plans for delete
  to authenticated
  using (public.is_admin());

-- ---------- subscriptions ----------
alter table public.subscriptions enable row level security;

-- Users ven sus propias subscriptions
create policy "users_view_own_subscriptions"
  on public.subscriptions for select
  to authenticated
  using (user_id = auth.uid());

-- Coaches ven subscriptions de teams que coaches
create policy "coaches_view_team_subscriptions"
  on public.subscriptions for select
  to authenticated
  using (
    team_id is not null and exists (
      select 1 from public.teams t
      where t.id = subscriptions.team_id
        and t.coach_id = auth.uid()
    )
  );

create policy "admins_view_all_subscriptions"
  on public.subscriptions for select
  to authenticated
  using (public.is_admin());

-- Solo admin crea/modifica subscriptions (compra real va vía server action con service role)
create policy "admins_manage_subscriptions_insert"
  on public.subscriptions for insert
  to authenticated
  with check (public.is_admin());

create policy "admins_manage_subscriptions_update"
  on public.subscriptions for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins_manage_subscriptions_delete"
  on public.subscriptions for delete
  to authenticated
  using (public.is_admin());

-- ---------- summer_bowls (readable por todos) ----------
alter table public.summer_bowls enable row level security;

create policy "authenticated_view_summer_bowls"
  on public.summer_bowls for select
  to authenticated
  using (true);

create policy "anon_view_summer_bowls"
  on public.summer_bowls for select
  to anon
  using (true);

create policy "admins_manage_summer_bowls_insert"
  on public.summer_bowls for insert
  to authenticated
  with check (public.is_admin());

create policy "admins_manage_summer_bowls_update"
  on public.summer_bowls for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins_manage_summer_bowls_delete"
  on public.summer_bowls for delete
  to authenticated
  using (public.is_admin());

-- ---------- bowl_registrations ----------
alter table public.bowl_registrations enable row level security;

-- Users ven sus propios registros
create policy "users_view_own_bowl_registrations"
  on public.bowl_registrations for select
  to authenticated
  using (user_id = auth.uid());

create policy "admins_view_all_bowl_registrations"
  on public.bowl_registrations for select
  to authenticated
  using (public.is_admin());

-- Users se inscriben a sí mismos
create policy "users_register_self_to_bowl"
  on public.bowl_registrations for insert
  to authenticated
  with check (user_id = auth.uid());

-- Solo admin borra (no cancelación self-service en v1)
create policy "admins_delete_bowl_registrations"
  on public.bowl_registrations for delete
  to authenticated
  using (public.is_admin());

-- ---------- email_captures (insert público anon-friendly, lectura solo admin) ----------
alter table public.email_captures enable row level security;

create policy "anyone_can_capture_email"
  on public.email_captures for insert
  to authenticated, anon
  with check (true);

create policy "admins_view_email_captures"
  on public.email_captures for select
  to authenticated
  using (public.is_admin());

create policy "admins_manage_email_captures_update"
  on public.email_captures for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins_manage_email_captures_delete"
  on public.email_captures for delete
  to authenticated
  using (public.is_admin());
