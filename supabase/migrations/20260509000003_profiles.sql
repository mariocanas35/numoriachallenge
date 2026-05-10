-- ==========================================================
-- Numoria Challenge — Migration 0003: Profiles
-- Perfil del usuario, vinculado 1:1 con auth.users.
-- Se crea automáticamente al registro vía trigger handle_new_user.
-- ==========================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  -- Identidad
  role public.user_role not null,
  display_name text not null check (length(trim(display_name)) >= 1),
  username citext unique check (username ~ '^[a-z0-9_-]{3,30}$'),
  avatar_url text,

  -- Localización
  country_code text check (length(country_code) = 2),
  locale text not null default 'es' check (locale in ('es', 'en', 'pt')),

  -- Datos sensibles MENORES — solo mes/año, NUNCA día completo (privacidad COPPA/LGPD)
  birth_year smallint check (birth_year between 1990 and extract(year from now())::smallint),
  birth_month smallint check (birth_month between 1 and 12),

  -- Vínculos relacionales
  parent_id uuid references public.profiles(id) on delete set null,
  school_id uuid references public.schools(id) on delete set null,

  -- Gamificación (todos default 0, mecánicas se activan en Fase 4)
  xp_total integer not null default 0 check (xp_total >= 0),
  level smallint not null default 1 check (level between 1 and 50),
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  last_active_at timestamptz,

  -- Auditoría
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices para queries críticos
create index profiles_role_idx on public.profiles(role);
create index profiles_school_idx on public.profiles(school_id) where school_id is not null;
create index profiles_parent_idx on public.profiles(parent_id) where parent_id is not null;
create index profiles_country_idx on public.profiles(country_code);
create index profiles_username_idx on public.profiles(username) where username is not null;

-- Trigger updated_at
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- ==========================================================
-- Auto-creación de profile cuando se registra un usuario en auth.users
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
    country_code
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'student')::public.user_role,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1)
    ),
    coalesce(new.raw_user_meta_data->>'locale', 'es'),
    new.raw_user_meta_data->>'country_code'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ==========================================================
-- Comentarios para documentación
-- ==========================================================
comment on table public.profiles is 'Perfil del usuario, 1:1 con auth.users. Auto-creado en signup vía trigger.';
comment on column public.profiles.birth_year is 'Año de nacimiento. Usamos solo año+mes para privacidad de menores.';
comment on column public.profiles.birth_month is 'Mes de nacimiento (sin día completo). Para celebrar cumpleaños y validar edad.';
comment on column public.profiles.parent_id is 'Si el usuario es estudiante menor de 13, vincula a su padre/madre verificada.';
comment on column public.profiles.username is 'Username público opcional para perfil /u/[username]. Lowercase, alfanumérico.';
