-- ==========================================================
-- Numoria Challenge — Migration 0001: Init
-- Extensiones, enums base, función helper updated_at
-- ==========================================================

-- Extensiones requeridas
create extension if not exists "uuid-ossp" schema extensions;
create extension if not exists "citext" schema extensions;
create extension if not exists "pg_trgm" schema extensions; -- búsqueda fuzzy de problemas/escuelas en Fase 3

-- ============================================================
-- ENUMS
-- ============================================================

-- Roles de usuario en el sistema
create type public.user_role as enum (
  'student',
  'parent',
  'teacher',
  'admin'
);

-- División académica para competencias y problemas
create type public.school_division as enum (
  'elementary', -- primaria (8-11 años aprox)
  'middle'      -- secundaria (12-14 años aprox)
);

-- ============================================================
-- HELPERS — funciones reusables
-- ============================================================

-- Trigger genérico para mantener updated_at actualizado
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Verifica si el usuario actual es admin (usa SECURITY DEFINER para
-- evitar recursión con RLS en la tabla profiles).
-- Nota: language plpgsql en lugar de sql porque plpgsql difiere la validación
-- del cuerpo, permitiendo crear esta función ANTES de que public.profiles exista.
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  return exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
end;
$$;

-- Verifica si el usuario actual es teacher
create or replace function public.is_teacher()
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  return exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'teacher'
  );
end;
$$;
