-- ==========================================================
-- Numoria Challenge — Migration 0015: Seed Contest #1 — División E (2026)
--
-- Numoria Challenge Contest #1, División E (Elementary: 4°-6° grado), año 2026.
-- 7 problemas bilingües es/en, 35 min, SIN calculadora.
--
-- Distribución del contest (rampa fácil → difícil):
--   #1 ★ Estadística (statistics) — promedio simple
--   #2 ★ Dinero (money) — suma con multiplicación simple
--   #3 ★★ Geometría plana (plane_geometry) — área de rectángulos
--   #4 ★★ Teoría de números (number_theory) — divisibilidad
--   #5 ★★ Razones (ratios_proportions) — razón 3:2
--   #6 ★★★ Conteo (counting_combinatorics) — outfits con restricción
--   #7 ★★★ Secuencias (sequences_patterns) — Fibonacci-like
--
-- Total puntos: 1+1+2+2+2+3+3 = 14 puntos máximo.
-- 7 categorías distintas (cumple regla "5+ ramas sin repetir").
-- 1 problema con diagrama (P3).
-- Sin calculadora — todos los cálculos son tractables manualmente.
-- Generado con AI (claude-opus-4-7) usando prompt Numoria v1.0.
-- ==========================================================

-- ============================================================
-- INSERT problemas (7 total)
-- ============================================================

insert into public.problems (
  slug, category, stars, division,
  title_es, title_en,
  body_es, body_en,
  explanation_es, explanation_en,
  answer_type, expected_answer,
  format_directive_es, format_directive_en,
  has_diagram, diagram_caption_es, diagram_caption_en,
  points, source, source_year, published
) values
-- Problema 1 — Estadística (★ Fácil) — promedio simple
(
  'numoria-c1e-p1-estadistica-promedio',
  'statistics', 1, 'elementary',
  'Estadística', 'Statistics',
  'Ana tomó cuatro exámenes y obtuvo las siguientes notas: 85, 90, 78 y 87. ¿Cuál es el promedio de sus cuatro notas?',
  'Ana took four exams and got the following grades: 85, 90, 78, and 87. What is the average of her four grades?',
  'Para calcular el promedio, sumamos todas las notas y dividimos entre el número de notas. La suma es $85 + 90 + 78 + 87 = 340$. Dividiendo entre 4: $340 \div 4 = 85$.',
  'To calculate the average, we add all the grades and divide by the number of grades. The sum is $85 + 90 + 78 + 87 = 340$. Dividing by 4: $340 \div 4 = 85$.',
  'integer', '85',
  null, null,
  false, null, null,
  1, 'Numoria Challenge Contest #1 — Original problem set', 2026, true
),

-- Problema 2 — Dinero (★ Fácil) — suma con multiplicación
(
  'numoria-c1e-p2-dinero-tienda',
  'money', 1, 'elementary',
  'Dinero', 'Money',
  'En la tienda de doña María, una manzana cuesta $12 y una pera cuesta $18. Si Sofía compra 2 manzanas y 1 pera, ¿cuántos dólares paga en total?',
  'At Doña María''s shop, an apple costs $12 and a pear costs $18. If Sofía buys 2 apples and 1 pear, how many dollars does she pay in total?',
  'Sofía compra 2 manzanas a $12 cada una: $2 \times 12 = 24$ dólares. Más 1 pera a $18. Total: $24 + 18 = 42$ dólares.',
  'Sofía buys 2 apples at $12 each: $2 \times 12 = 24$ dollars. Plus 1 pear at $18. Total: $24 + 18 = 42$ dollars.',
  'integer', '42',
  null, null,
  false, null, null,
  1, 'Numoria Challenge Contest #1 — Original problem set', 2026, true
),

