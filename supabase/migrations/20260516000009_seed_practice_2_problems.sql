-- ==========================================================
-- Numoria Challenge — Migration 0028: Seed Practice #2 — 21 problemas
--
-- Phase 4.5b — populate las 3 versiones de Practice #2 con 7 problemas c/u.
--
-- REGLA DE UNICIDAD: ningún problema, contexto o palanca de Practice #1
-- se reutiliza aquí. Verificado contra los 21 slugs ya existentes.
--
-- 3 contests target:
--   numoria-p2e-2026  — División E (sin calc) — 7 problemas Elementary
--   numoria-p2m-2026  — División M (sin calc) — 7 problemas Middle no-calc
--   numoria-p2mc-2026 — División M (con calc) — 7 problemas Middle con-calc
-- ==========================================================

-- ============================================================
-- PRACTICE #2 — DIVISIÓN E (sin calculadora) — 7 problemas
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
-- P1 Aritmética ★ — vuelto (compra + cambio, palanca: 2 operaciones encadenadas)
(
  'numoria-p2e-p1-aritmetica-vuelto',
  'money', 1, 'elementary',
  'Aritmética', 'Arithmetic',
  'Mateo compra 3 cuadernos a 18 lempiras cada uno y paga con un billete de 100 lempiras. ¿Cuánto vuelto recibe, en lempiras?',
  'Mateo buys 3 notebooks at 18 lempiras each and pays with a 100 lempira bill. How much change does he get, in lempiras?',
  'Primero calculamos el costo total: $3 \times 18 = 54$ lempiras. Luego restamos del billete: $100 - 54 = 46$ lempiras de vuelto.',
  'First we calculate the total cost: $3 \times 18 = 54$ lempiras. Then we subtract from the bill: $100 - 54 = 46$ lempiras change.',
  'integer', '46',
  null, null,
  false, null, null,
  1, 'Numoria Challenge — Practice #2', 2026, true
),
-- P2 Tiempo ★ — suma de tiempos con conversión (palanca: respuesta no-numérica HH:MM)
(
  'numoria-p2e-p2-tiempo-reloj',
  'time_clocks', 1, 'elementary',
  'Tiempo', 'Time',
  'Un partido empieza a las 3:45 PM y dura 2 horas y 25 minutos. ¿A qué hora termina? Responde en formato de 24 horas (HH:MM, ej: 18:30).',
  'A game starts at 3:45 PM and lasts 2 hours and 25 minutes. What time does it end? Answer in 24-hour format (HH:MM, e.g. 18:30).',
  'Sumamos 2 horas: 3:45 PM + 2 h = 5:45 PM. Sumamos 25 minutos: 5:45 + 0:25 = 6:10 PM. En formato 24 horas: 18:10.',
  'Add 2 hours: 3:45 PM + 2 h = 5:45 PM. Add 25 minutes: 5:45 + 0:25 = 6:10 PM. In 24-hour format: 18:10.',
  'short_text', '18:10',
  'Formato HH:MM (24 horas).', 'Format HH:MM (24-hour).',
  false, null, null,
  1, 'Numoria Challenge — Practice #2', 2026, true
),
-- P3 Geometría plana ★★ — perímetro de rectángulo + cantidad de rollos (palanca: techo entero)
(
  'numoria-p2e-p3-geometria-perimetro',
  'plane_geometry', 2, 'elementary',
  'Geometría plana', 'Plane Geometry',
  'La huerta de Doña Carmen tiene forma rectangular de 15 m de largo y 8 m de ancho. Necesita cercarla con malla, que viene en rollos de 10 m. ¿Cuántos rollos completos debe comprar como mínimo?',
  'Doña Carmen''s garden is rectangular, 15 m long and 8 m wide. She needs to fence it using mesh sold in 10 m rolls. What is the minimum number of complete rolls she must buy?',
  'Perímetro del rectángulo: $2 \times (15 + 8) = 2 \times 23 = 46$ m. Cada rollo cubre 10 m: $46 \div 10 = 4.6$. Como no se pueden comprar fracciones de rollo, necesita 5 rollos para cubrir los 46 m.',
  'Rectangle perimeter: $2 \times (15 + 8) = 2 \times 23 = 46$ m. Each roll covers 10 m: $46 \div 10 = 4.6$. Since you can''t buy a fraction of a roll, she needs 5 rolls to cover 46 m.',
  'integer', '5',
  null, null,
  false, null, null,
  2, 'Numoria Challenge — Practice #2', 2026, true
),
-- P4 Fracciones ★★ — fracción de cantidad (palanca: doble proporción, distinta a suma del P1)
(
  'numoria-p2e-p4-fracciones-receta',
  'fractions_decimals', 2, 'elementary',
  'Fracciones', 'Fractions',
  'Una receta para 12 personas usa $\frac{3}{4}$ de taza de azúcar. Si quiero preparar la receta para solo 8 personas (manteniendo la proporción), ¿cuántas tazas de azúcar necesito? Expresa como fracción simplificada.',
  'A recipe for 12 people uses $\frac{3}{4}$ cup of sugar. If I want to prepare the recipe for only 8 people (keeping the proportion), how many cups of sugar do I need? Express as a simplified fraction.',
  'Para 8 de cada 12 personas, la proporción es $\frac{8}{12} = \frac{2}{3}$. Azúcar necesaria: $\frac{3}{4} \times \frac{2}{3} = \frac{6}{12} = \frac{1}{2}$ de taza.',
  'For 8 out of 12 people, the ratio is $\frac{8}{12} = \frac{2}{3}$. Sugar needed: $\frac{3}{4} \times \frac{2}{3} = \frac{6}{12} = \frac{1}{2}$ cup.',
  'fraction_simplified', '1/2',
  'Como fracción simplificada (ej: 3/8).', 'As simplified fraction (e.g. 3/8).',
  false, null, null,
  2, 'Numoria Challenge — Practice #2', 2026, true
),
-- P5 Razones ★★ — partes de mezcla (palanca: reparto proporcional, distinta a escala)
(
  'numoria-p2e-p5-razones-pintura',
  'ratios_proportions', 2, 'elementary',
  'Razones', 'Ratios',
  'Para hacer pintura verde se mezclan 2 partes de pintura amarilla con 3 partes de pintura azul. Si Juan quiere preparar 30 litros de pintura verde, ¿cuántos litros de pintura azul necesita?',
  'To make green paint, 2 parts of yellow paint are mixed with 3 parts of blue paint. If Juan wants to prepare 30 liters of green paint, how many liters of blue paint does he need?',
  'Total de partes: $2 + 3 = 5$. La pintura azul representa $\frac{3}{5}$ del total. Para 30 litros: $\frac{3}{5} \times 30 = 18$ litros de pintura azul.',
  'Total parts: $2 + 3 = 5$. Blue paint represents $\frac{3}{5}$ of the total. For 30 liters: $\frac{3}{5} \times 30 = 18$ liters of blue paint.',
  'integer', '18',
  null, null,
  false, null, null,
  2, 'Numoria Challenge — Practice #2', 2026, true
),
-- P6 Lógica ★★★ — sistema oculto resuelto por sustitución (palanca: planteo verbal)
(
  'numoria-p2e-p6-logica-dulces',
  'logic', 3, 'elementary',
  'Lógica', 'Logic',
  'Tres amigos tienen 24 dulces en total. Beto tiene el doble de dulces que Ana, y Carlos tiene 4 dulces más que Beto. ¿Cuántos dulces tiene Ana?',
  'Three friends have 24 candies in total. Beto has twice as many candies as Ana, and Carlos has 4 more candies than Beto. How many candies does Ana have?',
  'Sea $A$ los dulces de Ana. Entonces Beto = $2A$ y Carlos = $2A + 4$. Total: $A + 2A + (2A+4) = 24$, que da $5A + 4 = 24$, así $5A = 20$, entonces $A = 4$ dulces.',
  'Let $A$ be Ana''s candies. Then Beto = $2A$ and Carlos = $2A + 4$. Total: $A + 2A + (2A+4) = 24$, which gives $5A + 4 = 24$, so $5A = 20$, then $A = 4$ candies.',
  'integer', '4',
  null, null,
  false, null, null,
  3, 'Numoria Challenge — Practice #2', 2026, true
),
-- P7 Patrones ★★★ — números triangulares (palanca: fórmula cerrada, distinta a cuadrados)
(
  'numoria-p2e-p7-patrones-triangulares',
  'sequences_patterns', 3, 'elementary',
  'Patrones', 'Patterns',
  'La sucesión 1, 3, 6, 10, 15, 21, ... son los llamados números triangulares (cada término se obtiene sumándole un entero más al anterior). ¿Cuál es el décimo término de la sucesión?',
  'The sequence 1, 3, 6, 10, 15, 21, ... are called triangular numbers (each term is obtained by adding one more integer to the previous one). What is the tenth term of the sequence?',
  'Verificamos el patrón: $1, 1+2=3, 3+3=6, 6+4=10, 10+5=15, 15+6=21$. El siguiente sumando es uno mayor cada vez. Continuamos hasta el décimo: $21+7=28$ (7°), $28+8=36$ (8°), $36+9=45$ (9°), $45+10=55$ (10°). El n-ésimo número triangular es $\frac{n(n+1)}{2} = \frac{10 \times 11}{2} = 55$.',
  'Verify the pattern: $1, 1+2=3, 3+3=6, 6+4=10, 10+5=15, 15+6=21$. The added number grows by one each time. Continue to the tenth: $21+7=28$ (7th), $28+8=36$ (8th), $36+9=45$ (9th), $45+10=55$ (10th). The n-th triangular number is $\frac{n(n+1)}{2} = \frac{10 \times 11}{2} = 55$.',
  'integer', '55',
  null, null,
  false, null, null,
  3, 'Numoria Challenge — Practice #2', 2026, true
);

