-- 20260602000003_seed_summer_bowl_1.sql
--
-- Contenido del Numoria Summer Bowl #1 (sb1-2026): 7 problemas + el contest
-- que se resuelve ONLINE (mismo motor que las prácticas: calificación
-- automática, sin requerir equipo).
--
-- El contest queda status='active' con scheduled_at = 15 jun 2026 14:00 UTC
-- (8:00 a.m. Honduras) y ventana de 8 días. Antes del 15 el motor responde
-- "aún no empieza"; del 15 al 23 es tomable. Set único para todos (Opción A).
--
-- Idempotente: on conflict do nothing en todo.

-- ============================================================
-- 7 PROBLEMAS (bilingües, publicados)
-- ============================================================
insert into public.problems (
  slug, category, stars, division,
  title_es, title_en,
  body_es, body_en,
  explanation_es, explanation_en,
  answer_type, expected_answer,
  format_directive_es, format_directive_en,
  has_diagram, points, source, source_year, published
) values
-- P1 Aritmética/Dinero ★
(
  'numoria-sb1-p1-dinero-pulseras',
  'money', 1, 'middle',
  'Aritmética', 'Arithmetic',
  'Numa vendió 5 cajas de pulseras y cada caja le dio 24 lempiras. Si gastó 30 lempiras en materiales, ¿cuánta ganancia obtuvo en total?',
  'Numa sold 5 boxes of bracelets and each box earned 24 lempiras. If she spent 30 lempiras on materials, how much total profit did she make?',
  'Primero sumamos lo que ganó: $5 \times 24 = 120$ lempiras. Luego restamos los gastos: $120 - 30 = 90$ lempiras.',
  'First we add what she earned: $5 \times 24 = 120$ lempiras. Then we subtract the cost: $120 - 30 = 90$ lempiras.',
  'integer', '90',
  null, null,
  false, 1, 'Numoria Challenge — Summer Bowl #1', 2026, true
),
-- P2 Teoría de números ★★
(
  'numoria-sb1-p2-numeros-cifras',
  'number_theory', 2, 'middle',
  'Números', 'Numbers',
  '¿Cuál es el número de tres cifras más pequeño cuyas cifras suman 7?',
  'What is the smallest three-digit number whose digits add up to 7?',
  'Para que el número sea lo más pequeño posible, la cifra de las centenas debe ser la menor (1) y la de las decenas también (0). Las unidades completan la suma: $1 + 0 + 6 = 7$. El número es 106.',
  'To make the number as small as possible, the hundreds digit must be the smallest (1) and the tens digit too (0). The units complete the sum: $1 + 0 + 6 = 7$. The number is 106.',
  'integer', '106',
  null, null,
  false, 2, 'Numoria Challenge — Summer Bowl #1', 2026, true
),
-- P3 Geometría plana ★★
(
  'numoria-sb1-p3-geometria-rectangulo',
  'plane_geometry', 2, 'middle',
  'Geometría', 'Geometry',
  'Un rectángulo mide 8 cm de largo y 5 cm de ancho. ¿Cuál es la diferencia entre su área (en cm²) y su perímetro (en cm)?',
  'A rectangle is 8 cm long and 5 cm wide. What is the difference between its area (in cm²) and its perimeter (in cm)?',
  'El área es $8 \times 5 = 40$ cm². El perímetro es $2 \times (8 + 5) = 26$ cm. La diferencia es $40 - 26 = 14$.',
  'The area is $8 \times 5 = 40$ cm². The perimeter is $2 \times (8 + 5) = 26$ cm. The difference is $40 - 26 = 14$.',
  'integer', '14',
  'Solo el número.', 'Just the number.',
  false, 2, 'Numoria Challenge — Summer Bowl #1', 2026, true
),
-- P4 Fracciones ★★
(
  'numoria-sb1-p4-fracciones-pastel',
  'fractions_decimals', 2, 'middle',
  'Fracciones', 'Fractions',
  'En una fiesta se comió $\frac{3}{5}$ de un pastel en la mañana. En la tarde se comió $\frac{1}{4}$ de lo que quedaba. ¿Qué fracción del pastel entero se comió en la tarde?',
  'At a party, $\frac{3}{5}$ of a cake was eaten in the morning. In the afternoon, $\frac{1}{4}$ of what was left was eaten. What fraction of the whole cake was eaten in the afternoon?',
  'Después de la mañana queda $1 - \frac{3}{5} = \frac{2}{5}$ del pastel. En la tarde se come $\frac{1}{4}$ de ese resto: $\frac{1}{4} \times \frac{2}{5} = \frac{2}{20} = \frac{1}{10}$.',
  'After the morning, $1 - \frac{3}{5} = \frac{2}{5}$ of the cake is left. In the afternoon, $\frac{1}{4}$ of that remainder is eaten: $\frac{1}{4} \times \frac{2}{5} = \frac{2}{20} = \frac{1}{10}$.',
  'fraction_simplified', '1/10',
  'Como fracción simplificada (ej: 1/10).', 'As a simplified fraction (e.g. 1/10).',
  false, 2, 'Numoria Challenge — Summer Bowl #1', 2026, true
),
-- P5 Razones y proporciones ★★
(
  'numoria-sb1-p5-proporciones-receta',
  'ratios_proportions', 2, 'middle',
  'Proporciones', 'Proportions',
  'Una receta para 4 personas usa 6 huevos. Manteniendo la proporción, ¿cuántos huevos se necesitan para 10 personas?',
  'A recipe for 4 people uses 6 eggs. Keeping the proportion, how many eggs are needed for 10 people?',
  'Por persona se usan $\frac{6}{4} = 1.5$ huevos. Para 10 personas: $1.5 \times 10 = 15$ huevos.',
  'Per person, $\frac{6}{4} = 1.5$ eggs are used. For 10 people: $1.5 \times 10 = 15$ eggs.',
  'integer', '15',
  null, null,
  false, 2, 'Numoria Challenge — Summer Bowl #1', 2026, true
),
-- P6 Conteo ★★★
(
  'numoria-sb1-p6-conteo-numa',
  'counting_combinatorics', 3, 'middle',
  'Conteo', 'Counting',
  '¿De cuántas maneras distintas se pueden ordenar las 4 letras de la palabra NUMA?',
  'In how many different ways can the 4 letters of the word NUMA be arranged?',
  'Las 4 letras son distintas (N, U, M, A). El número de ordenamientos es $4! = 4 \times 3 \times 2 \times 1 = 24$.',
  'The 4 letters are all different (N, U, M, A). The number of arrangements is $4! = 4 \times 3 \times 2 \times 1 = 24$.',
  'integer', '24',
  null, null,
  false, 3, 'Numoria Challenge — Summer Bowl #1', 2026, true
),
-- P7 Lógica ★★★
(
  'numoria-sb1-p7-logica-digito',
  'logic', 3, 'middle',
  'Lógica', 'Logic',
  'Numa escribe todos los números enteros del 1 al 100. ¿Cuántas veces escribe el dígito 1 en total?',
  'Numa writes all the whole numbers from 1 to 100. How many times does she write the digit 1 in total?',
  'Contamos por posición. En las unidades, el 1 aparece en 1, 11, 21, ..., 91: son 10 veces. En las decenas aparece en 10, 11, ..., 19: otras 10 veces. En el 100 aparece 1 vez en las centenas. Total: $10 + 10 + 1 = 21$.',
  'We count by position. In the units, 1 appears in 1, 11, 21, ..., 91: that is 10 times. In the tens it appears in 10, 11, ..., 19: another 10 times. In 100 it appears once in the hundreds. Total: $10 + 10 + 1 = 21$.',
  'integer', '21',
  null, null,
  false, 3, 'Numoria Challenge — Summer Bowl #1', 2026, true
)
on conflict (slug) do nothing;