-- Problema 3 — Geometría plana (★★ Medio) — CON DIAGRAMA
(
  'numoria-c1e-p3-geometria-rectangulo-cuadrado',
  'plane_geometry', 2, 'elementary',
  'Geometría plana', 'Plane Geometry',
  'Un rectángulo tiene un largo de 10 cm y un ancho de 6 cm. Dentro del rectángulo se dibuja un cuadrado de 4 cm de lado. ¿Cuál es el área del rectángulo que NO está cubierta por el cuadrado, en cm²?',
  'A rectangle has a length of 10 cm and a width of 6 cm. Inside the rectangle, a square with sides of 4 cm is drawn. What is the area of the rectangle NOT covered by the square, in cm²?',
  'El área del rectángulo es $10 \times 6 = 60$ cm². El área del cuadrado es $4 \times 4 = 16$ cm². El área que NO está cubierta es $60 - 16 = 44$ cm².',
  'The area of the rectangle is $10 \times 6 = 60$ cm². The area of the square is $4 \times 4 = 16$ cm². The area NOT covered is $60 - 16 = 44$ cm².',
  'with_units', '44 cm²',
  null, null,
  true, '(no dibujado a escala)', '(not drawn to scale)',
  2, 'Numoria Challenge Contest #1 — Original problem set', 2026, true
),

-- Problema 4 — Teoría de números (★★ Medio) — divisibilidad
(
  'numoria-c1e-p4-teoria-divisibilidad',
  'number_theory', 2, 'elementary',
  'Teoría de números', 'Number Theory',
  'Encuentra el menor entero positivo de tres dígitos que es divisible por 4 y por 9 al mismo tiempo.',
  'Find the smallest three-digit positive integer that is divisible by both 4 and 9 at the same time.',
  'Un número divisible por 4 y por 9 es divisible por su mínimo común múltiplo: $\text{MCM}(4, 9) = 36$. Los múltiplos de 36 son: 36, 72, 108, 144, ... El primer múltiplo de tres dígitos es $36 \times 3 = 108$. Verificación: $108 \div 4 = 27$ y $108 \div 9 = 12$. Ambos son enteros.',
  'A number divisible by both 4 and 9 is divisible by their least common multiple: $\text{LCM}(4, 9) = 36$. The multiples of 36 are: 36, 72, 108, 144, ... The first three-digit multiple is $36 \times 3 = 108$. Check: $108 \div 4 = 27$ and $108 \div 9 = 12$. Both are integers.',
  'integer', '108',
  null, null,
  false, null, null,
  2, 'Numoria Challenge Contest #1 — Original problem set', 2026, true
),

-- Problema 5 — Razones y proporciones (★★ Medio)
(
  'numoria-c1e-p5-razones-clase',
  'ratios_proportions', 2, 'elementary',
  'Razones', 'Ratios',
  'En la clase de 5° grado, la razón de niñas a niños es 3 : 2. Si hay 30 estudiantes en total, ¿cuántas niñas hay?',
  'In the 5th grade class, the ratio of girls to boys is 3 : 2. If there are 30 students in total, how many girls are there?',
  'La razón $3 : 2$ divide a los estudiantes en $3 + 2 = 5$ partes iguales. Cada parte representa $30 \div 5 = 6$ estudiantes. Las niñas son 3 partes: $3 \times 6 = 18$.',
  'The ratio $3 : 2$ divides the students into $3 + 2 = 5$ equal parts. Each part represents $30 \div 5 = 6$ students. The girls are 3 parts: $3 \times 6 = 18$.',
  'integer', '18',
  null, null,
  false, null, null,
  2, 'Numoria Challenge Contest #1 — Original problem set', 2026, true
),

