-- ==========================================================
-- Numoria Challenge — Migration 0030: Campos de contacto en schools
--
-- Tarea 2 del plan recalibrado 2026-05-15: Página /settings necesita
-- que el teacher pueda editar address, phone y website de su escuela
-- desde la app (no solo durante onboarding inicial).
--
-- Todos nullable para no romper schools existentes que se crearon antes
-- de tener estos campos.
-- ==========================================================

alter table public.schools
  add column if not exists address text;

alter table public.schools
  add column if not exists phone text check (phone is null or length(trim(phone)) between 5 and 30);

alter table public.schools
  add column if not exists website text check (website is null or website ~* '^https?://');

comment on column public.schools.address is
  'Dirección física de la escuela (calle, número, colonia). Editable por el creador via /settings.';
comment on column public.schools.phone is
  'Teléfono de contacto (cualquier formato local). Validación mínima de longitud 5-30 chars.';
comment on column public.schools.website is
  'URL del sitio web institucional. Debe empezar con http:// o https://.';
