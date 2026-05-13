-- ==========================================================
-- Numoria Challenge — Migration 0024: Seed Practice #1 — 21 problemas
--
-- Phase 4.5a — populate las 3 versiones de Practice #1 con 7 problemas c/u.
-- Following docs/problem-authoring-guidelines.md:
--   - 2+ palancas de creatividad por problema
--   - 7 categorías distintas (no repetir rama dentro de un contest)
--   - Bilingüe ES + EN con explicaciones KaTeX
--   - Elementary sin calculadora (regla cardinal)
--   - Middle con + sin calc según versión
--
-- 3 contests:
--   numoria-p1e-2026  — División E (sin calc) — 7 problemas Elementary
--   numoria-p1m-2026  — División M (sin calc) — 7 problemas Middle no-calc
--   numoria-p1mc-2026 — División M (con calc) — 7 problemas Middle con-calc
-- ==========================================================

-- ============================================================
-- PRACTICE #1 — DIVISIÓN E (sin calculadora) — 7 problemas
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
-- P1 Aritmética ★ — operación con contexto real (palanca: contexto no escolar)
(
  'numoria-p1e-p1-aritmetica-tienda',
  'money', 1, 'elementary',
  'Aritmética', 'Arithmetic',
  'En la tienda de Doña Rosa hay 4 cajas con 12 pelotas cada una. Si vende 15 pelotas, ¿cuántas pelotas le quedan?',
  'At Doña Rosa''s store there are 4 boxes with 12 balls each. If she sells 15 balls, how many balls are left?',
  'Primero contamos el total: $4 \times 12 = 48$ pelotas. Luego restamos las vendidas: $48 - 15 = 33$ pelotas.',
  'First we count the total: $4 \times 12 = 48$ balls. Then we subtract the sold ones: $48 - 15 = 33$ balls.',
  'integer', '33',
  null, null,
  false, null, null,
  1, 'Numoria Challenge — Practice #1', 2026, true
),
-- P2 Tiempo/fechas ★ — días entre fechas (palanca: observación antes que cálculo)
(
  'numoria-p1e-p2-tiempo-vacaciones',
  'time_clocks', 1, 'elementary',
  'Tiempo', 'Time',
  'Las vacaciones empiezan el 10 de diciembre y terminan el 30 de diciembre del mismo año. ¿Cuántos días duran las vacaciones?',
  'Vacation starts on December 10 and ends on December 30 of the same year. How many days does the vacation last?',
  'Del 10 al 30 hay $30 - 10 = 20$ días de diferencia, pero como ambos días cuentan: $20 + 1 = 21$ días.',
  'From the 10th to the 30th there are $30 - 10 = 20$ days difference, but since both days count: $20 + 1 = 21$ days.',
  'integer', '21',
  null, null,
  false, null, null,
  1, 'Numoria Challenge — Practice #1', 2026, true
),
-- P3 Geometría plana ★★ — área de triángulo (palanca: inferencia faltante)
(
  'numoria-p1e-p3-geometria-triangulo',
  'plane_geometry', 2, 'elementary',
  'Geometría plana', 'Plane Geometry',
  'Un triángulo tiene una base de 10 cm y una altura de 6 cm. ¿Cuál es el área del triángulo, en cm²?',
  'A triangle has a base of 10 cm and a height of 6 cm. What is the area of the triangle, in cm²?',
  'El área de un triángulo se calcula como $\frac{\text{base} \times \text{altura}}{2}$. Sustituyendo: $\frac{10 \times 6}{2} = \frac{60}{2} = 30$ cm².',
  'The area of a triangle is calculated as $\frac{\text{base} \times \text{height}}{2}$. Substituting: $\frac{10 \times 6}{2} = \frac{60}{2} = 30$ cm².',
  'integer', '30',
  'Solo el número (en cm²).', 'Just the number (in cm²).',
  true, '(no dibujado a escala)', '(not drawn to scale)',
  2, 'Numoria Challenge — Practice #1', 2026, true
),
-- P4 Fracciones ★★ — comparación (palanca: doble restricción)
(
  'numoria-p1e-p4-fracciones-pizza',
  'fractions_decimals', 2, 'elementary',
  'Fracciones', 'Fractions',
  'Ana comió $\frac{3}{8}$ de una pizza y Beto comió $\frac{1}{4}$ de la misma pizza. ¿Qué fracción de la pizza comieron entre los dos?',
  'Ana ate $\frac{3}{8}$ of a pizza and Beto ate $\frac{1}{4}$ of the same pizza. What fraction of the pizza did they eat together?',
  'Necesitamos sumar las fracciones con común denominador. $\frac{1}{4} = \frac{2}{8}$. Entonces $\frac{3}{8} + \frac{2}{8} = \frac{5}{8}$.',
  'We need to add the fractions with a common denominator. $\frac{1}{4} = \frac{2}{8}$. So $\frac{3}{8} + \frac{2}{8} = \frac{5}{8}$.',
  'fraction_simplified', '5/8',
  'Como fracción simplificada (ej: 3/8).', 'As simplified fraction (e.g. 3/8).',
  false, null, null,
  2, 'Numoria Challenge — Practice #1', 2026, true
),
-- P5 Razones ★★ — escala (palanca: contexto real)
(
  'numoria-p1e-p5-razones-mapa',
  'ratios_proportions', 2, 'elementary',
  'Razones', 'Ratios',
  'En un mapa, 2 cm representan 50 km en la realidad. Si dos ciudades están separadas por 8 cm en el mapa, ¿a cuántos km de distancia están en la realidad?',
  'On a map, 2 cm represents 50 km in real life. If two cities are 8 cm apart on the map, how many km apart are they in real life?',
  'La razón es $2 \text{ cm} : 50 \text{ km}$. Si en el mapa son $8 = 2 \times 4$ cm, en la realidad son $50 \times 4 = 200$ km.',
  'The ratio is $2 \text{ cm} : 50 \text{ km}$. If on the map it''s $8 = 2 \times 4$ cm, in reality it''s $50 \times 4 = 200$ km.',
  'integer', '200',
  null, null,
  false, null, null,
  2, 'Numoria Challenge — Practice #1', 2026, true
),
-- P6 Lógica ★★★ — criptoaritmética simple (palanca: inversión + restricción oculta)
(
  'numoria-p1e-p6-logica-criptoaritmetica',
  'logic', 3, 'elementary',
  'Lógica', 'Logic',
  'Cada letra representa un dígito distinto. Si $A + B = 9$ y $A - B = 3$, ¿cuál es el valor de $A \times B$?',
  'Each letter represents a different digit. If $A + B = 9$ and $A - B = 3$, what is the value of $A \times B$?',
  'Sumando las dos ecuaciones: $(A+B) + (A-B) = 9 + 3$, que da $2A = 12$, entonces $A = 6$. Sustituyendo: $6 + B = 9$, entonces $B = 3$. Producto: $A \times B = 6 \times 3 = 18$.',
  'Adding both equations: $(A+B) + (A-B) = 9 + 3$, gives $2A = 12$, so $A = 6$. Substituting: $6 + B = 9$, so $B = 3$. Product: $A \times B = 6 \times 3 = 18$.',
  'integer', '18',
  null, null,
  false, null, null,
  3, 'Numoria Challenge — Practice #1', 2026, true
),
-- P7 Patrones ★★★ — secuencia visual creciente (palanca: observación + inferencia)
(
  'numoria-p1e-p7-patrones-cuadrados',
  'sequences_patterns', 3, 'elementary',
  'Patrones', 'Patterns',
  'Observa el patrón: Figura 1 tiene 1 cuadrito, Figura 2 tiene 4 cuadritos, Figura 3 tiene 9 cuadritos, Figura 4 tiene 16 cuadritos. ¿Cuántos cuadritos tendrá la Figura 7?',
  'Observe the pattern: Figure 1 has 1 little square, Figure 2 has 4 little squares, Figure 3 has 9 little squares, Figure 4 has 16 little squares. How many little squares will Figure 7 have?',
  'El patrón son los cuadrados perfectos: $1 = 1^2$, $4 = 2^2$, $9 = 3^2$, $16 = 4^2$. La Figura $n$ tiene $n^2$ cuadritos. Para $n = 7$: $7^2 = 49$ cuadritos.',
  'The pattern are perfect squares: $1 = 1^2$, $4 = 2^2$, $9 = 3^2$, $16 = 4^2$. Figure $n$ has $n^2$ little squares. For $n = 7$: $7^2 = 49$ little squares.',
  'integer', '49',
  null, null,
  true, '(Figuras 1-4 mostradas)', '(Figures 1-4 shown)',
  3, 'Numoria Challenge — Practice #1', 2026, true
);

