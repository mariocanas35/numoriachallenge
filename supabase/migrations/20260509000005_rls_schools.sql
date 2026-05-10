-- ==========================================================
-- Numoria Challenge — Migration 0005: RLS schools
-- ==========================================================

alter table public.schools enable row level security;

-- ==========================================================
-- SELECT — todos los autenticados pueden ver escuelas
-- (necesario para selector "elige tu escuela" en onboarding)
-- ==========================================================

create policy "authenticated_view_schools"
  on public.schools
  for select
  to authenticated
  using (true);

-- ==========================================================
-- INSERT — profesores crean escuelas (verified=false por default)
-- ==========================================================

create policy "teachers_create_schools"
  on public.schools
  for insert
  to authenticated
  with check (
    public.is_teacher()
    and created_by = auth.uid()
    -- Profesores no pueden marcar su propia escuela como verificada
    and verified = false
  );

-- ==========================================================
-- UPDATE — profesores actualizan SUS escuelas, sin tocar verified
-- ==========================================================

create policy "teachers_update_own_schools"
  on public.schools
  for update
  to authenticated
  using (created_by = auth.uid() and public.is_teacher())
  with check (
    created_by = auth.uid()
    -- No pueden auto-verificarse
    and verified = (select verified from public.schools where id = schools.id)
  );

-- ==========================================================
-- ALL — admin puede hacer cualquier cosa (incluido verificar escuelas)
-- ==========================================================

create policy "admins_manage_schools"
  on public.schools
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- ==========================================================
-- Comentarios
-- ==========================================================

comment on policy "teachers_create_schools" on public.schools is 'Profesores crean su escuela como verified=false. Admin verifica manualmente para badge azul.';