-- ============================================================
-- PRACTICE #2 — DIVISIÓN M (sin calculadora) — 7 problemas
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
-- M-P1 Álgebra ★ — sistema 2x2 con eliminación (palanca: planteo dos variables, distinta a edades)
(
  'numoria-p2m-p1-algebra-entradas',
  'algebra', 1, 'middle',
  'Álgebra', 'Algebra',
  'Para una función entran 100 personas en total. Las entradas para adultos cuestan 50 lempiras y para niños 20 lempiras. Si se recaudaron en total 3,200 lempiras, ¿cuántos niños entraron?',
  'For a show 100 people enter in total. Adult tickets cost 50 lempiras and child tickets cost 20 lempiras. If 3,200 lempiras were collected in total, how many children entered?',
  'Sea $n$ los niños y $a$ los adultos. Sistema: $n + a = 100$ y $20n + 50a = 3200$. De la primera: $a = 100 - n$. Sustituyendo: $20n + 50(100-n) = 3200$, que da $20n + 5000 - 50n = 3200$, entonces $-30n = -1800$, así $n = 60$.',
  'Let $c$ be the children and $a$ the adults. System: $c + a = 100$ and $20c + 50a = 3200$. From the first: $a = 100 - c$. Substituting: $20c + 50(100-c) = 3200$, gives $20c + 5000 - 50c = 3200$, so $-30c = -1800$, thus $c = 60$.',
  'integer', '60',
  null, null,
  false, null, null,
  1, 'Numoria Challenge — Practice #2', 2026, true
),
-- M-P2 Teoría de números ★ — MCM en contexto de bombillos (palanca: contexto físico)
(
  'numoria-p2m-p2-teoria-bombillos',
  'number_theory', 1, 'middle',
  'Teoría de números', 'Number Theory',
  'Tres bombillos parpadean a distintos ritmos: el primero cada 8 segundos, el segundo cada 12 segundos y el tercero cada 18 segundos. Si parpadean simultáneamente a las 12:00:00 PM, ¿después de cuántos segundos vuelven a parpadear los tres simultáneamente por primera vez?',
  'Three light bulbs blink at different rates: the first every 8 seconds, the second every 12 seconds and the third every 18 seconds. If they all blink simultaneously at 12:00:00 PM, after how many seconds do all three blink simultaneously again for the first time?',
  'Buscamos el MCM(8, 12, 18). Factorización: $8 = 2^3$, $12 = 2^2 \times 3$, $18 = 2 \times 3^2$. MCM = $2^3 \times 3^2 = 8 \times 9 = 72$ segundos.',
  'We want LCM(8, 12, 18). Factorization: $8 = 2^3$, $12 = 2^2 \times 3$, $18 = 2 \times 3^2$. LCM = $2^3 \times 3^2 = 8 \times 9 = 72$ seconds.',
  'integer', '72',
  null, null,
  false, null, null,
  1, 'Numoria Challenge — Practice #2', 2026, true
),
-- M-P3 Geometría plana ★★ — diagonal de rectángulo con triple pitagórico 9-12-15 (distinto al 5-12-13)
(
  'numoria-p2m-p3-geometria-diagonal',
  'pythagoras', 2, 'middle',
  'Geometría plana', 'Plane Geometry',
  'Un terreno rectangular mide 9 m de ancho por 12 m de largo. ¿Cuánto mide su diagonal, en metros?',
  'A rectangular plot measures 9 m wide by 12 m long. How long is its diagonal, in meters?',
  'La diagonal del rectángulo forma un triángulo rectángulo con los lados. Por Pitágoras: $d^2 = 9^2 + 12^2 = 81 + 144 = 225$, así $d = \sqrt{225} = 15$ m. (Es el triple pitagórico 9-12-15, que es $3 \times (3,4,5)$.)',
  'The diagonal of the rectangle forms a right triangle with the sides. By Pythagoras: $d^2 = 9^2 + 12^2 = 81 + 144 = 225$, so $d = \sqrt{225} = 15$ m. (It''s the 9-12-15 Pythagorean triple, $3 \times (3,4,5)$.)',
  'integer', '15',
  'Solo el número (en metros).', 'Just the number (in meters).',
  false, null, null,
  2, 'Numoria Challenge — Practice #2', 2026, true
),
-- M-P4 Probabilidad ★★ — suma de dos dados (palanca: enumeración, distinta a sin-reposición)
(
  'numoria-p2m-p4-probabilidad-dados',
  'probability', 2, 'middle',
  'Probabilidad', 'Probability',
  'Se lanzan dos dados estándar de 6 caras (numerados del 1 al 6). ¿Cuál es la probabilidad de que la suma de los dos dados sea exactamente 7? Expresa como fracción simplificada.',
  'Two standard 6-sided dice (numbered 1 to 6) are rolled. What is the probability that the sum of the two dice is exactly 7? Express as simplified fraction.',
  'Casos totales: $6 \times 6 = 36$. Casos favorables (suma 7): $(1,6), (2,5), (3,4), (4,3), (5,2), (6,1)$ = 6 casos. Probabilidad: $\frac{6}{36} = \frac{1}{6}$.',
  'Total cases: $6 \times 6 = 36$. Favorable cases (sum 7): $(1,6), (2,5), (3,4), (4,3), (5,2), (6,1)$ = 6 cases. Probability: $\frac{6}{36} = \frac{1}{6}$.',
  'fraction_simplified', '1/6',
  'Como fracción simplificada (ej: 1/4).', 'As simplified fraction (e.g. 1/4).',
  false, null, null,
  2, 'Numoria Challenge — Practice #2', 2026, true
),
-- M-P5 Conteo ★★ — combinaciones (palanca: elección sin orden, distinta a caminos)
(
  'numoria-p2m-p5-conteo-comites',
  'counting_combinatorics', 2, 'middle',
  'Conteo', 'Counting',
  'Un grupo de 7 amigos quiere formar un comité de 3 personas (sin orden de cargos). ¿De cuántas maneras distintas se puede formar el comité?',
  'A group of 7 friends wants to form a committee of 3 people (without role order). In how many different ways can the committee be formed?',
  'Como no importa el orden, usamos combinaciones: $\binom{7}{3} = \frac{7!}{3! \cdot 4!} = \frac{7 \times 6 \times 5}{3 \times 2 \times 1} = \frac{210}{6} = 35$.',
  'Since order doesn''t matter, we use combinations: $\binom{7}{3} = \frac{7!}{3! \cdot 4!} = \frac{7 \times 6 \times 5}{3 \times 2 \times 1} = \frac{210}{6} = 35$.',
  'integer', '35',
  null, null,
  false, null, null,
  2, 'Numoria Challenge — Practice #2', 2026, true
),
-- M-P6 Geometría 3D ★★★ — área superficial prisma rectangular (distinta a cubos pintados)
(
  'numoria-p2m-p6-geometria-area-prisma',
  'geometry_3d', 3, 'middle',
  'Geometría 3D', '3D Geometry',
  'Una caja con forma de prisma rectangular tiene dimensiones $4 \text{ cm} \times 5 \text{ cm} \times 6 \text{ cm}$. ¿Cuál es el área total de su superficie, en cm²?',
  'A box shaped as a rectangular prism has dimensions $4 \text{ cm} \times 5 \text{ cm} \times 6 \text{ cm}$. What is the total surface area, in cm²?',
  'El área de un prisma rectangular es $A = 2(ab + ac + bc)$. Sustituyendo: $A = 2(4 \times 5 + 4 \times 6 + 5 \times 6) = 2(20 + 24 + 30) = 2 \times 74 = 148$ cm².',
  'The surface area of a rectangular prism is $A = 2(ab + ac + bc)$. Substituting: $A = 2(4 \times 5 + 4 \times 6 + 5 \times 6) = 2(20 + 24 + 30) = 2 \times 74 = 148$ cm².',
  'integer', '148',
  'Solo el número (en cm²).', 'Just the number (in cm²).',
  false, null, null,
  3, 'Numoria Challenge — Practice #2', 2026, true
),
-- M-P7 Sucesiones ★★★ — aritmética término general (distinta a Fibonacci)
(
  'numoria-p2m-p7-sucesiones-aritmetica',
  'sequences_patterns', 3, 'middle',
  'Sucesiones', 'Sequences',
  'En una sucesión aritmética, el tercer término es 11 y el séptimo término es 27. ¿Cuál es el décimo término?',
  'In an arithmetic sequence, the third term is 11 and the seventh term is 27. What is the tenth term?',
  'Sea $a_1$ el primer término y $d$ la diferencia común. Entonces $a_n = a_1 + (n-1)d$. La diferencia entre $a_7$ y $a_3$ es $27 - 11 = 16$, que cubre 4 saltos: $4d = 16$, así $d = 4$. Despejamos $a_1$: $a_3 = a_1 + 2d \Rightarrow 11 = a_1 + 8 \Rightarrow a_1 = 3$. Por tanto $a_{10} = 3 + 9 \times 4 = 39$.',
  'Let $a_1$ be the first term and $d$ the common difference. Then $a_n = a_1 + (n-1)d$. The difference between $a_7$ and $a_3$ is $27 - 11 = 16$, covering 4 steps: $4d = 16$, so $d = 4$. Solve for $a_1$: $a_3 = a_1 + 2d \Rightarrow 11 = a_1 + 8 \Rightarrow a_1 = 3$. Therefore $a_{10} = 3 + 9 \times 4 = 39$.',
  'integer', '39',
  null, null,
  false, null, null,
  3, 'Numoria Challenge — Practice #2', 2026, true
);

