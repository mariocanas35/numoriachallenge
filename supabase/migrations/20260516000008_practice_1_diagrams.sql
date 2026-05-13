-- ==========================================================
-- Numoria Challenge — Migration 0027: Practice #1 diagram URLs
--
-- Founder feedback (2026-05-12): "no haz hecho diagramas en algunos
-- ejercicios donde se puede hacer uno para visualizar".
--
-- En migration 0024 marqué 6 problemas de Practice #1 con has_diagram=true
-- pero no setié diagram_svg_url. La UI checa AMBAS condiciones para
-- renderizar el diagrama, así que aparecían sin imagen.
--
-- Fix: genero los 6 SVGs en apps/web/public/problem-diagrams/ y los
-- vinculo aquí:
--
--   D-E P3 Triángulo (área base × altura / 2)
--   D-E P7 Patrones cuadrados perfectos
--   D-M P3 Pitágoras 5-12-13
--   D-M P5 Caminos en cuadrícula 3×3
--   D-M P6 Cubos pintados 3×3×3
--   D-MC P4 Cilindro radio 5 altura 10
--
-- SVGs siguen el estilo del diagram de Phase 3 (numoria-c1e-p3-rectangulo):
--   - Naranja Numa #F97316 (borders)
--   - Crema #FFF7ED (background)
--   - Índigo #1E1B4B (text + labels)
--   - Teal #14B8A6 (fill α)
--   - Hatching diagonal donde aplica
--   - aria-labelledby para accesibilidad
-- ==========================================================

update public.problems
   set diagram_svg_url = '/problem-diagrams/numoria-p1e-p3-geometria-triangulo.svg'
 where slug = 'numoria-p1e-p3-geometria-triangulo';

update public.problems
   set diagram_svg_url = '/problem-diagrams/numoria-p1e-p7-patrones-cuadrados.svg'
 where slug = 'numoria-p1e-p7-patrones-cuadrados';

update public.problems
   set diagram_svg_url = '/problem-diagrams/numoria-p1m-p3-geometria-pitagoras.svg'
 where slug = 'numoria-p1m-p3-geometria-pitagoras';

update public.problems
   set diagram_svg_url = '/problem-diagrams/numoria-p1m-p5-conteo-caminos.svg'
 where slug = 'numoria-p1m-p5-conteo-caminos';

update public.problems
   set diagram_svg_url = '/problem-diagrams/numoria-p1m-p6-geometria-cubos-pintados.svg'
 where slug = 'numoria-p1m-p6-geometria-cubos-pintados';

update public.problems
   set diagram_svg_url = '/problem-diagrams/numoria-p1mc-p4-geometria-cilindro.svg'
 where slug = 'numoria-p1mc-p4-geometria-cilindro';
