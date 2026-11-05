-- ============================================================
-- Numoria Challenge — Seguridad: el registro nunca crea administradores
-- ============================================================
-- Problema: handle_new_user() copiaba el rol desde raw_user_meta_data, que
-- controla el navegador (supabase.auth.signUp / signInWithOtp con
-- options.data). Cualquiera con la anon key podía registrarse con
-- role = 'admin' y entrar al panel de administración.
--
-- Arreglo: solo se aceptan los roles públicos (student, parent, teacher).
-- Cualquier otro valor, incluidos 'admin' o un texto inválido, queda como
-- 'student'. Los administradores se asignan solo desde el panel de admin
-- o por SQL.
--
-- El resto de la función es idéntico a
-- 20260512000001_extend_handle_new_user.sql (verificado contra producción
-- el 2026-11-04).
-- ============================================================

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
    case
      when new.raw_user_meta_data->>'role' in ('student', 'parent', 'teacher')
        then (new.raw_user_meta_data->>'role')::public.user_role
      else 'student'::public.user_role
    end,
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
