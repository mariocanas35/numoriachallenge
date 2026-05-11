-- ==========================================================
-- Numoria Challenge — Migration 0014: Seed Contest #2 — División M (2026)
--
-- Numoria Challenge Contest #2, División M (Middle: 6°-8° grado), año 2026.
-- 7 problemas bilingües es/en, 35 min, con calculadora.
--
-- Distribución del contest:
--   #1 ★ Razones (ratios_proportions)
--   #2 ★ Estadística (statistics)
--   #3 ★★ Álgebra (algebra) — pair_decimal answer
--   #4 ★★★ Teoría de números (number_theory) — spike en posición 4
--   #5 ★★ Geometría plana (plane_geometry) — has diagram
--   #6 ★★★ Conteo (counting_combinatorics)
--   #7 ★★★ Mezclas (mixtures)
--
-- Total puntos: 1+1+2+3+2+3+3 = 15 puntos máximo.
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
-- Problema 1 — Razones (★ Fácil)
(
  'numoria-c2m-p1-razones-flores',
  'ratios_proportions', 1, 'middle',
  'Razones', 'Ratios',
  'En el colegio Las Flores, la razón de estudiantes que prefieren matemáticas a los que prefieren ciencias es 5 : 4. Si hay 36 estudiantes en total y cada uno prefiere exactamente una de las dos materias, ¿cuántos prefieren matemáticas?',
  'At Las Flores School, the ratio of students who prefer mathematics to those who prefer science is 5 : 4. If there are 36 students in total and each one prefers exactly one of the two subjects, how many prefer mathematics?',
  'La razón $5 : 4$ divide a los estudiantes en $5 + 4 = 9$ partes iguales. Cada parte representa $36/9 = 4$ estudiantes. Los que prefieren matemáticas son 5 partes: $5 \times 4 = 20$.',
  'The ratio $5 : 4$ divides the students into $5 + 4 = 9$ equal parts. Each part represents $36/9 = 4$ students. Those who prefer mathematics are 5 parts: $5 \times 4 = 20$.',
  'integer', '20',
  null, null,
  false, null, null,
  1, 'Numoria Challenge Contest #2 — Original problem set', 2026, true
),

-- Problema 2 — Estadística (★ Fácil)
(
  'numoria-c2m-p2-estadistica-promedio',
  'statistics', 1, 'middle',
  'Estadística', 'Statistics',
  'El promedio de cinco números enteros es 38. Si se elimina uno de ellos, el promedio de los cuatro números restantes es 35. ¿Cuál es el número que fue eliminado?',
  'The average of five integers is 38. If one of them is removed, the average of the remaining four integers is 35. What is the integer that was removed?',
  'La suma de los cinco números es $5 \times 38 = 190$. La suma de los cuatro restantes es $4 \times 35 = 140$. El número eliminado es $190 - 140 = 50$.',
  'The sum of the five integers is $5 \times 38 = 190$. The sum of the remaining four is $4 \times 35 = 140$. The integer removed is $190 - 140 = 50$.',
  'integer', '50',
  null, null,
  false, null, null,
  1, 'Numoria Challenge Contest #2 — Original problem set', 2026, true
),

-- Problema 3 — Álgebra (★★ Medio) — pair_decimal con directiva
(
  'numoria-c2m-p3-algebra-frutas',
  'algebra', 2, 'middle',
  'Álgebra', 'Algebra',
  'En la Tienda Pérez, 3 manzanas y 2 peras cuestan $7.40, mientras que 5 manzanas y 4 peras cuestan $13.40. ¿Cuál es el costo, en dólares, de una manzana y de una pera?',
  'At Perez Store, 3 apples and 2 pears cost $7.40, while 5 apples and 4 pears cost $13.40. What is the cost, in dollars, of one apple and of one pear?',
  'Sean $a$ y $p$ los costos de una manzana y una pera. Sistema: $3a + 2p = 7.40$ y $5a + 4p = 13.40$. Multiplicando la primera por 2: $6a + 4p = 14.80$. Restando la segunda: $a = 14.80 - 13.40 = 1.40$. Luego $2p = 7.40 - 3(1.40) = 3.20$, así $p = 1.60$.',
  'Let $a$ and $p$ be the costs of one apple and one pear. System: $3a + 2p = 7.40$ and $5a + 4p = 13.40$. Multiply the first by 2: $6a + 4p = 14.80$. Subtract the second: $a = 14.80 - 13.40 = 1.40$. Then $2p = 7.40 - 3(1.40) = 3.20$, so $p = 1.60$.',
  'pair_decimal', '1.40,1.60',
  '(Ambos números requeridos)', '(Both numbers required)',
  false, null, null,
  2, 'Numoria Challenge Contest #2 — Original problem set', 2026, true
),