-- ============================================================
-- PRACTICE #1 — DIVISIÓN M (sin calculadora) — 7 problemas
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
-- M-P1 Álgebra ★ — ecuación lineal simple
(
  'numoria-p1m-p1-algebra-edades',
  'algebra', 1, 'middle',
  'Álgebra', 'Algebra',
  'Carla tiene el triple de la edad de su hermana. Si la suma de sus edades es 24 años, ¿cuántos años tiene Carla?',
  'Carla is three times her sister''s age. If the sum of their ages is 24 years, how old is Carla?',
  'Sea $x$ la edad de la hermana. Entonces Carla tiene $3x$. Su suma: $x + 3x = 24$, que da $4x = 24$, entonces $x = 6$. Carla tiene $3 \times 6 = 18$ años.',
  'Let $x$ be the sister''s age. Then Carla is $3x$. Their sum: $x + 3x = 24$, gives $4x = 24$, so $x = 6$. Carla is $3 \times 6 = 18$ years old.',
  'integer', '18',
  null, null,
  false, null, null,
  1, 'Numoria Challenge — Practice #1', 2026, true
),
-- M-P2 Teoría números ★ — divisibilidad combinada
(
  'numoria-p1m-p2-teoria-divisibilidad',
  'number_theory', 1, 'middle',
  'Teoría de números', 'Number Theory',
  '¿Cuál es el menor entero positivo que es divisible al mismo tiempo por 6, 8 y 9?',
  'What is the smallest positive integer that is divisible by 6, 8 and 9 at the same time?',
  'Necesitamos el MCM(6, 8, 9). Factorización: $6 = 2 \times 3$, $8 = 2^3$, $9 = 3^2$. MCM = $2^3 \times 3^2 = 8 \times 9 = 72$.',
  'We need LCM(6, 8, 9). Factorization: $6 = 2 \times 3$, $8 = 2^3$, $9 = 3^2$. LCM = $2^3 \times 3^2 = 8 \times 9 = 72$.',
  'integer', '72',
  null, null,
  false, null, null,
  1, 'Numoria Challenge — Practice #1', 2026, true
),
-- M-P3 Geometría plana ★★ — Pitágoras triple 5-12-13
(
  'numoria-p1m-p3-geometria-pitagoras',
  'pythagoras', 2, 'middle',
  'Geometría plana', 'Plane Geometry',
  'Un triángulo rectángulo tiene catetos de 5 cm y 12 cm. ¿Cuánto mide la hipotenusa, en cm?',
  'A right triangle has legs of 5 cm and 12 cm. How long is the hypotenuse, in cm?',
  'Por el teorema de Pitágoras: $h^2 = 5^2 + 12^2 = 25 + 144 = 169$. Entonces $h = \sqrt{169} = 13$ cm. (Es el triple pitagórico 5-12-13.)',
  'By the Pythagorean theorem: $h^2 = 5^2 + 12^2 = 25 + 144 = 169$. So $h = \sqrt{169} = 13$ cm. (It''s the 5-12-13 Pythagorean triple.)',
  'integer', '13',
  'Solo el número (en cm).', 'Just the number (in cm).',
  true, '(no dibujado a escala)', '(not drawn to scale)',
  2, 'Numoria Challenge — Practice #1', 2026, true
),
-- M-P4 Probabilidad ★★ — eventos sin reemplazo
(
  'numoria-p1m-p4-probabilidad-canicas',
  'probability', 2, 'middle',
  'Probabilidad', 'Probability',
  'En una bolsa hay 4 canicas rojas y 6 canicas azules. Sacas 2 canicas sin reposición. ¿Cuál es la probabilidad de que ambas sean rojas? Expresa la respuesta como fracción simplificada.',
  'A bag has 4 red marbles and 6 blue marbles. You take out 2 marbles without replacement. What is the probability that both are red? Express the answer as a simplified fraction.',
  'P(primera roja) $= \frac{4}{10}$. Después de sacar una roja: P(segunda roja) $= \frac{3}{9}$. Probabilidad combinada: $\frac{4}{10} \times \frac{3}{9} = \frac{12}{90} = \frac{2}{15}$.',
  'P(first red) $= \frac{4}{10}$. After taking one red: P(second red) $= \frac{3}{9}$. Combined probability: $\frac{4}{10} \times \frac{3}{9} = \frac{12}{90} = \frac{2}{15}$.',
  'fraction_simplified', '2/15',
  'Como fracción simplificada (ej: 1/4).', 'As simplified fraction (e.g. 1/4).',
  false, null, null,
  2, 'Numoria Challenge — Practice #1', 2026, true
),
-- M-P5 Conteo ★★ — caminos en grid 3x3
(
  'numoria-p1m-p5-conteo-caminos',
  'counting_combinatorics', 2, 'middle',
  'Conteo', 'Counting',
  'En una cuadrícula 3×3, ¿de cuántas maneras se puede ir de la esquina inferior izquierda a la esquina superior derecha moviéndose solo hacia arriba o hacia la derecha?',
  'On a 3×3 grid, how many ways can you go from the bottom-left corner to the top-right corner moving only up or right?',
  'En total hacemos 3 movimientos hacia arriba (U) y 3 hacia la derecha (R) — total 6 movimientos. El número de combinaciones es $\binom{6}{3} = \frac{6!}{3! \cdot 3!} = \frac{720}{36} = 20$.',
  'Total of 3 moves up (U) and 3 right (R) — 6 moves total. Combinations: $\binom{6}{3} = \frac{6!}{3! \cdot 3!} = \frac{720}{36} = 20$.',
  'integer', '20',
  null, null,
  true, '(cuadrícula 3×3)', '(3×3 grid)',
  2, 'Numoria Challenge — Practice #1', 2026, true
),
-- M-P6 Geometría 3D ★★★ — cubos pintados
(
  'numoria-p1m-p6-geometria-cubos-pintados',
  'geometry_3d', 3, 'middle',
  'Geometría 3D', '3D Geometry',
  'Un cubo de 3×3×3 está formado por 27 cubitos pequeños. Si se pinta toda la superficie del cubo grande de rojo, ¿cuántos cubitos pequeños tendrán exactamente 1 cara pintada?',
  'A 3×3×3 cube is made up of 27 small cubes. If the entire surface of the big cube is painted red, how many small cubes will have exactly 1 face painted?',
  'Los cubitos con exactamente 1 cara pintada están en el centro de cada cara del cubo grande (NO en aristas ni vértices). En un cubo 3×3×3, cada cara tiene $1$ cubito central. Hay 6 caras, entonces $6 \times 1 = 6$ cubitos con exactamente 1 cara pintada.',
  'Cubes with exactly 1 painted face are at the center of each face of the big cube (NOT on edges or vertices). On a 3×3×3 cube, each face has $1$ central cube. There are 6 faces, so $6 \times 1 = 6$ cubes with exactly 1 painted face.',
  'integer', '6',
  null, null,
  true, '(cubo 3×3×3)', '(3×3×3 cube)',
  3, 'Numoria Challenge — Practice #1', 2026, true
),
-- M-P7 Sucesiones ★★★ — Fibonacci-like
(
  'numoria-p1m-p7-sucesiones-fibonacci',
  'sequences_patterns', 3, 'middle',
  'Sucesiones', 'Sequences',
  'En la siguiente sucesión, cada número desde el tercero es la suma de los dos anteriores: 3, 7, 10, 17, 27, ... ¿Cuál es el séptimo término de la sucesión?',
  'In the following sequence, each number from the third onward is the sum of the two previous ones: 3, 7, 10, 17, 27, ... What is the seventh term of the sequence?',
  'Verificamos el patrón: $3 + 7 = 10$ (3°), $7 + 10 = 17$ (4°), $10 + 17 = 27$ (5°). Continuamos: $17 + 27 = 44$ (6°), $27 + 44 = 71$ (7°).',
  'Verify pattern: $3 + 7 = 10$ (3rd), $7 + 10 = 17$ (4th), $10 + 17 = 27$ (5th). Continue: $17 + 27 = 44$ (6th), $27 + 44 = 71$ (7th).',
  'integer', '71',
  null, null,
  false, null, null,
  3, 'Numoria Challenge — Practice #1', 2026, true
);

