-- ============================================================
-- Numoria Challenge — Archivar la temporada anterior y ocultar problemas
-- de competencias que aún no empiezan
-- ============================================================
-- 1. 'archived' queda oculto para todos menos admin, igual que 'draft'.
-- 2. Un problema publicado solo se ve cuando TODAS las competencias que lo
--    usan ya empezaron y no están en borrador. Así se pueden cargar las 6
--    competencias de la temporada 2026-2027 desde ya sin que nadie lea los
--    enunciados antes de que abra su ventana.
-- 3. Se archivan las competencias existentes (prácticas, oficiales de junio
--    y julio, Summer Bowl). Sus intentos y resultados se conservan; la página
--    pública de resultados del Summer Bowl lee con la service role.
-- ============================================================

-- 1. Competencias y su lista de problemas: ocultar archivadas
drop policy if exists "authenticated_view_non_draft_contests" on public.contests;
create policy "authenticated_view_non_draft_contests"
  on public.contests for select
  to authenticated
  using (status not in ('draft', 'archived') or public.is_admin());

drop policy if exists "authenticated_view_contest_problems" on public.contest_problems;
create policy "authenticated_view_contest_problems"
  on public.contest_problems for select
  to authenticated
  using (
    exists (
      select 1
      from public.contests
      where contests.id = contest_problems.contest_id
        and (contests.status not in ('draft', 'archived') or public.is_admin())
    )
  );

-- 2. Problemas: solo visibles cuando sus competencias ya empezaron
create or replace function public.problem_is_released(p_problem_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $fn$
  select not exists (
    select 1
    from contest_problems cp
    join contests c on c.id = cp.contest_id
    where cp.problem_id = p_problem_id
      and (c.status = 'draft' or c.scheduled_at > now())
  );
$fn$;

comment on function public.problem_is_released(uuid) is
  'true si todas las competencias que usan el problema ya empezaron y no están en borrador. SECURITY DEFINER para no depender de lo que el usuario puede ver.';

revoke all on function public.problem_is_released(uuid) from public;
grant execute on function public.problem_is_released(uuid) to authenticated, service_role;

drop policy if exists "authenticated_view_published_problems" on public.problems;
create policy "authenticated_view_published_problems"
  on public.problems for select
  to authenticated
  using (public.is_admin() or (published = true and public.problem_is_released(id)));

-- 3. Archivar todo lo anterior a la temporada 2026-2027
update public.contests
set status = 'archived'
where status <> 'archived'
  and slug not like 'numoria-2627-%';