-- Problema 4 — Teoría de números (★★★ Difícil — SPIKE en posición 4)
(
  'numoria-c2m-p4-teoria-digitos',
  'number_theory', 3, 'middle',
  'Teoría de números', 'Number Theory',
  'Encuentra el menor entero positivo de tres dígitos cuyo producto de dígitos es 24 y cuya suma de dígitos es 11.',
  'Find the smallest positive three-digit integer whose digit product is 24 and whose digit sum is 11.',
  'Sean los dígitos $d_1, d_2, d_3$ con $d_1 \geq 1$. Se requiere $d_1 \cdot d_2 \cdot d_3 = 24$ y $d_1 + d_2 + d_3 = 11$. Para minimizar el número, fijamos $d_1 = 1$: entonces $d_2 \cdot d_3 = 24$ y $d_2 + d_3 = 10$. Los factores de 24 que suman 10 son 4 y 6. Los dígitos son $\{1, 4, 6\}$ y el menor arreglo es $146$. Verificación: $1 + 4 + 6 = 11$, $1 \cdot 4 \cdot 6 = 24$.',
  'Let the digits be $d_1, d_2, d_3$ with $d_1 \geq 1$. We need $d_1 \cdot d_2 \cdot d_3 = 24$ and $d_1 + d_2 + d_3 = 11$. To minimize the number, set $d_1 = 1$: then $d_2 \cdot d_3 = 24$ and $d_2 + d_3 = 10$. The factors of 24 that sum to 10 are 4 and 6. The digit set is $\{1, 4, 6\}$ and the smallest arrangement is $146$. Check: $1 + 4 + 6 = 11$, $1 \cdot 4 \cdot 6 = 24$.',
  'integer', '146',
  null, null,
  false, null, null,
  3, 'Numoria Challenge Contest #2 — Original problem set', 2026, true
),

-- Problema 5 — Geometría plana (★★ Medio) — CON DIAGRAMA
(
  'numoria-c2m-p5-geometria-rectangulo',
  'plane_geometry', 2, 'middle',
  'Geometría plana', 'Plane Geometry',
  'Un rectángulo tiene un perímetro de 28 cm y una diagonal de 10 cm. ¿Cuál es el área del rectángulo, en cm²?',
  'A rectangle has a perimeter of 28 cm and a diagonal of 10 cm. What is the area of the rectangle, in cm²?',
  'Sean $L$ y $W$ los lados. Del perímetro: $L + W = 14$. De la diagonal (Pitágoras): $L^2 + W^2 = 100$. Usando la identidad $(L + W)^2 = L^2 + 2LW + W^2$, se tiene $196 = 100 + 2LW$, de donde $LW = 48$. El área es $LW = 48$ cm². (No es necesario calcular $L$ y $W$ por separado.)',
  'Let $L$ and $W$ be the sides. From the perimeter: $L + W = 14$. From the diagonal (Pythagoras): $L^2 + W^2 = 100$. Using the identity $(L + W)^2 = L^2 + 2LW + W^2$, we get $196 = 100 + 2LW$, so $LW = 48$. The area is $LW = 48$ cm². (No need to compute $L$ and $W$ separately.)',
  'with_units', '48 cm²',
  null, null,
  true, '(no dibujado a escala)', '(not drawn to scale)',
  2, 'Numoria Challenge Contest #2 — Original problem set', 2026, true
),

