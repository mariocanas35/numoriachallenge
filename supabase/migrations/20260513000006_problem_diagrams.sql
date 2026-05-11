-- ==========================================================
-- Numoria Challenge — Migration 0016: Problem Diagrams URLs
--
-- Setea `diagram_svg_url` para los problemas seed que tienen `has_diagram=true`.
-- Los SVGs viven como assets estáticos en `apps/web/public/problem-diagrams/`
-- (versionados en git), no en Supabase Storage. Esto mantiene la DB ligera
-- y los diagramas editables por cualquier dev.
--
-- Naming convention: el archivo SVG usa exactamente el slug del problema
-- + `.svg`. Esto permite refactor automatizado el día que migremos a Storage.
--
-- Problemas con diagrama en el seed actual:
--   - numoria-c1e-p3-geometria-rectangulo-cuadrado (★★ plane_geometry)
--
-- Próximos diagramas (Phase 4 admin UI) usarán Supabase Storage bucket
-- `problem-diagrams` con la misma naming convention.
-- ==========================================================

update public.problems
   set diagram_svg_url = '/problem-diagrams/numoria-c1e-p3-geometria-rectangulo-cuadrado.svg'
 where slug = 'numoria-c1e-p3-geometria-rectangulo-cuadrado';