-- ============================================================
-- PRACTICE #1 — DIVISIÓN M (con calculadora) — 7 problemas
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
-- MC-P1 Porcentajes compuestos ★
(
  'numoria-p1mc-p1-porcentajes-compuestos',
  'percentages', 1, 'middle',
  'Porcentajes compuestos', 'Compound Percentages',
  'Un producto cuesta $200 lempiras. Le aumentan el precio un 20% y luego le aplican un descuento del 15% sobre el nuevo precio. ¿Cuánto cuesta al final, en lempiras?',
  'A product costs $200 lempiras. The price is increased by 20% and then a 15% discount is applied to the new price. What is the final price, in lempiras?',
  'Aumento de 20%: $200 \times 1.20 = 240$. Descuento del 15% sobre 240: $240 \times 0.85 = 204$. Precio final: 204 lempiras.',
  'Increase of 20%: $200 \times 1.20 = 240$. Discount of 15% on 240: $240 \times 0.85 = 204$. Final price: 204 lempiras.',
  'integer', '204',
  null, null,
  false, null, null,
  1, 'Numoria Challenge — Practice #1', 2026, true
),
-- MC-P2 Tasa-distancia-tiempo ★★ — encuentro
(
  'numoria-p1mc-p2-tasa-encuentro',
  'rate_time_distance', 2, 'middle',
  'Tasa, tiempo, distancia', 'Rate, Time, Distance',
  'Dos trenes salen de ciudades separadas por 540 km, viajando uno hacia el otro. Tren A va a 75 km/h y Tren B va a 60 km/h. ¿En cuántas horas se encuentran?',
  'Two trains leave from cities 540 km apart, traveling toward each other. Train A goes at 75 km/h and Train B at 60 km/h. In how many hours do they meet?',
  'Velocidad combinada de acercamiento: $75 + 60 = 135$ km/h. Tiempo para cubrir 540 km: $\frac{540}{135} = 4$ horas.',
  'Combined approach speed: $75 + 60 = 135$ km/h. Time to cover 540 km: $\frac{540}{135} = 4$ hours.',
  'integer', '4',
  null, null,
  false, null, null,
  2, 'Numoria Challenge — Practice #1', 2026, true
),
-- MC-P3 Probabilidad ★★ — árbol con 3 ramas
(
  'numoria-p1mc-p3-probabilidad-arbol',
  'probability', 2, 'middle',
  'Probabilidad', 'Probability',
  'En una caja hay 5 dulces de menta y 3 de chocolate. Sacas 3 dulces sin reposición. ¿Cuál es la probabilidad de que los 3 sean de menta? Expresa como fracción simplificada.',
  'A box has 5 mint candies and 3 chocolate ones. You take out 3 candies without replacement. What is the probability that all 3 are mint? Express as simplified fraction.',
  'P(3 mentas) $= \frac{5}{8} \times \frac{4}{7} \times \frac{3}{6} = \frac{60}{336} = \frac{5}{28}$.',
  'P(3 mints) $= \frac{5}{8} \times \frac{4}{7} \times \frac{3}{6} = \frac{60}{336} = \frac{5}{28}$.',
  'fraction_simplified', '5/28',
  'Como fracción simplificada.', 'As simplified fraction.',
  false, null, null,
  2, 'Numoria Challenge — Practice #1', 2026, true
),
-- MC-P4 Geometría 3D ★★ — volumen cilindro
(
  'numoria-p1mc-p4-geometria-cilindro',
  'geometry_3d', 2, 'middle',
  'Geometría 3D', '3D Geometry',
  'Un cilindro tiene radio de 5 cm y altura de 10 cm. ¿Cuál es su volumen? Expresa la respuesta usando $\pi$ (ej: $250\pi$).',
  'A cylinder has a radius of 5 cm and a height of 10 cm. What is its volume? Express the answer using $\pi$ (e.g.: $250\pi$).',
  'Volumen de cilindro: $V = \pi r^2 h = \pi \times 5^2 \times 10 = \pi \times 25 \times 10 = 250\pi$ cm³.',
  'Cylinder volume: $V = \pi r^2 h = \pi \times 5^2 \times 10 = \pi \times 25 \times 10 = 250\pi$ cm³.',
  'symbolic_pi', '250π',
  'Usa π (ej: 250π).', 'Use π (e.g. 250π).',
  true, '(cilindro vertical)', '(vertical cylinder)',
  2, 'Numoria Challenge — Practice #1', 2026, true
),
-- MC-P5 Estadística ★★★ — promedio ponderado con outlier
(
  'numoria-p1mc-p5-estadistica-promedio',
  'statistics', 3, 'middle',
  'Estadística', 'Statistics',
  'En un curso de 20 estudiantes, el promedio de notas es 78. Si se retira un estudiante con nota 38, ¿cuál es el nuevo promedio de los 19 estudiantes restantes?',
  'In a class of 20 students, the grade average is 78. If a student with grade 38 leaves, what is the new average of the remaining 19 students?',
  'Suma original de notas: $20 \times 78 = 1560$. Sin el estudiante de nota 38: $1560 - 38 = 1522$. Nuevo promedio: $\frac{1522}{19} = 80.105...$, redondeado a 2 decimales: $80.11$. Para respuesta exacta entera: $\frac{1522}{19} = 80.\overline{1052631578947368421}$. La respuesta exacta como fracción: $\frac{1522}{19}$. Aproximado: 80.',
  'Original sum of grades: $20 \times 78 = 1560$. Without the student with grade 38: $1560 - 38 = 1522$. New average: $\frac{1522}{19} = 80.105...$, rounded: $80.11$. Exact integer answer: $\frac{1522}{19} = 80.\overline{105}$. Approx: 80.',
  'integer', '80',
  'Redondea al entero más cercano.', 'Round to the nearest integer.',
  false, null, null,
  3, 'Numoria Challenge — Practice #1', 2026, true
),
-- MC-P6 Mezclas ★★★ — concentración
(
  'numoria-p1mc-p6-mezclas-alcohol',
  'mixtures', 3, 'middle',
  'Mezclas', 'Mixtures',
  '¿Cuántos mililitros de agua se deben agregar a 200 ml de una solución al 40% de alcohol para obtener una solución al 25% de alcohol?',
  'How many milliliters of water must be added to 200 ml of a 40% alcohol solution to get a 25% alcohol solution?',
  'Cantidad de alcohol puro: $200 \times 0.40 = 80$ ml. Esta cantidad permanece constante. En la nueva solución, $80$ ml representan el 25% del total: $\frac{80}{0.25} = 320$ ml. Agua a agregar: $320 - 200 = 120$ ml.',
  'Pure alcohol amount: $200 \times 0.40 = 80$ ml. This amount stays constant. In the new solution, $80$ ml represents 25% of total: $\frac{80}{0.25} = 320$ ml. Water to add: $320 - 200 = 120$ ml.',
  'integer', '120',
  'Solo el número (en mL).', 'Just the number (in mL).',
  false, null, null,
  3, 'Numoria Challenge — Practice #1', 2026, true
),
-- MC-P7 Sistemas 2x2 ★★★
(
  'numoria-p1mc-p7-sistemas-lineales',
  'algebra', 3, 'middle',
  'Sistemas de ecuaciones', 'Systems of Equations',
  'En una tienda, 3 lápices y 2 cuadernos cuestan 90 lempiras. 5 lápices y 4 cuadernos cuestan 170 lempiras. ¿Cuánto cuesta un cuaderno, en lempiras?',
  'In a store, 3 pencils and 2 notebooks cost 90 lempiras. 5 pencils and 4 notebooks cost 170 lempiras. How much does one notebook cost, in lempiras?',
  'Sea $l$ el precio del lápiz y $c$ el del cuaderno. Sistema: $3l + 2c = 90$, $5l + 4c = 170$. Multiplico la primera por 2: $6l + 4c = 180$. Resto la segunda: $(6l + 4c) - (5l + 4c) = 180 - 170$, da $l = 10$. Sustituyo: $3(10) + 2c = 90$, $2c = 60$, $c = 30$ lempiras.',
  'Let $p$ be the pencil price and $n$ the notebook''s. System: $3p + 2n = 90$, $5p + 4n = 170$. Multiply first by 2: $6p + 4n = 180$. Subtract second: $(6p + 4n) - (5p + 4n) = 180 - 170$, gives $p = 10$. Substitute: $3(10) + 2n = 90$, $2n = 60$, $n = 30$ lempiras.',
  'integer', '30',
  null, null,
  false, null, null,
  3, 'Numoria Challenge — Practice #1', 2026, true
);