-- Problema 6 — Conteo (★★★ Difícil)
(
  'numoria-c2m-p6-conteo-digitos',
  'counting_combinatorics', 3, 'middle',
  'Conteo', 'Counting',
  '¿Cuántos enteros positivos de tres dígitos tienen exactamente dos de sus tres dígitos iguales entre sí? (Por ejemplo, 343 y 661 cumplen; 222 y 158 no cumplen.)',
  'How many positive three-digit integers have exactly two of their three digits equal to each other? (For example, 343 and 661 qualify; 222 and 158 do not.)',
  'Total de enteros de tres dígitos: $900$. Casos donde los tres dígitos son distintos: $9 \cdot 9 \cdot 8 = 648$ (primer dígito 1-9, segundo distinto del primero, tercero distinto de los dos previos). Casos donde los tres son iguales: $9$ (de 111 a 999). Por conteo complementario, los que tienen exactamente dos iguales son $900 - 648 - 9 = 243$.',
  'Total three-digit integers: $900$. Integers with all three digits distinct: $9 \cdot 9 \cdot 8 = 648$ (first digit 1-9, second different from first, third different from the previous two). Integers with all three equal: $9$ (from 111 to 999). By complementary counting, those with exactly two equal digits are $900 - 648 - 9 = 243$.',
  'integer', '243',
  null, null,
  false, null, null,
  3, 'Numoria Challenge Contest #2 — Original problem set', 2026, true
),

-- Problema 7 — Mezclas (★★★ Difícil) — categoría rara
(
  'numoria-c2m-p7-mezclas-alcohol',
  'mixtures', 3, 'middle',
  'Mezclas', 'Mixtures',
  'Sofía tiene 80 mL de una solución que contiene 30% de alcohol puro. ¿Cuántos mL de agua pura debe agregar a la solución para que la concentración de alcohol resultante sea exactamente del 20%?',
  'Sofia has 80 mL of a solution containing 30% pure alcohol. How many mL of pure water must she add to the solution so that the resulting alcohol concentration is exactly 20%?',
  'La cantidad de alcohol no cambia al agregar agua: $80 \times 0.30 = 24$ mL. Sea $x$ los mL de agua añadidos. El volumen total es $80 + x$ y la concentración debe ser 20%: $\frac{24}{80 + x} = 0.20$. Despejando: $80 + x = 120$, así $x = 40$ mL.',
  'The amount of alcohol does not change when water is added: $80 \times 0.30 = 24$ mL. Let $x$ be the mL of water added. The total volume is $80 + x$ and the concentration must be 20%: $\frac{24}{80 + x} = 0.20$. Solving: $80 + x = 120$, so $x = 40$ mL.',
  'with_units', '40 mL',
  null, null,
  false, null, null,
  3, 'Numoria Challenge Contest #2 — Original problem set', 2026, true
);

-- ============================================================
-- INSERT contest #2
-- ============================================================

-- scheduled_at = hace 1 hora, status = active (para poder probarlo inmediatamente)
insert into public.contests (
  slug, contest_number, season_year, division,
  title_es, title_en,
  scheduled_at, duration_minutes,
  calculator_allowed,
  generated_by_ai, generation_metadata,
  status
) values (
  'numoria-c2-m-2026',
  2, 2026, 'middle',
  'Numoria Challenge Contest #2 — División M',
  'Numoria Challenge Contest #2 — Division M',
  now() - interval '1 hour', 35,
  true,
  true,
  jsonb_build_object(
    'model', 'claude-opus-4-7',
    'prompt_version', 'numoria-v1.0',
    'generated_at', '2026-05-08T00:00:00Z',
    'spike_inserted', true,
    'spike_position', 4,
    'topics', jsonb_build_array(
      'ratios_proportions', 'statistics', 'algebra', 'number_theory',
      'plane_geometry', 'counting_combinatorics', 'mixtures'
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
    (1, 'numoria-c2m-p1-razones-flores'),
    (2, 'numoria-c2m-p2-estadistica-promedio'),
    (3, 'numoria-c2m-p3-algebra-frutas'),
    (4, 'numoria-c2m-p4-teoria-digitos'),
    (5, 'numoria-c2m-p5-geometria-rectangulo'),
    (6, 'numoria-c2m-p6-conteo-digitos'),
    (7, 'numoria-c2m-p7-mezclas-alcohol')
) as pos(position, slug)
join public.problems p on p.slug = pos.slug
where c.slug = 'numoria-c2-m-2026';
