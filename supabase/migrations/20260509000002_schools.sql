-- ==========================================================
-- Numoria Challenge — Migration 0002: Schools
-- Tabla de instituciones educativas con branding personalizado
-- ==========================================================

create table public.schools (
  id uuid primary key default extensions.uuid_generate_v4(),

  -- Identificación
  name text not null check (length(trim(name)) >= 2),
  slug text unique not null check (slug ~ '^[a-z0-9-]+$' and length(slug) >= 3),

  -- Localización
  country_code text not null check (length(country_code) = 2),
  city text,

  -- Branding institucional
  logo_url text,
  primary_color text check (primary_color ~ '^#[0-9A-Fa-f]{6}$'),

  -- Verificación administrativa
  verified boolean not null default false,

  -- Auditoría
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices para queries comunes
create index schools_country_idx on public.schools(country_code);
create index schools_created_by_idx on public.schools(created_by);
create index schools_slug_idx on public.schools(slug);
create index schools_verified_idx on public.schools(verified) where verified = true;

-- Trigger updated_at
create trigger schools_set_updated_at
  before update on public.schools
  for each row
  execute function public.set_updated_at();

-- Comentarios para documentación
comment on table public.schools is 'Instituciones educativas que usan Numoria. Profesor crea su escuela y la verificamos manualmente.';
comment on column public.schools.slug is 'URL slug único, ej: eis-tegucigalpa. Usado en /schools/[slug].';
comment on column public.schools.primary_color is 'Color hex (#RRGGBB) para tinta sutil del dashboard del equipo.';
comment on column public.schools.verified is 'Las verificadas obtienen badge azul y aparecen primero en rankings.';
