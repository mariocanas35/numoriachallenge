-- ==========================================================
-- Numoria Challenge — Migration 0010: Extend handle_new_user trigger
--
-- El trigger original solo manejaba role, display_name, locale, country_code.
-- Para Phase 2 (parent agrega hijos) necesitamos también procesar:
-- - parent_id: vinculo al padre que está creando al hijo
-- - birth_year / birth_month: datos del hijo (parent los provee)
-- - grade: nivel escolar del hijo
--
-- Cuando parent llama admin.inviteUserByEmail() con metadata extendida,
-- esta versión del trigger crea el profile completo para el hijo.
-- ==========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    role,
    display_name,
    locale,
    country_code,
    parent_id,
    birth_year,
    birth_month,
    grade
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'student')::public.user_role,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1)
    ),
    coalesce(new.raw_user_meta_data->>'locale', 'es'),
    new.raw_user_meta_data->>'country_code',
    nullif(new.raw_user_meta_data->>'parent_id', '')::uuid,
    nullif(new.raw_user_meta_data->>'birth_year', '')::smallint,
    nullif(new.raw_user_meta_data->>'birth_month', '')::smallint,
    nullif(new.raw_user_meta_data->>'grade', '')::smallint
  );
  return new;
end;
$$;

comment on function public.handle_new_user is
  'Auto-crea profile cuando se inserta en auth.users. Procesa metadata: role, display_name, locale, country_code, parent_id, birth_year, birth_month, grade. Usado en signup normal Y en parent_creates_children (admin.inviteUserByEmail con metadata extendida).';
