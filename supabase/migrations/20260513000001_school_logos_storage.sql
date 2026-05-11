-- ==========================================================
-- Numoria Challenge — Migration 0011: School logos storage bucket
--
-- Crea el bucket `school-logos` con:
-- - Public read (logos visibles en leaderboards/certificados/landing)
-- - Authenticated upload solo si user es teacher y folder coincide
--   con school.id que ellos crearon
-- - File size limit 512KB
-- - MIME types permitidos: PNG, JPEG, WebP, SVG
-- ==========================================================

-- Bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'school-logos',
  'school-logos',
  true,
  524288,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ============================================================
-- RLS policies para storage.objects (bucket school-logos)
-- ============================================================

-- DROP policies viejas si existen (para que migration sea idempotente)
drop policy if exists "school_logos_public_read" on storage.objects;
drop policy if exists "teachers_upload_school_logos" on storage.objects;
drop policy if exists "teachers_update_school_logos" on storage.objects;
drop policy if exists "teachers_delete_school_logos" on storage.objects;

-- SELECT — público (anónimo + autenticado) puede leer logos
create policy "school_logos_public_read" on storage.objects
  for select
  using (bucket_id = 'school-logos');

-- INSERT — teacher autenticado sube a folder de su school
create policy "teachers_upload_school_logos" on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'school-logos'
    and public.is_teacher()
    and (storage.foldername(name))[1] in (
      select id::text from public.schools where created_by = auth.uid()
    )
  );

-- UPDATE — teacher reemplaza logo de su school
create policy "teachers_update_school_logos" on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'school-logos'
    and (storage.foldername(name))[1] in (
      select id::text from public.schools where created_by = auth.uid()
    )
  );

-- DELETE — teacher remueve logo de su school
create policy "teachers_delete_school_logos" on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'school-logos'
    and (storage.foldername(name))[1] in (
      select id::text from public.schools where created_by = auth.uid()
    )
  );
