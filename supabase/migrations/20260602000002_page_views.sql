-- 20260602000002_page_views.sql
--
-- Analitica propia y privada de Numoria Challenge (sin servicios de terceros).
-- ANONIMA: no guarda datos personales. `session_id` es un id aleatorio por
-- pestania (sessionStorage), solo sirve para agrupar las vistas de una misma
-- visita. No hay forma de ligar esto a una persona.
--
-- Privacidad: RLS activado SIN policies => ni anon ni usuarios autenticados
-- pueden leer/escribir. Solo el service_role (la API server y el admin client)
-- accede. Asi el contador es privado del fundador.

create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  path text not null,                 -- ruta visitada (con prefijo de locale, p.ej. /es/summer-bowl)
  referrer text,                      -- document.referrer (de donde llego)
  source text,                        -- fuente agrupada: facebook, instagram, google, directo, etc.
  country text,                       -- pais (header de Vercel/Cloudflare)
  device text,                        -- mobile | tablet | desktop
  duration_seconds integer,           -- tiempo en la pagina (best-effort, al salir)
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
create index if not exists page_views_session_idx on public.page_views (session_id);
create index if not exists page_views_path_idx on public.page_views (path);

alter table public.page_views enable row level security;
-- (Intencionalmente SIN policies: tabla privada, solo service_role accede.)

comment on table public.page_views is
  'Analitica de visitas anonima (first-party). session_id = id aleatorio por pestania; sin PII. Solo service_role.';
