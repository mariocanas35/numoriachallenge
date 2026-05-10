-- ==========================================================
-- Numoria Challenge — Seed data (desarrollo local)
--
-- Este archivo se aplica con `pnpm db:seed`.
-- Solo datos demo para testing. NO ejecutar en producción.
-- ==========================================================

-- Escuelas de demostración (verificadas para usar en pruebas)
insert into public.schools (id, name, slug, country_code, city, primary_color, verified)
values
  (
    '00000000-0000-0000-0000-000000000001',
    'EIS Tegucigalpa',
    'eis-tegucigalpa',
    'HN',
    'Tegucigalpa',
    '#1CB0F6',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Colegio Saint Paul',
    'saint-paul-honduras',
    'HN',
    'San Pedro Sula',
    '#F97316',
    true
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Liceo Bilingüe Guatemala',
    'liceo-bilingue-gt',
    'GT',
    'Ciudad de Guatemala',
    '#58CC02',
    false
  )
on conflict (id) do nothing;

-- NOTA: profiles seed va en chunk 1.7 (cuando tengamos auth funcional)
-- porque profiles requiere auth.users que solo se crea via signup real.
