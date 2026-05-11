-- ==========================================================
-- Numoria Challenge — Migration 0007: Teams + team_members
--
-- Sistema de equipos dentro de una escuela (estilo MOEMS).
-- Un profesor crea un equipo, comparte el invite_code, los estudiantes
-- se unen vía /join/[code].
-- ==========================================================

-- ============================================================
-- TEAMS
-- ============================================================
create table public.teams (
  id uuid primary key default extensions.uuid_generate_v4(),

  -- Relaciones
  school_id uuid not null references public.schools(id) on delete cascade,
  coach_id uuid not null references public.profiles(id) on delete restrict,

  -- Identificación
  name text not null check (length(trim(name)) between 1 and 100),
  division public.school_division not null,

  -- Sistema de invitación
  invite_code text unique not null check (invite_code ~ '^[A-Z0-9]{8}$'),
  invite_enabled boolean not null default true,

  -- Capacidad
  max_members integer not null default 35 check (max_members between 1 and 100),

  -- Auditoría
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index teams_school_idx on public.teams(school_id);
create index teams_coach_idx on public.teams(coach_id);
create index teams_invite_idx on public.teams(invite_code) where invite_enabled = true;

create trigger teams_set_updated_at
  before update on public.teams
  for each row
  execute function public.set_updated_at();

comment on table public.teams is
  'Equipos académicos dentro de una escuela. Un profesor (coach) gestiona varios.';
comment on column public.teams.invite_code is
  'Código único de 8 chars alfanuméricos en mayúsculas. Compartido con estudiantes para que se unan vía /join/[code].';
comment on column public.teams.invite_enabled is
  'Coach puede desactivar el código sin borrarlo (ej: equipo lleno, año escolar terminó).';

-- ============================================================
-- TEAM_MEMBERS
-- ============================================================
create table public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),

  primary key (team_id, student_id)
);

create index team_members_student_idx on public.team_members(student_id);

comment on table public.team_members is
  'Asociación many-to-many estudiante↔equipo. Estudiante puede estar en máximo 1 equipo activo (constraint app-level en Phase 3).';