-- ============================================================
-- contest_problems — asociar 7 problemas a cada uno de los 3 contests
-- ============================================================

-- Practice #1 D-E
insert into public.contest_problems (contest_id, problem_id, position)
select c.id, p.id, pos.position
from public.contests c
cross join (values
  (1, 'numoria-p1e-p1-aritmetica-tienda'),
  (2, 'numoria-p1e-p2-tiempo-vacaciones'),
  (3, 'numoria-p1e-p3-geometria-triangulo'),
  (4, 'numoria-p1e-p4-fracciones-pizza'),
  (5, 'numoria-p1e-p5-razones-mapa'),
  (6, 'numoria-p1e-p6-logica-criptoaritmetica'),
  (7, 'numoria-p1e-p7-patrones-cuadrados')
) as pos(position, slug)
join public.problems p on p.slug = pos.slug
where c.slug = 'numoria-p1e-2026';

-- Practice #1 D-M sin calc
insert into public.contest_problems (contest_id, problem_id, position)
select c.id, p.id, pos.position
from public.contests c
cross join (values
  (1, 'numoria-p1m-p1-algebra-edades'),
  (2, 'numoria-p1m-p2-teoria-divisibilidad'),
  (3, 'numoria-p1m-p3-geometria-pitagoras'),
  (4, 'numoria-p1m-p4-probabilidad-canicas'),
  (5, 'numoria-p1m-p5-conteo-caminos'),
  (6, 'numoria-p1m-p6-geometria-cubos-pintados'),
  (7, 'numoria-p1m-p7-sucesiones-fibonacci')
) as pos(position, slug)
join public.problems p on p.slug = pos.slug
where c.slug = 'numoria-p1m-2026';

-- Practice #1 D-M con calc
insert into public.contest_problems (contest_id, problem_id, position)
select c.id, p.id, pos.position
from public.contests c
cross join (values
  (1, 'numoria-p1mc-p1-porcentajes-compuestos'),
  (2, 'numoria-p1mc-p2-tasa-encuentro'),
  (3, 'numoria-p1mc-p3-probabilidad-arbol'),
  (4, 'numoria-p1mc-p4-geometria-cilindro'),
  (5, 'numoria-p1mc-p5-estadistica-promedio'),
  (6, 'numoria-p1mc-p6-mezclas-alcohol'),
  (7, 'numoria-p1mc-p7-sistemas-lineales')
) as pos(position, slug)
join public.problems p on p.slug = pos.slug
where c.slug = 'numoria-p1mc-2026';
