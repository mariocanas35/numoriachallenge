-- ==========================================================
-- Numoria Challenge — Migration 0029: Seed Practice #3 — 21 problemas
--
-- Phase 4.5c — populate las 3 versiones de Practice #3 con 7 problemas c/u.
--
-- REGLA DE UNICIDAD: ningún problema, contexto o palanca de Practice #1
-- ni Practice #2 se reutiliza aquí. Verificado contra los 42 slugs ya
-- existentes (P#1 + P#2 = 42).
--
-- 3 contests target:
--   numoria-p3e-2026  — División E (sin calc) — 7 problemas Elementary
--   numoria-p3m-2026  — División M (sin calc) — 7 problemas Middle no-calc
--   numoria-p3mc-2026 — División M (con calc) — 7 problemas Middle con-calc
-- ==========================================================

-- ============================================================
-- PRACTICE #3 — DIVISIÓN E (sin calculadora) — 7 problemas
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
-- P1 Aritmética ★ — división con resto (palanca: cociente vs resto, distinta a multiplicación o vuelto)
(
  'numoria-p3e-p1-aritmetica-paquetes',
  'number_theory', 1, 'elementary',
  'Aritmética', 'Arithmetic',
  'Don Pedro tiene 100 dulces y quiere repartirlos en bolsas de 8 dulces cada una. ¿Cuántos dulces le sobran después de armar todas las bolsas completas que pueda?',
  'Don Pedro has 100 candies and wants to put them in bags of 8 candies each. How many candies are left over after he makes all the complete bags he can?',
  'Dividimos 100 entre 8: $100 = 8 \times 12 + 4$. Es decir, arma 12 bolsas completas y le sobran $100 - 96 = 4$ dulces.',
  'Divide 100 by 8: $100 = 8 \times 12 + 4$. That is, he makes 12 complete bags and $100 - 96 = 4$ candies are left over.',
  'integer', '4',
  null, null,
  false, null, null,
  1, 'Numoria Challenge — Practice #3', 2026, true
),
-- P2 Tiempo ★ — zona horaria (palanca: suma con cambio de formato, distinta a horas/días)
(
  'numoria-p3e-p2-tiempo-zona-horaria',
  'time_clocks', 1, 'elementary',
  'Tiempo', 'Time',
  'Madrid está 7 horas adelante de Tegucigalpa. Si Ana llamó a su tío en Madrid cuando en Tegucigalpa eran las 8:00 AM, ¿qué hora era en Madrid en ese momento? Responde en formato 24 horas (HH:MM, ej: 15:00).',
  'Madrid is 7 hours ahead of Tegucigalpa. If Ana called her uncle in Madrid when it was 8:00 AM in Tegucigalpa, what time was it in Madrid? Answer in 24-hour format (HH:MM, e.g. 15:00).',
  'Sumamos 7 horas a 8:00 AM: $8 + 7 = 15$, lo que da las 3:00 PM. En formato 24 horas: $15{:}00$.',
  'Add 7 hours to 8:00 AM: $8 + 7 = 15$, which gives 3:00 PM. In 24-hour format: $15{:}00$.',
  'short_text', '15:00',
  'Formato HH:MM (24 horas).', 'Format HH:MM (24-hour).',
  false, null, null,
  1, 'Numoria Challenge — Practice #3', 2026, true
),
-- P3 Geometría plana ★★ — área a partir de perímetro (palanca: dos pasos inversos)
(
  'numoria-p3e-p3-geometria-cuadrado-area',
  'plane_geometry', 2, 'elementary',
  'Geometría plana', 'Plane Geometry',
  'Un cuadrado tiene un perímetro de 32 cm. ¿Cuál es su área, en cm²?',
  'A square has a perimeter of 32 cm. What is its area, in cm²?',
  'Un cuadrado tiene 4 lados iguales, así que el lado mide $32 \div 4 = 8$ cm. Su área es $8 \times 8 = 64$ cm².',
  'A square has 4 equal sides, so each side is $32 \div 4 = 8$ cm. Its area is $8 \times 8 = 64$ cm².',
  'integer', '64',
  'Solo el número (en cm²).', 'Just the number (in cm²).',
  false, null, null,
  2, 'Numoria Challenge — Practice #3', 2026, true
),
-- P4 Fracciones ★★ — fracción de fracción (palanca: composición multiplicativa)
(
  'numoria-p3e-p4-fracciones-fraccion-de-fraccion',
  'fractions_decimals', 2, 'elementary',
  'Fracciones', 'Fractions',
  'Carlos comió la mitad de un tercio de una barra de chocolate. ¿Qué fracción de la barra comió? Expresa como fracción simplificada.',
  'Carlos ate half of one third of a chocolate bar. What fraction of the bar did he eat? Express as a simplified fraction.',
  '"La mitad de un tercio" significa $\frac{1}{2} \times \frac{1}{3} = \frac{1}{6}$ de la barra.',
  '"Half of one third" means $\frac{1}{2} \times \frac{1}{3} = \frac{1}{6}$ of the bar.',
  'fraction_simplified', '1/6',
  'Como fracción simplificada.', 'As simplified fraction.',
  false, null, null,
  2, 'Numoria Challenge — Practice #3', 2026, true
),
-- P5 Razones ★★ — razón de tres términos (palanca: 3 partes, distinta a 2:3)
(
  'numoria-p3e-p5-razones-tres-terminos',
  'ratios_proportions', 2, 'elementary',
  'Razones', 'Ratios',
  'En una caja con bolas de colores hay bolas rojas, azules y verdes en razón $2 : 3 : 5$. Si hay 60 bolas en total, ¿cuántas bolas azules hay?',
  'In a box with colored balls, there are red, blue and green balls in ratio $2 : 3 : 5$. If there are 60 balls in total, how many blue balls are there?',
  'Total de partes: $2 + 3 + 5 = 10$. Las bolas azules representan $\frac{3}{10}$ del total: $\frac{3}{10} \times 60 = 18$ bolas azules.',
  'Total parts: $2 + 3 + 5 = 10$. Blue balls represent $\frac{3}{10}$ of the total: $\frac{3}{10} \times 60 = 18$ blue balls.',
  'integer', '18',
  null, null,
  false, null, null,
  2, 'Numoria Challenge — Practice #3', 2026, true
),
-- P6 Lógica ★★★ — deducción de orden (palanca: relaciones de posición)
(
  'numoria-p3e-p6-logica-orden',
  'logic', 3, 'elementary',
  'Lógica', 'Logic',
  'Cuatro niños se forman en una fila: Ana, Beto, Carlos y Diana. Sabemos que: (1) Ana está justo delante de Beto. (2) Diana está al final de la fila. (3) Carlos está delante de Diana pero detrás de Beto. Si numeramos las posiciones de 1 (al frente) a 4 (al final), ¿en qué posición está Ana?',
  'Four children line up: Ana, Beto, Carlos and Diana. We know: (1) Ana is right in front of Beto. (2) Diana is at the end of the line. (3) Carlos is in front of Diana but behind Beto. If we number positions from 1 (front) to 4 (back), what position is Ana in?',
  'De (2): Diana está en posición 4. De (3): Carlos está en 3. De (1): Ana está justo delante de Beto, así que Ana-Beto son consecutivos y ocupan las posiciones 1 y 2. Por tanto Ana está en posición 1 y Beto en posición 2. Orden final: Ana, Beto, Carlos, Diana.',
  'From (2): Diana is in position 4. From (3): Carlos is in 3. From (1): Ana is right in front of Beto, so Ana-Beto are consecutive and take positions 1 and 2. Thus Ana is in position 1 and Beto in position 2. Final order: Ana, Beto, Carlos, Diana.',
  'integer', '1',
  null, null,
  false, null, null,
  3, 'Numoria Challenge — Practice #3', 2026, true
),
-- P7 Patrones ★★★ — potencias de 2 (palanca: progresión geométrica reconocida)
(
  'numoria-p3e-p7-patrones-potencias',
  'sequences_patterns', 3, 'elementary',
  'Patrones', 'Patterns',
  'Observa la sucesión: $1, 2, 4, 8, 16, 32, \ldots$ Cada número (después del primero) es el doble del anterior. ¿Cuál es el décimo término de la sucesión?',
  'Observe the sequence: $1, 2, 4, 8, 16, 32, \ldots$ Each number (after the first) is double the previous one. What is the tenth term of the sequence?',
  'Los términos son potencias de 2: el primero es $1 = 2^0$, el segundo $2 = 2^1$, el tercero $4 = 2^2$, etc. El término $n$-ésimo es $2^{n-1}$. Para $n=10$: $2^9 = 512$.',
  'The terms are powers of 2: first is $1 = 2^0$, second $2 = 2^1$, third $4 = 2^2$, etc. The $n$-th term is $2^{n-1}$. For $n=10$: $2^9 = 512$.',
  'integer', '512',
  null, null,
  false, null, null,
  3, 'Numoria Challenge — Practice #3', 2026, true
);

-- ============================================================
-- PRACTICE #3 — DIVISIÓN M (sin calculadora) — 7 problemas
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
-- M-P1 Álgebra ★ — distributiva y simplificación (palanca: doble paréntesis con signo negativo)
(
  'numoria-p3m-p1-algebra-distributiva',
  'algebra', 1, 'middle',
  'Álgebra', 'Algebra',
  'Resuelve para $x$ la siguiente ecuación: $3(x + 4) - 2(x - 1) = 17$. ¿Cuál es el valor de $x$?',
  'Solve for $x$ in the following equation: $3(x + 4) - 2(x - 1) = 17$. What is the value of $x$?',
  'Aplicamos distributiva: $3x + 12 - 2x + 2 = 17$. Combinamos términos semejantes: $x + 14 = 17$. Despejamos: $x = 3$.',
  'Apply distributive: $3x + 12 - 2x + 2 = 17$. Combine like terms: $x + 14 = 17$. Solve: $x = 3$.',
  'integer', '3',
  null, null,
  false, null, null,
  1, 'Numoria Challenge — Practice #3', 2026, true
),
-- M-P2 Teoría números ★ — último dígito (palanca: ciclicidad mod 4)
(
  'numoria-p3m-p2-teoria-ultimo-digito',
  'number_theory', 1, 'middle',
  'Teoría de números', 'Number Theory',
  '¿Cuál es el último dígito (la cifra de las unidades) del número $7^{2026}$?',
  'What is the last digit (units digit) of the number $7^{2026}$?',
  'Los últimos dígitos de las potencias de 7 forman un ciclo de longitud 4: $7^1 \to 7$, $7^2 \to 9$, $7^3 \to 3$, $7^4 \to 1$, $7^5 \to 7$, ... Calculamos $2026 \bmod 4 = 2$ (porque $2024$ es múltiplo de 4). Entonces $7^{2026}$ termina igual que $7^2$, que es $9$.',
  'The last digits of powers of 7 form a cycle of length 4: $7^1 \to 7$, $7^2 \to 9$, $7^3 \to 3$, $7^4 \to 1$, $7^5 \to 7$, ... Compute $2026 \bmod 4 = 2$ (since $2024$ is a multiple of 4). So $7^{2026}$ ends like $7^2$, which is $9$.',
  'integer', '9',
  null, null,
  false, null, null,
  1, 'Numoria Challenge — Practice #3', 2026, true
),
-- M-P3 Geometría plana ★★ — suma de ángulos interiores polígono
(
  'numoria-p3m-p3-geometria-angulos-octagono',
  'plane_geometry', 2, 'middle',
  'Geometría plana', 'Plane Geometry',
  '¿Cuál es la suma de los ángulos interiores de un octágono (polígono de 8 lados), en grados?',
  'What is the sum of the interior angles of an octagon (8-sided polygon), in degrees?',
  'La suma de los ángulos interiores de un polígono de $n$ lados es $(n-2) \times 180°$. Para $n = 8$: $(8-2) \times 180° = 6 \times 180° = 1080°$.',
  'The sum of interior angles of an $n$-sided polygon is $(n-2) \times 180°$. For $n = 8$: $(8-2) \times 180° = 6 \times 180° = 1080°$.',
  'integer', '1080',
  'Solo el número (en grados).', 'Just the number (in degrees).',
  false, null, null,
  2, 'Numoria Challenge — Practice #3', 2026, true
),
-- M-P4 Probabilidad ★★ — condicional (palanca: actualización del espacio muestral, distinta a sin-reposición secuencial)
(
  'numoria-p3m-p4-probabilidad-condicional',
  'probability', 2, 'middle',
  'Probabilidad', 'Probability',
  'En una bolsa hay 5 canicas: 3 rojas y 2 azules. Se saca una canica al azar y resulta ser roja, y se mantiene fuera de la bolsa. ¿Cuál es la probabilidad de que la siguiente canica que se saque también sea roja? Expresa como fracción simplificada.',
  'A bag has 5 marbles: 3 red and 2 blue. One marble is drawn at random and it turns out to be red, and it is kept out. What is the probability that the next marble drawn is also red? Express as simplified fraction.',
  'Después de sacar una roja, en la bolsa quedan $2$ rojas y $2$ azules, total $4$ canicas. La probabilidad de que la siguiente sea roja es $\frac{2}{4} = \frac{1}{2}$.',
  'After drawing one red, the bag has $2$ red and $2$ blue left, total $4$ marbles. The probability the next is red is $\frac{2}{4} = \frac{1}{2}$.',
  'fraction_simplified', '1/2',
  'Como fracción simplificada.', 'As simplified fraction.',
  false, null, null,
  2, 'Numoria Challenge — Practice #3', 2026, true
),
-- M-P5 Conteo ★★ — permutaciones de letras (palanca: orden importa, todas distintas)
(
  'numoria-p3m-p5-conteo-permutaciones',
  'counting_combinatorics', 2, 'middle',
  'Conteo', 'Counting',
  '¿Cuántas "palabras" distintas (con o sin sentido) se pueden formar reordenando las letras de la palabra NUMA?',
  'How many distinct "words" (meaningful or not) can be formed by rearranging the letters of the word NUMA?',
  'NUMA tiene 4 letras todas distintas (N, U, M, A). El número de permutaciones es $4! = 4 \times 3 \times 2 \times 1 = 24$.',
  'NUMA has 4 letters, all distinct (N, U, M, A). The number of permutations is $4! = 4 \times 3 \times 2 \times 1 = 24$.',
  'integer', '24',
  null, null,
  false, null, null,
  2, 'Numoria Challenge — Practice #3', 2026, true
),
-- M-P6 Geometría 3D ★★★ — volumen prisma triangular (palanca: área base no rectangular)
(
  'numoria-p3m-p6-geometria-prisma-triangular',
  'geometry_3d', 3, 'middle',
  'Geometría 3D', '3D Geometry',
  'Un prisma triangular recto tiene como base un triángulo rectángulo con catetos de 3 cm y 4 cm. La altura del prisma (perpendicular a la base) es de 10 cm. ¿Cuál es el volumen del prisma, en cm³?',
  'A right triangular prism has as base a right triangle with legs of 3 cm and 4 cm. The height of the prism (perpendicular to the base) is 10 cm. What is the volume of the prism, in cm³?',
  'Área de la base (triángulo rectángulo): $\frac{3 \times 4}{2} = 6$ cm². Volumen del prisma = área base × altura: $6 \times 10 = 60$ cm³.',
  'Base area (right triangle): $\frac{3 \times 4}{2} = 6$ cm². Prism volume = base area × height: $6 \times 10 = 60$ cm³.',
  'integer', '60',
  'Solo el número (en cm³).', 'Just the number (in cm³).',
  false, null, null,
  3, 'Numoria Challenge — Practice #3', 2026, true
),
-- M-P7 Sucesiones ★★★ — geométrica con razón 2 (palanca: progresión geométrica formal)
(
  'numoria-p3m-p7-sucesiones-geometrica',
  'sequences_patterns', 3, 'middle',
  'Sucesiones', 'Sequences',
  'En una sucesión geométrica, el primer término es 3 y la razón es 2 (cada término es el doble del anterior). ¿Cuál es el séptimo término de la sucesión?',
  'In a geometric sequence, the first term is 3 and the common ratio is 2 (each term is twice the previous one). What is the seventh term of the sequence?',
  'El $n$-ésimo término de una sucesión geométrica es $a_n = a_1 \cdot r^{n-1}$. Aquí $a_1 = 3$, $r = 2$, $n = 7$: $a_7 = 3 \cdot 2^6 = 3 \cdot 64 = 192$.',
  'The $n$-th term of a geometric sequence is $a_n = a_1 \cdot r^{n-1}$. Here $a_1 = 3$, $r = 2$, $n = 7$: $a_7 = 3 \cdot 2^6 = 3 \cdot 64 = 192$.',
  'integer', '192',
  null, null,
  false, null, null,
  3, 'Numoria Challenge — Practice #3', 2026, true
);

-- ============================================================
-- PRACTICE #3 — DIVISIÓN M (con calculadora) — 7 problemas
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
-- MC-P1 Porcentajes ★ — precio antes del impuesto (palanca: inversión de aumento)
(
  'numoria-p3mc-p1-porcentajes-precio-original',
  'percentages', 1, 'middle',
  'Porcentajes', 'Percentages',
  'El precio final de un producto, con 15% de impuesto incluido, es de 920 lempiras. ¿Cuál era el precio del producto antes del impuesto, en lempiras?',
  'The final price of a product, with 15% tax included, is 920 lempiras. What was the price of the product before tax, in lempiras?',
  'Sea $P$ el precio antes de impuesto. Con el 15% de impuesto: $P \times 1.15 = 920$. Entonces $P = \frac{920}{1.15} = 800$ lempiras.',
  'Let $P$ be the price before tax. With the 15% tax: $P \times 1.15 = 920$. Then $P = \frac{920}{1.15} = 800$ lempiras.',
  'integer', '800',
  null, null,
  false, null, null,
  1, 'Numoria Challenge — Practice #3', 2026, true
),
-- MC-P2 Tasas ★★ — caudales con flujo opuesto (palanca: resta de tasas, distinta a trabajo conjunto suma)
(
  'numoria-p3mc-p2-tasa-caudales',
  'rate_time_distance', 2, 'middle',
  'Caudales', 'Flow Rates',
  'Una llave llena una pileta vacía en 6 horas. Un desagüe puede vaciar la pileta llena en 9 horas. Si se abren la llave y el desagüe al mismo tiempo con la pileta vacía, ¿en cuántas horas se llena la pileta?',
  'A faucet fills an empty pool in 6 hours. A drain can empty the full pool in 9 hours. If the faucet and the drain are opened at the same time with the pool empty, in how many hours does the pool fill?',
  'Tasa de llenado: $\frac{1}{6}$ pileta/hora. Tasa de vaciado: $\frac{1}{9}$ pileta/hora. Tasa neta: $\frac{1}{6} - \frac{1}{9} = \frac{3}{18} - \frac{2}{18} = \frac{1}{18}$. Tiempo para llenar 1 pileta: $18$ horas.',
  'Fill rate: $\frac{1}{6}$ pool/hour. Drain rate: $\frac{1}{9}$ pool/hour. Net rate: $\frac{1}{6} - \frac{1}{9} = \frac{3}{18} - \frac{2}{18} = \frac{1}{18}$. Time to fill 1 pool: $18$ hours.',
  'integer', '18',
  null, null,
  false, null, null,
  2, 'Numoria Challenge — Practice #3', 2026, true
),
-- MC-P3 Probabilidad ★★ — complemento "al menos uno" (palanca: pensar al revés)
(
  'numoria-p3mc-p3-probabilidad-complemento',
  'probability', 2, 'middle',
  'Probabilidad', 'Probability',
  'Se lanza una moneda justa 4 veces consecutivas. ¿Cuál es la probabilidad de obtener al menos una cara en los 4 lanzamientos? Expresa como fracción simplificada.',
  'A fair coin is tossed 4 times in a row. What is the probability of getting at least one heads in the 4 tosses? Express as simplified fraction.',
  'Usamos el complemento: $P(\text{al menos 1 cara}) = 1 - P(\text{ninguna cara}) = 1 - P(\text{4 sellos})$. Cada lanzamiento es independiente con $P(\text{sello}) = \frac{1}{2}$, así que $P(\text{4 sellos}) = \left(\frac{1}{2}\right)^4 = \frac{1}{16}$. Por tanto $P(\text{al menos 1 cara}) = 1 - \frac{1}{16} = \frac{15}{16}$.',
  'Use the complement: $P(\text{at least 1 heads}) = 1 - P(\text{no heads}) = 1 - P(\text{4 tails})$. Each toss is independent with $P(\text{tails}) = \frac{1}{2}$, so $P(\text{4 tails}) = \left(\frac{1}{2}\right)^4 = \frac{1}{16}$. Therefore $P(\text{at least 1 heads}) = 1 - \frac{1}{16} = \frac{15}{16}$.',
  'fraction_simplified', '15/16',
  'Como fracción simplificada.', 'As simplified fraction.',
  false, null, null,
  2, 'Numoria Challenge — Practice #3', 2026, true
),
-- MC-P4 Geometría 3D ★★ — volumen esfera (palanca: fórmula 4/3πr³, distinta a cilindro/cono)
(
  'numoria-p3mc-p4-geometria-esfera',
  'geometry_3d', 2, 'middle',
  'Geometría 3D', '3D Geometry',
  'Una esfera tiene un radio de 3 cm. ¿Cuál es su volumen? Expresa la respuesta usando $\pi$ (ej: $36\pi$).',
  'A sphere has a radius of 3 cm. What is its volume? Express the answer using $\pi$ (e.g.: $36\pi$).',
  'Volumen de la esfera: $V = \frac{4}{3} \pi r^3$. Sustituyendo $r = 3$: $V = \frac{4}{3} \pi \times 27 = \frac{108\pi}{3} = 36\pi$ cm³.',
  'Sphere volume: $V = \frac{4}{3} \pi r^3$. Substituting $r = 3$: $V = \frac{4}{3} \pi \times 27 = \frac{108\pi}{3} = 36\pi$ cm³.',
  'symbolic_pi', '36π',
  'Usa π (ej: 36π).', 'Use π (e.g. 36π).',
  false, null, null,
  2, 'Numoria Challenge — Practice #3', 2026, true
),
-- MC-P5 Estadística ★★★ — diferencia entre moda y mediana (palanca: dos medidas distintas)
(
  'numoria-p3mc-p5-estadistica-moda-mediana',
  'statistics', 3, 'middle',
  'Estadística', 'Statistics',
  'En la clase de Beto se midió la estatura (en cm) de 10 estudiantes: $145, 150, 148, 152, 150, 148, 155, 150, 147, 145$. ¿Cuál es la diferencia entre la moda y la mediana de las estaturas, en cm?',
  'In Beto''s class, the heights (in cm) of 10 students were measured: $145, 150, 148, 152, 150, 148, 155, 150, 147, 145$. What is the difference between the mode and the median of the heights, in cm?',
  'Ordenamos: $145, 145, 147, 148, 148, 150, 150, 150, 152, 155$. Como hay 10 datos (par), la mediana es el promedio del 5° y 6° valores: $\frac{148 + 150}{2} = 149$ cm. La moda (valor más frecuente) es $150$ (aparece 3 veces). Diferencia: $150 - 149 = 1$ cm.',
  'Sort: $145, 145, 147, 148, 148, 150, 150, 150, 152, 155$. Since there are 10 data points (even), the median is the average of the 5th and 6th values: $\frac{148 + 150}{2} = 149$ cm. The mode (most frequent value) is $150$ (appears 3 times). Difference: $150 - 149 = 1$ cm.',
  'integer', '1',
  'Solo el número (en cm).', 'Just the number (in cm).',
  false, null, null,
  3, 'Numoria Challenge — Practice #3', 2026, true
),
-- MC-P6 Mezclas ★★★ — vaciar y reemplazar (palanca: dos rondas, multiplicación de fracciones)
(
  'numoria-p3mc-p6-mezclas-vaciar-reemplazar',
  'mixtures', 3, 'middle',
  'Mezclas', 'Mixtures',
  'Un tanque contiene 100 litros de jugo puro. Se sacan 20 litros y se reemplazan con 20 litros de agua, mezclando bien. Luego se sacan 20 litros de la mezcla resultante y se reemplazan con 20 litros más de agua. ¿Cuántos litros de jugo puro quedan en el tanque al final?',
  'A tank contains 100 liters of pure juice. 20 liters are removed and replaced with 20 liters of water, mixing well. Then 20 liters of the resulting mixture are removed and replaced with another 20 liters of water. How many liters of pure juice remain in the tank at the end?',
  'Después de la 1ª operación: se quitan 20 L de jugo, quedan $80$ L de jugo. La concentración de jugo es $\frac{80}{100} = 0.8$. En la 2ª operación, los 20 L que se sacan contienen $20 \times 0.8 = 16$ L de jugo. Jugo final: $80 - 16 = 64$ L. (En general, queda $100 \times (0.8)^2 = 64$ L.)',
  'After the 1st operation: 20 L of juice removed, $80$ L of juice remain. Juice concentration is $\frac{80}{100} = 0.8$. In the 2nd operation, the 20 L removed contain $20 \times 0.8 = 16$ L of juice. Final juice: $80 - 16 = 64$ L. (In general, $100 \times (0.8)^2 = 64$ L remain.)',
  'integer', '64',
  'Solo el número (en litros).', 'Just the number (in liters).',
  false, null, null,
  3, 'Numoria Challenge — Practice #3', 2026, true
),
-- MC-P7 Sistemas ★★★ — Vieta (suma y producto, ecuación cuadrática)
(
  'numoria-p3mc-p7-sistemas-vieta',
  'algebra', 3, 'middle',
  'Sistemas de ecuaciones', 'Systems of Equations',
  'El producto de dos números enteros positivos es 60 y su suma es 17. ¿Cuál es el mayor de los dos números?',
  'The product of two positive integers is 60 and their sum is 17. What is the larger of the two numbers?',
  'Sean $a$ y $b$ los números. Sabemos $a + b = 17$ y $a \cdot b = 60$. Son raíces de $t^2 - 17t + 60 = 0$. Factorizamos: $(t - 5)(t - 12) = 0$, así $t = 5$ o $t = 12$. El mayor es $12$. (Verificación: $5 + 12 = 17$ y $5 \times 12 = 60$. ✓)',
  'Let $a$ and $b$ be the numbers. We know $a + b = 17$ and $a \cdot b = 60$. They are roots of $t^2 - 17t + 60 = 0$. Factor: $(t - 5)(t - 12) = 0$, so $t = 5$ or $t = 12$. The larger is $12$. (Check: $5 + 12 = 17$ and $5 \times 12 = 60$. ✓)',
  'integer', '12',
  null, null,
  false, null, null,
  3, 'Numoria Challenge — Practice #3', 2026, true
);

-- ============================================================
-- contest_problems — asociar 7 problemas a cada uno de los 3 contests
-- ============================================================

-- Practice #3 D-E
insert into public.contest_problems (contest_id, problem_id, position)
select c.id, p.id, pos.position
from public.contests c
cross join (values
  (1, 'numoria-p3e-p1-aritmetica-paquetes'),
  (2, 'numoria-p3e-p2-tiempo-zona-horaria'),
  (3, 'numoria-p3e-p3-geometria-cuadrado-area'),
  (4, 'numoria-p3e-p4-fracciones-fraccion-de-fraccion'),
  (5, 'numoria-p3e-p5-razones-tres-terminos'),
  (6, 'numoria-p3e-p6-logica-orden'),
  (7, 'numoria-p3e-p7-patrones-potencias')
) as pos(position, slug)
join public.problems p on p.slug = pos.slug
where c.slug = 'numoria-p3e-2026';

-- Practice #3 D-M sin calc
insert into public.contest_problems (contest_id, problem_id, position)
select c.id, p.id, pos.position
from public.contests c
cross join (values
  (1, 'numoria-p3m-p1-algebra-distributiva'),
  (2, 'numoria-p3m-p2-teoria-ultimo-digito'),
  (3, 'numoria-p3m-p3-geometria-angulos-octagono'),
  (4, 'numoria-p3m-p4-probabilidad-condicional'),
  (5, 'numoria-p3m-p5-conteo-permutaciones'),
  (6, 'numoria-p3m-p6-geometria-prisma-triangular'),
  (7, 'numoria-p3m-p7-sucesiones-geometrica')
) as pos(position, slug)
join public.problems p on p.slug = pos.slug
where c.slug = 'numoria-p3m-2026';

-- Practice #3 D-M con calc
insert into public.contest_problems (contest_id, problem_id, position)
select c.id, p.id, pos.position
from public.contests c
cross join (values
  (1, 'numoria-p3mc-p1-porcentajes-precio-original'),
  (2, 'numoria-p3mc-p2-tasa-caudales'),
  (3, 'numoria-p3mc-p3-probabilidad-complemento'),
  (4, 'numoria-p3mc-p4-geometria-esfera'),
  (5, 'numoria-p3mc-p5-estadistica-moda-mediana'),
  (6, 'numoria-p3mc-p6-mezclas-vaciar-reemplazar'),
  (7, 'numoria-p3mc-p7-sistemas-vieta')
) as pos(position, slug)
join public.problems p on p.slug = pos.slug
where c.slug = 'numoria-p3mc-2026';

-- ============================================================
-- Activar los 3 contests de Practice #3
-- ============================================================
update public.contests
set status = 'active'
where slug in ('numoria-p3e-2026', 'numoria-p3m-2026', 'numoria-p3mc-2026');