-- ============================================================
-- PRACTICE #2 — DIVISIÓN M (con calculadora) — 7 problemas
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
-- MC-P1 Porcentajes ★ — descuento sucesivo (distinto a aumento+descuento del P1MC)
(
  'numoria-p2mc-p1-porcentajes-descuento',
  'percentages', 1, 'middle',
  'Porcentajes', 'Percentages',
  'Una tienda ofrece 25% de descuento en una camisa y, además, 10% adicional sobre el nuevo precio por pagar en efectivo. Si la camisa originalmente cuesta 800 lempiras, ¿cuánto se paga al final, en lempiras?',
  'A store offers a 25% discount on a shirt and, additionally, a 10% extra on the new price for paying in cash. If the shirt originally costs 800 lempiras, what is the final price, in lempiras?',
  'Primer descuento (25%): $800 \times 0.75 = 600$ lempiras. Segundo descuento (10% sobre 600): $600 \times 0.90 = 540$ lempiras. Nota: los descuentos sucesivos NO se suman como 35%.',
  'First discount (25%): $800 \times 0.75 = 600$ lempiras. Second discount (10% on 600): $600 \times 0.90 = 540$ lempiras. Note: successive discounts are NOT added as 35%.',
  'integer', '540',
  null, null,
  false, null, null,
  1, 'Numoria Challenge — Practice #2', 2026, true
),
-- MC-P2 Tasas — trabajo conjunto (distinta a encuentro de trenes)
(
  'numoria-p2mc-p2-tasa-pintura',
  'rate_time_distance', 2, 'middle',
  'Trabajo conjunto', 'Joint Work',
  'Pedro puede pintar una habitación en 6 horas trabajando solo, y María puede pintar la misma habitación en 4 horas trabajando sola. ¿En cuántas horas pintan la habitación trabajando juntos al mismo ritmo? Expresa la respuesta como fracción simplificada.',
  'Pedro can paint a room in 6 hours working alone, and María can paint the same room in 4 hours working alone. In how many hours do they paint the room working together at the same rate? Express the answer as a simplified fraction.',
  'Tasa de Pedro: $\frac{1}{6}$ habitación/hora. Tasa de María: $\frac{1}{4}$ habitación/hora. Tasa combinada: $\frac{1}{6} + \frac{1}{4} = \frac{2}{12} + \frac{3}{12} = \frac{5}{12}$ habitación/hora. Tiempo para 1 habitación: $\frac{1}{5/12} = \frac{12}{5}$ horas.',
  'Pedro''s rate: $\frac{1}{6}$ room/hour. María''s rate: $\frac{1}{4}$ room/hour. Combined rate: $\frac{1}{6} + \frac{1}{4} = \frac{2}{12} + \frac{3}{12} = \frac{5}{12}$ room/hour. Time for 1 room: $\frac{1}{5/12} = \frac{12}{5}$ hours.',
  'fraction_simplified', '12/5',
  'Como fracción simplificada (ej: 12/5).', 'As simplified fraction (e.g. 12/5).',
  false, null, null,
  2, 'Numoria Challenge — Practice #2', 2026, true
),
-- MC-P3 Probabilidad ★★ — inclusión-exclusión Venn (distinto a árbol)
(
  'numoria-p2mc-p3-probabilidad-venn',
  'probability', 2, 'middle',
  'Probabilidad', 'Probability',
  'En un colegio, de 100 estudiantes: 60 estudian inglés, 45 estudian francés, y 20 estudian ambos idiomas. Si se elige un estudiante al azar, ¿cuál es la probabilidad de que NO estudie ninguno de los dos idiomas? Expresa como fracción simplificada.',
  'In a school, out of 100 students: 60 study English, 45 study French, and 20 study both languages. If a student is picked at random, what is the probability that they study NEITHER language? Express as simplified fraction.',
  'Por inclusión-exclusión, estudiantes que estudian al menos uno: $|E \cup F| = 60 + 45 - 20 = 85$. Estudiantes que no estudian ninguno: $100 - 85 = 15$. Probabilidad: $\frac{15}{100} = \frac{3}{20}$.',
  'By inclusion-exclusion, students who study at least one: $|E \cup F| = 60 + 45 - 20 = 85$. Students who study neither: $100 - 85 = 15$. Probability: $\frac{15}{100} = \frac{3}{20}$.',
  'fraction_simplified', '3/20',
  'Como fracción simplificada.', 'As simplified fraction.',
  false, null, null,
  2, 'Numoria Challenge — Practice #2', 2026, true
),
-- MC-P4 Geometría 3D ★★ — volumen del cono (distinto a cilindro)
(
  'numoria-p2mc-p4-geometria-cono',
  'geometry_3d', 2, 'middle',
  'Geometría 3D', '3D Geometry',
  'Un cono recto tiene radio de base de 6 cm y altura de 9 cm. ¿Cuál es su volumen? Expresa la respuesta usando $\pi$ (ej: $108\pi$).',
  'A right cone has a base radius of 6 cm and a height of 9 cm. What is its volume? Express the answer using $\pi$ (e.g.: $108\pi$).',
  'Volumen del cono: $V = \frac{1}{3} \pi r^2 h$. Sustituyendo: $V = \frac{1}{3} \pi \times 6^2 \times 9 = \frac{1}{3} \pi \times 36 \times 9 = \frac{324\pi}{3} = 108\pi$ cm³.',
  'Cone volume: $V = \frac{1}{3} \pi r^2 h$. Substituting: $V = \frac{1}{3} \pi \times 6^2 \times 9 = \frac{1}{3} \pi \times 36 \times 9 = \frac{324\pi}{3} = 108\pi$ cm³.',
  'symbolic_pi', '108π',
  'Usa π (ej: 108π).', 'Use π (e.g. 108π).',
  false, null, null,
  2, 'Numoria Challenge — Practice #2', 2026, true
),
-- MC-P5 Estadística ★★★ — mediana de datos sin ordenar (distinta a promedio)
(
  'numoria-p2mc-p5-estadistica-mediana',
  'statistics', 3, 'middle',
  'Estadística', 'Statistics',
  'En una fiesta hay 7 niños cuyas edades son: 6, 8, 5, 12, 9, 7, 10 años. ¿Cuál es la mediana de las edades?',
  'At a party there are 7 children whose ages are: 6, 8, 5, 12, 9, 7, 10 years. What is the median of their ages?',
  'Ordenamos las edades de menor a mayor: $5, 6, 7, 8, 9, 10, 12$. Como hay 7 valores (impar), la mediana es el valor central, que es el 4° valor: $8$.',
  'Sort ages from least to greatest: $5, 6, 7, 8, 9, 10, 12$. Since there are 7 values (odd), the median is the central value, which is the 4th value: $8$.',
  'integer', '8',
  null, null,
  false, null, null,
  3, 'Numoria Challenge — Practice #2', 2026, true
),
-- MC-P6 Mezclas ★★★ — promedio ponderado de precios (distinto a alcohol-agua)
(
  'numoria-p2mc-p6-mezclas-cafe',
  'mixtures', 3, 'middle',
  'Mezclas', 'Mixtures',
  'Un comerciante mezcla 8 kg de café que cuesta 60 lempiras/kg con 12 kg de café que cuesta 110 lempiras/kg. ¿A qué precio por kg debe vender la mezcla para mantener el mismo costo unitario promedio?',
  'A trader mixes 8 kg of coffee costing 60 lempiras/kg with 12 kg of coffee costing 110 lempiras/kg. At what price per kg should the mixture be sold to keep the same average unit cost?',
  'Costo total: $8 \times 60 + 12 \times 110 = 480 + 1320 = 1800$ lempiras. Total de kilos: $8 + 12 = 20$ kg. Precio promedio por kg: $\frac{1800}{20} = 90$ lempiras/kg.',
  'Total cost: $8 \times 60 + 12 \times 110 = 480 + 1320 = 1800$ lempiras. Total kilos: $8 + 12 = 20$ kg. Average price per kg: $\frac{1800}{20} = 90$ lempiras/kg.',
  'integer', '90',
  'Solo el número (lempiras/kg).', 'Just the number (lempiras/kg).',
  false, null, null,
  3, 'Numoria Challenge — Practice #2', 2026, true
),
-- MC-P7 Sistemas ★★★ — billetes (distinto a lápices y cuadernos)
(
  'numoria-p2mc-p7-sistemas-billetes',
  'algebra', 3, 'middle',
  'Sistemas de ecuaciones', 'Systems of Equations',
  'En la caja de un negocio hay 25 billetes en total, algunos de 100 lempiras y otros de 500 lempiras. El total en la caja es de 5,300 lempiras. ¿Cuántos billetes de 500 lempiras hay?',
  'A business cash register has 25 bills in total, some of 100 lempiras and others of 500 lempiras. The total amount is 5,300 lempiras. How many 500-lempira bills are there?',
  'Sea $x$ la cantidad de billetes de 100 y $y$ la cantidad de billetes de 500. Sistema: $x + y = 25$ y $100x + 500y = 5300$. De la primera: $x = 25 - y$. Sustituyendo: $100(25-y) + 500y = 5300 \Rightarrow 2500 + 400y = 5300 \Rightarrow 400y = 2800 \Rightarrow y = 7$.',
  'Let $x$ be the number of 100-bills and $y$ the number of 500-bills. System: $x + y = 25$ and $100x + 500y = 5300$. From the first: $x = 25 - y$. Substituting: $100(25-y) + 500y = 5300 \Rightarrow 2500 + 400y = 5300 \Rightarrow 400y = 2800 \Rightarrow y = 7$.',
  'integer', '7',
  null, null,
  false, null, null,
  3, 'Numoria Challenge — Practice #2', 2026, true
);

