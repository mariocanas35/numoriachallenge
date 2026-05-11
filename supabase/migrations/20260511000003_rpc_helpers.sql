-- ==========================================================
-- Numoria Challenge — Migration 0008: RPC helpers Phase 2
--
-- Funciones llamadas vía supabase.rpc() desde el cliente.
-- Todas SECURITY DEFINER para bypasear RLS de forma controlada
-- y proporcionar lógica que sería compleja en policies puras.
-- ==========================================================

-- ============================================================
-- get_my_profile() — devuelve profile del usuario actual
--
-- Workaround para issue conocido: @supabase/ssr 0.5.x en Server
-- Components no propaga el JWT al postgrest, haciendo que
-- auth.uid() devuelva null y RLS bloquee la lectura.
-- Esta función bypassa el problema usando SECURITY DEFINER.
-- ============================================================
create or replace function public.get_my_profile()
returns public.profiles
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  result public.profiles;
begin
  select * into result
  from public.profiles
  where id = auth.uid();
  return result;
end;
$$;

comment on function public.get_my_profile is
  'Devuelve el profile del usuario autenticado. SECURITY DEFINER porque RLS context en Server Components no funciona consistentemente.';

-- ============================================================
-- generate_team_invite_code() — código único de 8 chars
--
-- Genera código alfanumérico mayúsculas, único en teams.
-- Reintenta hasta encontrar uno libre (improbable colisión).
-- ============================================================
create or replace function public.generate_team_invite_code()
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- sin O/0/I/1 para evitar confusión
  code text;
  i integer;
  attempts integer := 0;
begin
  loop
    attempts := attempts + 1;
    if attempts > 100 then
      raise exception 'Could not generate unique invite code after 100 attempts';
    end if;

    code := '';
    for i in 1..8 loop
      code := code || substr(chars, floor(random() * length(chars))::integer + 1, 1);
    end loop;

    -- Verificar unicidad
    if not exists (select 1 from public.teams where invite_code = code) then
      return code;
    end if;
  end loop;
end;
$$;

comment on function public.generate_team_invite_code is
  'Genera un invite_code único de 8 chars (alfanuméricos mayúsculas, sin caracteres ambiguos O/0/I/1).';

-- ============================================================
-- complete_onboarding() — marca el profile como onboarded
--
-- Recibe los datos finales del flow de onboarding y actualiza
-- el profile en una sola transacción. Idempotente.
-- ============================================================
create or replace function public.complete_onboarding(
  p_grade smallint default null,
  p_country_code text default null,
  p_school_id uuid default null,
  p_username text default null
)
returns public.profiles
language plpgsql
security definer
volatile
set search_path = public
as $$
declare
  result public.profiles;
begin
  update public.profiles
  set
    grade = coalesce(p_grade, grade),
    country_code = coalesce(p_country_code, country_code),
    school_id = coalesce(p_school_id, school_id),
    username = coalesce(p_username, username),
    onboarding_completed = true,
    terms_accepted_at = coalesce(terms_accepted_at, now()),
    updated_at = now()
  where id = auth.uid()
  returning * into result;

  if result.id is null then
    raise exception 'Profile not found for current user';
  end if;

  return result;
end;
$$;

comment on function public.complete_onboarding is
  'Marca el onboarding como completo y graba datos finales. Llamado al cerrar el último step del flow.';

-- ============================================================
-- join_team(invite_code) — estudiante se une a un equipo
--
-- Valida que: código existe + enabled, team no lleno, user es student.
-- Devuelve el team al que se unió, o levanta excepción.
-- ============================================================
create or replace function public.join_team(p_invite_code text)
returns public.teams
language plpgsql
security definer
volatile
set search_path = public
as $$
declare
  v_team public.teams;
  v_member_count integer;
  v_user_role public.user_role;
begin
  -- Validar role del usuario
  select role into v_user_role from public.profiles where id = auth.uid();
  if v_user_role is null then
    raise exception 'User has no profile';
  end if;
  if v_user_role != 'student' then
    raise exception 'Only students can join teams (current role: %)', v_user_role;
  end if;

  -- Buscar team por código
  select * into v_team
  from public.teams
  where invite_code = upper(trim(p_invite_code))
    and invite_enabled = true;

  if v_team.id is null then
    raise exception 'Invalid or disabled invite code';
  end if;

  -- Verificar capacidad
  select count(*) into v_member_count from public.team_members where team_id = v_team.id;
  if v_member_count >= v_team.max_members then
    raise exception 'Team is full (% / % members)', v_member_count, v_team.max_members;
  end if;

  -- Verificar que el estudiante no esté ya en el team
  if exists (
    select 1 from public.team_members
    where team_id = v_team.id and student_id = auth.uid()
  ) then
    raise exception 'You are already in this team';
  end if;

  -- Insertar membership + actualizar profile.school_id si no lo tiene
  insert into public.team_members (team_id, student_id) values (v_team.id, auth.uid());

  update public.profiles
  set school_id = coalesce(school_id, v_team.school_id)
  where id = auth.uid();

  return v_team;
end;
$$;

comment on function public.join_team is
  'Estudiante usa un invite_code para unirse a un team. Valida role, capacidad, duplicados. Auto-asigna school_id si no tiene.';