-- Problema 6 — Conteo (★★★ Difícil) — outfits con restricción
(
  'numoria-c1e-p6-conteo-outfits',
  'counting_combinatorics', 3, 'elementary',
  'Conteo', 'Counting',
  'Roberto tiene 4 camisas (roja, azul, verde, amarilla) y 3 pantalones (negro, café, gris). ¿De cuántas maneras diferentes puede elegir un conjunto de camisa y pantalón, si NO usa la combinación de camisa roja con pantalón negro?',
  'Roberto has 4 shirts (red, blue, green, yellow) and 3 pants (black, brown, gray). In how many different ways can he choose an outfit of shirt and pants, if he does NOT wear the red shirt with black pants combination?',
  'Sin restricciones, Roberto tiene $4 \times 3 = 12$ combinaciones posibles (cada camisa con cada pantalón). Como NO puede usar la combinación roja-negra, restamos 1: $12 - 1 = 11$ combinaciones diferentes.',
  'Without restrictions, Roberto has $4 \times 3 = 12$ possible combinations (each shirt with each pants). Since he canNOT use the red-black combination, we subtract 1: $12 - 1 = 11$ different combinations.',
  'integer', '11',
  null, null,
  false, null, null,
  3, 'Numoria Challenge Contest #1 — Original problem set', 2026, true
),

-- Problema 7 — Secuencias y patrones (★★★ Difícil) — Fibonacci-like
(
  'numoria-c1e-p7-secuencias-fibonacci',
  'sequences_patterns', 3, 'elementary',
  'Secuencias', 'Sequences',
  'En la siguiente secuencia, cada número (desde el tercero) es la suma de los dos números anteriores: 2, 5, 7, 12, 19, 31, ... ¿Cuál es el séptimo número de la secuencia?',
  'In the following sequence, each number (starting from the third) is the sum of the two previous numbers: 2, 5, 7, 12, 19, 31, ... What is the seventh number of the sequence?',
  'Verificamos el patrón: $2 + 5 = 7$ (3°), $5 + 7 = 12$ (4°), $7 + 12 = 19$ (5°), $12 + 19 = 31$ (6°). El séptimo número es $19 + 31 = 50$.',
  'We check the pattern: $2 + 5 = 7$ (3rd), $5 + 7 = 12$ (4th), $7 + 12 = 19$ (5th), $12 + 19 = 31$ (6th). The seventh number is $19 + 31 = 50$.',
  'integer', '50',
  null, null,
  false, null, null,
  3, 'Numoria Challenge Contest #1 — Original problem set', 2026, true
);

-- ============================================================
-- INSERT contest #1 División E
-- ============================================================

-- scheduled_at = hace 30 min, status = active (para test inmediato)
insert into public.contests (
  slug, contest_number, season_year, division,
  title_es, title_en,
  scheduled_at, duration_minutes,
  calculator_allowed,
  generated_by_ai, generation_metadata,
  status
) values (
  'numoria-c1-e-2026',
  1, 2026, 'elementary',
  'Numoria Challenge Contest #1 — División E',
  'Numoria Challenge Contest #1 — Division E',
  now() - interval '30 minutes', 35,
  false,  -- SIN calculadora (estilo MOEMS)
  true,
  jsonb_build_object(
    'model', 'claude-opus-4-7',
    'prompt_version', 'numoria-v1.0',
    'generated_at', '2026-05-11T16:00:00Z',
    'spike_inserted', false,
    'topics', jsonb_build_array(
      'statistics', 'money', 'plane_geometry', 'number_theory',
      'ratios_proportions', 'counting_combinatorics', 'sequences_patterns'
    )
  ),
  'active'
);

-- ============================================================
-- INSERT contest_problems (asociación ordenada 1-7)
-- ============================================================

insert into public.contest_problems (contest_id, problem_id, position)
select c.id, p.id, pos.position
from public.contests c
cross join (
  values
    (1, 'numoria-c1e-p1-estadistica-promedio'),
    (2, 'numoria-c1e-p2-dinero-tienda'),
    (3, 'numoria-c1e-p3-geometria-rectangulo-cuadrado'),
    (4, 'numoria-c1e-p4-teoria-divisibilidad'),
    (5, 'numoria-c1e-p5-razones-clase'),
    (6, 'numoria-c1e-p6-conteo-outfits'),
    (7, 'numoria-c1e-p7-secuencias-fibonacci')
) as pos(position, slug)
join public.problems p on p.slug = pos.slug
where c.slug = 'numoria-c1-e-2026';
