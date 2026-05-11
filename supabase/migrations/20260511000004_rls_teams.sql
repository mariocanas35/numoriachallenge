-- ==========================================================
-- Numoria Challenge — Migration 0009: RLS para teams + team_members
-- ==========================================================

-- ============================================================
-- TEAMS
-- ============================================================
alter table public.teams enable row level security;

-- SELECT: cualquier autenticado puede ver teams
-- (necesario para que estudiante pueda ver info del team al unirse via /join)
create policy "authenticated_view_teams"
  on public.teams
  for select
  to authenticated
  using (true);

-- INSERT: profesores crean teams en sus propias escuelas
create policy "teachers_create_teams"
  on public.teams
  for insert
  to authenticated
  with check (
    public.is_teacher()
    and coach_id = auth.uid()
    and exists (
      select 1 from public.schools
      where id = teams.school_id
        and (created_by = auth.uid() or public.is_admin())
    )
  );

-- UPDATE: solo el coach (creador) puede actualizar su team
create policy "coach_updates_own_team"
  on public.teams
  for update
  to authenticated
  using (coach_id = auth.uid())
  with check (
    coach_id = auth.uid()
    -- coach no puede cambiar la escuela ni el coach del team
    and school_id = (select school_id from public.teams where id = teams.id)
    and coach_id = (select coach_id from public.teams where id = teams.id)
  );

-- DELETE: solo el coach o admin
create policy "coach_or_admin_deletes_team"
  on public.teams
  for delete
  to authenticated
  using (coach_id = auth.uid() or public.is_admin());

-- ============================================================
-- TEAM_MEMBERS
-- ============================================================
alter table public.team_members enable row level security;

-- SELECT: estudiantes ven sus propias memberships, coach ve miembros de sus teams, admin todo
create policy "members_view_own_membership"
  on public.team_members
  for select
  to authenticated
  using (student_id = auth.uid());

create policy "coach_views_team_members"
  on public.team_members
  for select
  to authenticated
  using (
    exists (
      select 1 from public.teams
      where id = team_members.team_id
        and coach_id = auth.uid()
    )
  );

create policy "admins_view_all_team_members"
  on public.team_members
  for select
  to authenticated
  using (public.is_admin());

-- INSERT: solo vía RPC join_team() (SECURITY DEFINER bypassa esto)
-- No definimos policy de INSERT directa para forzar uso del RPC con validaciones

-- DELETE: estudiante puede salirse, coach puede remover de su team
create policy "student_leaves_team"
  on public.team_members
  for delete
  to authenticated
  using (student_id = auth.uid());

create policy "coach_removes_team_members"
  on public.team_members
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.teams
      where id = team_members.team_id
        and coach_id = auth.uid()
    )
  );

-- ============================================================
-- GRANTS para RPC functions (autenticados pueden invocarlas)
-- ============================================================
grant execute on function public.get_my_profile() to authenticated;
grant execute on function public.complete_onboarding(smallint, text, uuid, text) to authenticated;
grant execute on function public.join_team(text) to authenticated;

-- generate_team_invite_code es internal — solo se llama desde otras functions
revoke execute on function public.generate_team_invite_code() from public;
revoke execute on function public.generate_team_invite_code() from anon;
grant execute on function public.generate_team_invite_code() to authenticated;
