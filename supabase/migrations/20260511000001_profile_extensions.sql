-- ==========================================================
-- Numoria Challenge — Migration 0006: Profile extensions Phase 2
--
-- Agrega:
-- - onboarding_completed: gate para router (si false, redirige a /onboarding)
-- - grade: nivel escolar del estudiante (1-12)
-- - terms_accepted_at: timestamp de aceptación de términos (auditoría legal)
-- ==========================================================

alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false;

alter table public.profiles
  add column if not exists grade smallint check (grade between 1 and 12);

alter table public.profiles
  add column if not exists terms_accepted_at timestamptz;

-- Index para queries de "users sin onboarding completo"
create index if not exists profiles_onboarding_pending_idx
  on public.profiles(id)
  where onboarding_completed = false;

comment on column public.profiles.onboarding_completed is
  'False hasta que user completa el flow de onboarding diferenciado por rol. Middleware redirige a /onboarding si false.';
comment on column public.profiles.grade is
  'Grado escolar del estudiante (1-12). Null hasta completar onboarding o si role != student.';
comment on column public.profiles.terms_accepted_at is
  'Timestamp de aceptación de Términos + Política de Privacidad. Null si no aceptados aún.';