-- ============================================================
-- CONTEST del Summer Bowl #1 (resoluble online, como práctica)
-- ============================================================
insert into public.contests (
  slug, contest_number, season_year, division,
  title_es, title_en,
  scheduled_at, duration_minutes, calculator_allowed,
  status, contest_type, bowl_id, calendar_window_days
) values (
  'numoria-sb1-2026', 7, 2026, 'middle',
  'Summer Bowl #1', 'Summer Bowl #1',
  '2026-06-15 14:00:00+00', 45, true,
  'active', 'summer_bowl', 'sb1-2026', 8
)
on conflict (slug) do nothing;

-- ============================================================
-- Vincular los 7 problemas al contest (posiciones 1-7)
-- ============================================================
insert into public.contest_problems (contest_id, problem_id, position)
select c.id, p.id, pos.position
from public.contests c
cross join (values
  (1, 'numoria-sb1-p1-dinero-pulseras'),
  (2, 'numoria-sb1-p2-numeros-cifras'),
  (3, 'numoria-sb1-p3-geometria-rectangulo'),
  (4, 'numoria-sb1-p4-fracciones-pastel'),
  (5, 'numoria-sb1-p5-proporciones-receta'),
  (6, 'numoria-sb1-p6-conteo-numa'),
  (7, 'numoria-sb1-p7-logica-digito')
) as pos(position, slug)
join public.problems p on p.slug = pos.slug
where c.slug = 'numoria-sb1-2026'
on conflict do nothing;
