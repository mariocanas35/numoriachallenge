-- ==========================================================
-- Numoria Challenge — Migration 0012: Fix infinite recursion en RLS profiles
--
-- BUG: 3 policies en `public.profiles` tienen subqueries a `public.profiles`
-- en sus clauses USING/WITH CHECK. Postgres detecta esto como recursión
-- infinita cuando se ejecuta un UPDATE o SELECT que dispare la policy:
--
--   ERROR: infinite recursion detected in policy for relation "profiles"
--
-- Policies afectadas:
--   1. teachers_view_school_students — subquery SELECT en USING
--   2. users_update_own_profile      — 5 subqueries SELECT en WITH CHECK
--   3. parents_update_children       — 2 subqueries SELECT en WITH CHECK
--
-- FIX: usar funciones SECURITY DEFINER que bypassen RLS al leer
-- los campos inmutables, eliminando la auto-referencia recursiva.
-- ==========================================================

-- ============================================================
-- Helper functions (SECURITY DEFINER → bypassa RLS al leer profiles)
-- ============================================================

create or replace function public.my_school_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select school_id from public.profiles where id = auth.uid()
$$;

comment on function public.my_school_id is
  'Devuelve el school_id del user actual. SECURITY DEFINER para usar en RLS policies sin causar recursión.';

create or replace function public.my_immutable_profile_fields()
returns table (
  user_role public.user_role,
  xp_total integer,
  level integer,
  current_streak integer,
  longest_streak integer
)
language sql
security definer
stable
set search_path = public
as $$
  select role, xp_total, level, current_streak, longest_streak
  from public.profiles
  where id = auth.uid()
$$;

comment on function public.my_immutable_profile_fields is
  'Devuelve los campos inmutables del profile del user actual (role, xp, level, streaks). Usado en WITH CHECK de RLS para prevenir privilege escalation sin causar recursión.';

create or replace function public.profile_immutable_fields(p_id uuid)
returns table (
  user_role public.user_role,
  xp_total integer
)
language sql
security definer
stable
set search_path = public
as $$
  select role, xp_total from public.profiles where id = p_id
$$;

comment on function public.profile_immutable_fields is
  'Devuelve role+xp_total de un profile arbitrario (por id). SECURITY DEFINER. Usado en RLS de parents_update_children para validar que el padre no modifica role/xp del hijo.';

grant execute on function public.my_school_id() to authenticated;
grant execute on function public.my_immutable_profile_fields() to authenticated;
grant execute on function public.profile_immutable_fields(uuid) to authenticated;

-- ============================================================
-- Re-crear las 3 policies sin las subqueries recursivas
-- ============================================================

-- 1. teachers_view_school_students
drop policy if exists "teachers_view_school_students" on public.profiles;
create policy "teachers_view_school_students"
  on public.profiles
  for select
  using (
    public.is_teacher()
    and school_id is not null
    and school_id = public.my_school_id()
  );

-- 2. users_update_own_profile
drop policy if exists "users_update_own_profile" on public.profiles;
create policy "users_update_own_profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and (role, xp_total, level, current_streak, longest_streak) = (
      select user_role, xp_total, level, current_streak, longest_streak
      from public.my_immutable_profile_fields()
    )
  );

comment on policy "users_update_own_profile" on public.profiles is
  'Usuario actualiza su perfil pero NO puede cambiar role/xp/level/streak (anti-cheat). Validación vía SECURITY DEFINER function para evitar recursión RLS.';

-- 3. parents_update_children
drop policy if exists "parents_update_children" on public.profiles;
create policy "parents_update_children"
  on public.profiles
  for update
  using (parent_id = auth.uid())
  with check (
    parent_id = auth.uid()
    and (role, xp_total) = (
      select user_role, xp_total
      from public.profile_immutable_fields(profiles.id)
    )
  );

comment on policy "parents_update_children" on public.profiles is
  'Padres ajustan datos básicos de sus hijos pero NO pueden cambiar role/xp (anti-cheat). Validación vía SECURITY DEFINER function para evitar recursión RLS.';