-- ============================================================
-- contest_problems — asociar 7 problemas a cada uno de los 3 contests
-- ============================================================

-- Practice #2 D-E
insert into public.contest_problems (contest_id, problem_id, position)
select c.id, p.id, pos.position
from public.contests c
cross join (values
  (1, 'numoria-p2e-p1-aritmetica-vuelto'),
  (2, 'numoria-p2e-p2-tiempo-reloj'),
  (3, 'numoria-p2e-p3-geometria-perimetro'),
  (4, 'numoria-p2e-p4-fracciones-receta'),
  (5, 'numoria-p2e-p5-razones-pintura'),
  (6, 'numoria-p2e-p6-logica-dulces'),
  (7, 'numoria-p2e-p7-patrones-triangulares')
) as pos(position, slug)
join public.problems p on p.slug = pos.slug
where c.slug = 'numoria-p2e-2026';

-- Practice #2 D-M sin calc
insert into public.contest_problems (contest_id, problem_id, position)
select c.id, p.id, pos.position
from public.contests c
cross join (values
  (1, 'numoria-p2m-p1-algebra-entradas'),
  (2, 'numoria-p2m-p2-teoria-bombillos'),
  (3, 'numoria-p2m-p3-geometria-diagonal'),
  (4, 'numoria-p2m-p4-probabilidad-dados'),
  (5, 'numoria-p2m-p5-conteo-comites'),
  (6, 'numoria-p2m-p6-geometria-area-prisma'),
  (7, 'numoria-p2m-p7-sucesiones-aritmetica')
) as pos(position, slug)
join public.problems p on p.slug = pos.slug
where c.slug = 'numoria-p2m-2026';

-- Practice #2 D-M con calc
insert into public.contest_problems (contest_id, problem_id, position)
select c.id, p.id, pos.position
from public.contests c
cross join (values
  (1, 'numoria-p2mc-p1-porcentajes-descuento'),
  (2, 'numoria-p2mc-p2-tasa-pintura'),
  (3, 'numoria-p2mc-p3-probabilidad-venn'),
  (4, 'numoria-p2mc-p4-geometria-cono'),
  (5, 'numoria-p2mc-p5-estadistica-mediana'),
  (6, 'numoria-p2mc-p6-mezclas-cafe'),
  (7, 'numoria-p2mc-p7-sistemas-billetes')
) as pos(position, slug)
join public.problems p on p.slug = pos.slug
where c.slug = 'numoria-p2mc-2026';

-- ============================================================
-- Activar los 3 contests de Practice #2 (cambiar status draft → active)
-- ============================================================
update public.contests
set status = 'active'
where slug in ('numoria-p2e-2026', 'numoria-p2m-2026', 'numoria-p2mc-2026');
