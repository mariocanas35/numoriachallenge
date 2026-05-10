-- ==========================================================
-- Numoria Challenge — Migration 0004: RLS profiles
-- Row Level Security para protección por usuario / rol.
-- ==========================================================

alter table public.profiles enable row level security;

-- ==========================================================
-- SELECT — quién puede LEER perfiles
-- ==========================================================

-- 1. Cada usuario ve su propio perfil completo
create policy "users_view_own_profile"
  on public.profiles
  for select
  using (auth.uid() = id);

-- 2. Padres ven perfiles de sus hijos vinculados
create policy "parents_view_children"
  on public.profiles
  for select
  using (parent_id = auth.uid());

-- 3. Profesores ven perfiles de estudiantes en su escuela
--    (refinado en chunk 2 cuando agreguemos team_members)
create policy "teachers_view_school_students"
  on public.profiles
  for select
  using (
    public.is_teacher()
    and school_id is not null
    and school_id in (
      select school_id from public.profiles
      where id = auth.uid()
    )
  );

-- 4. Admin ve todo
create policy "admins_view_all_profiles"
  on public.profiles
  for select
  using (public.is_admin());

-- ==========================================================
-- INSERT — solo el trigger handle_new_user (SECURITY DEFINER) puede crear
-- No permitimos INSERT directo desde clientes para evitar duplicados
-- y forzar el flujo de signup. Service role bypassa RLS por defecto.
-- ==========================================================

-- ==========================================================
-- UPDATE — quién puede MODIFICAR perfiles
-- ==========================================================

-- Cada usuario actualiza solo su propio perfil
-- BLOQUEADO: no puede cambiar role ni xp_total directamente — solo via funciones server-side
create policy "users_update_own_profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- Prevent privilege escalation: no puedes cambiar tu rol ni inflar tu XP
    and role = (select role from public.profiles where id = auth.uid())
    and xp_total = (select xp_total from public.profiles where id = auth.uid())
    and level = (select level from public.profiles where id = auth.uid())
    and current_streak = (select current_streak from public.profiles where id = auth.uid())
    and longest_streak = (select longest_streak from public.profiles where id = auth.uid())
  );

-- Padres pueden actualizar info básica de sus hijos
create policy "parents_update_children"
  on public.profiles
  for update
  using (parent_id = auth.uid())
  with check (
    parent_id = auth.uid()
    and role = (select role from public.profiles p where p.id = profiles.id)
    and xp_total = (select xp_total from public.profiles p where p.id = profiles.id)
  );

-- Admin puede modificar cualquier campo
create policy "admins_update_any_profile"
  on public.profiles
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- ==========================================================
-- DELETE — solo admin (los usuarios deletean su cuenta vía RPC server-side)
-- ==========================================================

create policy "admins_delete_profiles"
  on public.profiles
  for delete
  using (public.is_admin());

-- ==========================================================
-- Comentarios
-- ==========================================================

comment on policy "users_update_own_profile" on public.profiles is 'Usuario actualiza su perfil pero NO puede cambiar role/xp/level/streak (anti-cheat).';
comment on policy "parents_update_children" on public.profiles is 'Padres pueden ajustar nombre, avatar, locale de sus hijos pero no escalar privilegios.';
