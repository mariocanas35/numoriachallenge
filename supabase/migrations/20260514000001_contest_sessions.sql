-- ==========================================================
-- Numoria Challenge — Migration 0018: Contest Sessions (MOEMS model)
--
-- Phase 4 Chunk 4.1a — fundamental product pivot:
--
-- ANTERIOR (Phase 3): Olympiad global sincronizado
--   - contests.scheduled_at = datetime global
--   - Cualquier student de la división toma cuando quiera dentro del window
--   - Sin override por teacher
--
-- AHORA (Phase 4+): MOEMS-style classroom-administered
--   - Teacher abre una "session" por team cuando quiere que su clase tome
--   - Session tiene su propio window (closes_at = opened_at + duration)
--   - Students solo ven contest como "activo" si hay session abierta para su team
--   - Teacher puede grant retry per-student dentro del session window
--   - Calendar global del contest (scheduled_at + duration) sigue siendo
--     el "outer bound" — sessions deben caer dentro
--
-- Backward compat: contest_attempts.session_id es NULLABLE. Attempts existentes
-- (Phase 3 testing) tienen session_id=NULL y son legacy. Nuevos attempts deben
-- llevar session_id (validado en server action startContestAttempt).
--
-- Refs: memory `moems-model-pivot.md`
-- ==========================================================

-- ============================================================
-- session_status enum
-- ============================================================
create type public.session_status as enum (
  'open',     -- Teacher abrió, students pueden tomar
  'closed',   -- Teacher cerró manualmente
  'expired'   -- closes_at pasó (cron job o lazy update)
);

comment on type public.session_status is
  'Estado de una contest_session. Transiciones:
    open → closed (teacher manual)
    open → expired (closes_at pasó)
    closed → (terminal)
    expired → (terminal)';

-- ============================================================
-- contest_sessions table
-- ============================================================
create table public.contest_sessions (
  id uuid primary key default gen_random_uuid(),

  -- Relaciones
  contest_id uuid not null references public.contests(id) on delete cascade,
  team_id    uuid not null references public.teams(id) on delete cascade,
  opened_by  uuid not null references public.profiles(id),

  -- Window de la session
  opened_at timestamptz not null default now(),
  closes_at timestamptz not null,
  status    public.session_status not null default 'open',

  -- Notes del teacher (ej. "Estudiante X llegó tarde, empezó al minuto 5")
  notes text,

  -- Auditoría
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.contest_sessions is
  'Sesión de contest abierta por un teacher para un team específico. Phase 4 MOEMS model.';
comment on column public.contest_sessions.opened_by is
  'Teacher (profile.id) que abrió la session. Solo este teacher (o admin) puede cerrarla.';
comment on column public.contest_sessions.closes_at is
  'Timestamp en que la session se cierra. Debe estar dentro del calendar window del contest.';
comment on column public.contest_sessions.notes is
  'Notes opcionales del teacher (incidentes, retries otorgados, contexto de clase).';

-- ============================================================
-- Índices
-- ============================================================
-- Solo UNA session 'open' por (contest, team) — partial unique
create unique index contest_sessions_one_open_per_contest_team
  on public.contest_sessions (contest_id, team_id)
  where status = 'open';

create index contest_sessions_team_idx on public.contest_sessions(team_id);
create index contest_sessions_contest_idx on public.contest_sessions(contest_id);
create index contest_sessions_status_idx on public.contest_sessions(status);
create index contest_sessions_opened_by_idx on public.contest_sessions(opened_by);

-- Trigger updated_at
create trigger contest_sessions_set_updated_at
  before update on public.contest_sessions
  for each row execute function public.set_updated_at();

-- ============================================================
-- Validación: closes_at debe estar después de opened_at
-- ============================================================
alter table public.contest_sessions
  add constraint contest_sessions_closes_after_opens
  check (closes_at > opened_at);

-- ============================================================
-- contest_attempts: agregar session_id (NULLABLE para backward compat)
-- ============================================================
alter table public.contest_attempts
  add column session_id uuid references public.contest_sessions(id) on delete cascade;

create index contest_attempts_session_idx on public.contest_attempts(session_id);

comment on column public.contest_attempts.session_id is
  'FK a contest_sessions. NULL para attempts legacy (Phase 3, pre-MOEMS). Required para attempts nuevos.';

-- ============================================================
-- RLS para contest_sessions
-- ============================================================
alter table public.contest_sessions enable row level security;

-- Teachers crean sessions SOLO para sus propios teams
create policy "teachers_open_sessions"
  on public.contest_sessions
  for insert
  with check (
    opened_by = auth.uid()
    and exists (
      select 1 from public.teams
      where id = team_id and coach_id = auth.uid()
    )
  );

-- Teachers actualizan sus propias sessions (cerrar manual, agregar notes)
create policy "teachers_update_own_sessions"
  on public.contest_sessions
  for update
  using (opened_by = auth.uid())
  with check (opened_by = auth.uid());

-- Teachers ven sessions de sus teams
create policy "teachers_view_team_sessions"
  on public.contest_sessions
  for select
  using (
    exists (
      select 1 from public.teams
      where id = team_id and coach_id = auth.uid()
    )
  );

-- Students ven sessions de sus teams (para saber si su contest está abierto)
create policy "students_view_team_sessions"
  on public.contest_sessions
  for select
  using (
    exists (
      select 1 from public.team_members
      where team_id = contest_sessions.team_id
        and student_id = auth.uid()
    )
  );

-- Admins ven y mutan todo
create policy "admins_all_access_sessions"
  on public.contest_sessions
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- Helper RPC: mark sessions expiradas (idempotente, llamar desde cron o
-- lazy en server action startContestAttempt)
-- ============================================================
create or replace function public.expire_old_contest_sessions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update public.contest_sessions
     set status = 'expired'
   where status = 'open'
     and closes_at < now();

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

comment on function public.expire_old_contest_sessions() is
  'Actualiza status=expired en sessions cuyo closes_at ya pasó. Idempotente. Llamar desde cron o lazy.';

grant execute on function public.expire_old_contest_sessions() to authenticated;
