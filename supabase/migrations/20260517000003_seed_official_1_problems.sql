-- ==========================================================
-- Numoria Challenge — Migration 0032: Seed Contest Oficial #1 — 21 problemas
--
-- Plan recalibrado 2026-05-15 — Tarea 4.1.
--
-- 3 contests target (creados en M0031):
--   numoria-c1e-nov07-2026  — División E (sin calc) — 7 problemas Elementary
--   numoria-c1m-nov07-2026  — División M (sin calc) — 7 problemas Middle no-calc
--   numoria-c1mc-nov07-2026 — División M (con calc) — 7 problemas Middle con-calc
--
-- REGLA DE UNICIDAD: ningún problema, contexto ni palanca de Practice #1,
-- #2 o #3 se reutiliza. Verificado contra los 63 slugs existentes (3
-- practices × 3 variantes × 7 problemas).
--
-- Categorías cubiertas (7 distintas por contest, mezcla balanceada):
--   D-E: money / time_clocks / plane_geometry / fractions_decimals /
--        ratios_proportions / logic / sequences_patterns
--   D-M no-calc: algebra / number_theory / plane_geometry / probability /
--                counting_combinatorics / plane_geometry / sequences_patterns
--   D-M calc: percentages / rate_time_distance / probability / geometry_3d /
--             statistics / mixtures / algebra
-- ==========================================================

-- ============================================================
-- CONTEST OFICIAL #1 — DIVISIÓN E (sin calculadora) — 7 problemas
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
-- P1 Money ★ — comisión sobre venta (palanca: % de cantidad simple, distinto a vuelto/multiplicación)
(
  'numoria-c1e-p1-money-comision',
  'money', 1, 'elementary',
  'Aritmética', 'Arithmetic',
  'Don Luis vende mangos en el mercado y gana una comisión del 10% sobre lo que vende. Si en un día vendió 250 lempiras de mangos, ¿cuántas lempiras ganó de comisión?',
  'Don Luis sells mangoes at the market and earns a 10% commission on what he sells. If in one day he sold 250 lempiras of mangoes, how many lempiras did he earn as commission?',
  'El 10% de una cantidad es la cantidad dividida entre 10: $250 \div 10 = 25$ lempiras de comisión.',
  'The 10% of an amount is the amount divided by 10: $250 \div 10 = 25$ lempiras commission.',
  'integer', '25',
  null, null,
  false, null, null,
  1, 'Numoria Challenge — Contest Oficial #1', 2026, true
),
-- P2 Time ★ — minutos cruzando medianoche (palanca: aritmética modular del reloj)
(
  'numoria-c1e-p2-tiempo-medianoche',
  'time_clocks', 1, 'elementary',
  'Tiempo', 'Time',
  'Un avión despega a las 10:30 PM y aterriza a las 1:15 AM del día siguiente. ¿Cuántos minutos en total duró el vuelo?',
  'A plane takes off at 10:30 PM and lands at 1:15 AM the next day. How many minutes in total did the flight last?',
  'De 10:30 PM a 12:00 AM (medianoche) pasan 1 hora 30 min = $90$ minutos. De 12:00 AM a 1:15 AM pasan 1 hora 15 min = $75$ minutos. Total: $90 + 75 = 165$ minutos.',
  'From 10:30 PM to 12:00 AM (midnight) is 1 hour 30 min = $90$ minutes. From 12:00 AM to 1:15 AM is 1 hour 15 min = $75$ minutes. Total: $90 + 75 = 165$ minutes.',
  'integer', '165',
  'Solo el número (en minutos).', 'Just the number (in minutes).',
  false, null, null,
  1, 'Numoria Challenge — Contest Oficial #1', 2026, true
),
-- P3 Plane geometry ★★ — área del rombo (palanca: fórmula diagonales, distinta a triángulo y cuadrado)
(
  'numoria-c1e-p3-geometria-rombo',
  'plane_geometry', 2, 'elementary',
  'Geometría plana', 'Plane Geometry',
  'Un rombo tiene diagonales de 12 cm y 8 cm. ¿Cuál es su área, en cm²?',
  'A rhombus has diagonals of 12 cm and 8 cm. What is its area, in cm²?',
  'El área del rombo es el producto de sus diagonales dividido entre 2: $A = \frac{d_1 \times d_2}{2} = \frac{12 \times 8}{2} = \frac{96}{2} = 48$ cm².',
  'The area of a rhombus is the product of its diagonals divided by 2: $A = \frac{d_1 \times d_2}{2} = \frac{12 \times 8}{2} = \frac{96}{2} = 48$ cm².',
  'integer', '48',
  'Solo el número (en cm²).', 'Just the number (in cm²).',
  false, null, null,
  2, 'Numoria Challenge — Contest Oficial #1', 2026, true
),
-- P4 Fractions ★★ — fracción equivalente (palanca: producto cruzado, distinta a suma/cantidad/composición)
(
  'numoria-c1e-p4-fracciones-equivalente',
  'fractions_decimals', 2, 'elementary',
  'Fracciones', 'Fractions',
  'Encuentra el número $x$ tal que $\frac{3}{4} = \frac{x}{12}$. ¿Cuál es el valor de $x$?',
  'Find the number $x$ such that $\frac{3}{4} = \frac{x}{12}$. What is the value of $x$?',
  'Las fracciones equivalentes mantienen la misma proporción. Multiplico cruzado: $3 \times 12 = 4 \times x$, así $36 = 4x$, entonces $x = 9$. Verificación: $\frac{9}{12} = \frac{3}{4}$ (dividiendo arriba y abajo entre 3). ✓',
  'Equivalent fractions keep the same proportion. Cross-multiply: $3 \times 12 = 4 \times x$, so $36 = 4x$, then $x = 9$. Check: $\frac{9}{12} = \frac{3}{4}$ (divide top and bottom by 3). ✓',
  'integer', '9',
  null, null,
  false, null, null,
  2, 'Numoria Challenge — Contest Oficial #1', 2026, true
),
-- P5 Ratios ★★ — velocidad-tiempo (palanca: tasa básica, distinta a mapa, partes, 3 términos)
(
  'numoria-c1e-p5-razones-velocidad',
  'ratios_proportions', 2, 'elementary',
  'Razones', 'Ratios',
  'Una bicicleta recorre 15 km en 30 minutos manteniendo la misma velocidad. ¿Cuántos km recorrerá en 2 horas?',
  'A bicycle travels 15 km in 30 minutes at the same speed. How many km will it travel in 2 hours?',
  '2 horas = 120 minutos. Eso es $\frac{120}{30} = 4$ veces el tiempo original. Como la velocidad es constante, recorrerá $4 \times 15 = 60$ km.',
  '2 hours = 120 minutes. That is $\frac{120}{30} = 4$ times the original time. Since speed is constant, it will travel $4 \times 15 = 60$ km.',
  'integer', '60',
  'Solo el número (en km).', 'Just the number (in km).',
  false, null, null,
  2, 'Numoria Challenge — Contest Oficial #1', 2026, true
),
-- P6 Logic ★★★ — pesar monedas en balanza (palanca: deducción por comparación de pesos)
(
  'numoria-c1e-p6-logica-monedas',
  'logic', 3, 'elementary',
  'Lógica', 'Logic',
  'Tienes 3 monedas: A, B y C. Sabes que: A pesa más que B. C pesa menos que B. Si las ordenas de la más pesada a la más liviana, ¿cuál queda en el medio?',
  'You have 3 coins: A, B and C. You know: A weighs more than B. C weighs less than B. If you order them from heaviest to lightest, which one is in the middle?',
  'De "A pesa más que B" sabemos: A > B. De "C pesa menos que B" sabemos: C < B (o sea B > C). Combinando: A > B > C. Orden de más pesada a más liviana: A, B, C. La del medio es B. Como la respuesta debe ser un número y B es la 2da, respuesta: $2$.',
  'From "A weighs more than B" we know: A > B. From "C weighs less than B" we know: C < B (i.e. B > C). Combining: A > B > C. Order heaviest to lightest: A, B, C. Middle is B. Since the answer must be a number and B is the 2nd one, answer: $2$.',
  'integer', '2',
  'Responde con la posición (1 = más pesada, 3 = más liviana) de la moneda del medio.',
  'Answer with the position (1 = heaviest, 3 = lightest) of the middle coin.',
  false, null, null,
  3, 'Numoria Challenge — Contest Oficial #1', 2026, true
),
-- P7 Patterns ★★★ — pares ordenados con regla doble (palanca: 2 dimensiones del patrón)
(
  'numoria-c1e-p7-patrones-doble',
  'sequences_patterns', 3, 'elementary',
  'Patrones', 'Patterns',
  'Observa los pares: (1, 2), (2, 4), (3, 8), (4, 16), (5, 32). El primer número aumenta de 1 en 1, y el segundo se duplica cada vez. ¿Cuál es el segundo número del par (7, ?)?',
  'Observe the pairs: (1, 2), (2, 4), (3, 8), (4, 16), (5, 32). The first number increases by 1 each time, and the second doubles. What is the second number in the pair (7, ?)?',
  'El segundo número sigue el patrón de potencias de 2: $2, 4, 8, 16, 32, \ldots$, que son $2^1, 2^2, 2^3, 2^4, 2^5, \ldots$. Si el primer número es $n$, el segundo es $2^n$. Para $n = 7$: $2^7 = 128$.',
  'The second number follows powers of 2: $2, 4, 8, 16, 32, \ldots$, which are $2^1, 2^2, 2^3, 2^4, 2^5, \ldots$. If the first is $n$, the second is $2^n$. For $n = 7$: $2^7 = 128$.',
  'integer', '128',
  null, null,
  false, null, null,
  3, 'Numoria Challenge — Contest Oficial #1', 2026, true
);

-- ============================================================
-- CONTEST OFICIAL #1 — DIVISIÓN M (sin calculadora) — 7 problemas
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
-- M-P1 Algebra ★ — valor absoluto |x-3|=5 (palanca: dos soluciones, suma)
(
  'numoria-c1m-p1-algebra-absoluto',
  'algebra', 1, 'middle',
  'Álgebra', 'Algebra',
  'La ecuación $|x - 3| = 5$ tiene dos soluciones. ¿Cuál es la suma de esas dos soluciones?',
  'The equation $|x - 3| = 5$ has two solutions. What is the sum of those two solutions?',
  '$|x - 3| = 5$ significa $x - 3 = 5$ o $x - 3 = -5$, así $x = 8$ o $x = -2$. La suma es $8 + (-2) = 6$. (Observación: para $|x - a| = k$ las soluciones son $a \pm k$, cuya suma es siempre $2a$.)',
  '$|x - 3| = 5$ means $x - 3 = 5$ or $x - 3 = -5$, so $x = 8$ or $x = -2$. Sum is $8 + (-2) = 6$. (Note: for $|x - a| = k$ the solutions are $a \pm k$, summing to $2a$.)',
  'integer', '6',
  null, null,
  false, null, null,
  1, 'Numoria Challenge — Contest Oficial #1', 2026, true
),
-- M-P2 Number theory ★ — suma de cifras + divisibilidad por 3
(
  'numoria-c1m-p2-teoria-cifras',
  'number_theory', 1, 'middle',
  'Teoría de números', 'Number Theory',
  '¿Cuál es el menor entero positivo que sumando sus cifras dé exactamente 11 y que sea divisible entre 3?',
  'What is the smallest positive integer whose digits sum to exactly 11 AND that is divisible by 3?',
  'Para ser divisible entre 3, la suma de cifras debe ser divisible entre 3. Pero $11$ no es divisible entre 3 ($11 = 3 \times 3 + 2$). Por tanto: NO existe un entero cuya suma de cifras sea 11 y sea divisible entre 3. La respuesta es $0$ (no existe). (Truco: ese es el punto del problema — verificar la regla de divisibilidad.)',
  'To be divisible by 3, digit sum must be divisible by 3. But $11$ is not divisible by 3 ($11 = 3 \times 3 + 2$). So: NO integer has digit sum 11 and is divisible by 3. Answer: $0$ (none exists). (Trick: that''s the point — apply the divisibility rule.)',
  'integer', '0',
  'Si no existe, responde 0.', 'If none exists, answer 0.',
  false, null, null,
  1, 'Numoria Challenge — Contest Oficial #1', 2026, true
),
-- M-P3 Plane geometry ★★ — área del semicírculo (palanca: media circunferencia, π)
(
  'numoria-c1m-p3-geometria-semicirculo',
  'plane_geometry', 2, 'middle',
  'Geometría plana', 'Plane Geometry',
  'Un semicírculo tiene radio 4 cm. ¿Cuál es su área? Expresa la respuesta usando $\pi$ (ej: $8\pi$).',
  'A semicircle has radius 4 cm. What is its area? Express the answer using $\pi$ (e.g.: $8\pi$).',
  'El área del círculo completo es $\pi r^2 = \pi \times 16 = 16\pi$. El semicírculo es la mitad: $\frac{16\pi}{2} = 8\pi$ cm².',
  'Full circle area is $\pi r^2 = \pi \times 16 = 16\pi$. Semicircle is half: $\frac{16\pi}{2} = 8\pi$ cm².',
  'symbolic_pi', '8π',
  'Usa π (ej: 8π).', 'Use π (e.g. 8π).',
  false, null, null,
  2, 'Numoria Challenge — Contest Oficial #1', 2026, true
),
-- M-P4 Probability ★★ — complemento "no par en 4 lanzamientos" (palanca: distinta a P#3 "al menos 1 cara" porque aquí cuento dado)
(
  'numoria-c1m-p4-probabilidad-no-par',
  'probability', 2, 'middle',
  'Probabilidad', 'Probability',
  'Se lanza un dado estándar de 6 caras 4 veces. ¿Cuál es la probabilidad de que NUNCA salga un número par en los 4 lanzamientos? Expresa como fracción simplificada.',
  'A standard 6-sided die is rolled 4 times. What is the probability of NEVER getting an even number in the 4 rolls? Express as simplified fraction.',
  'En cada lanzamiento, $P(\text{impar}) = \frac{3}{6} = \frac{1}{2}$ (caras 1, 3, 5). Los lanzamientos son independientes, así que $P(\text{4 impares}) = \left(\frac{1}{2}\right)^4 = \frac{1}{16}$.',
  'On each roll, $P(\text{odd}) = \frac{3}{6} = \frac{1}{2}$ (faces 1, 3, 5). Rolls are independent, so $P(\text{4 odds}) = \left(\frac{1}{2}\right)^4 = \frac{1}{16}$.',
  'fraction_simplified', '1/16',
  'Como fracción simplificada.', 'As simplified fraction.',
  false, null, null,
  2, 'Numoria Challenge — Contest Oficial #1', 2026, true
),
-- M-P5 Counting ★★ — principio palomar (palanca: garantizar par mínimo)
(
  'numoria-c1m-p5-conteo-palomar',
  'counting_combinatorics', 2, 'middle',
  'Conteo', 'Counting',
  'En un cajón hay calcetines de 5 colores diferentes (rojo, azul, verde, amarillo, negro), revueltos. Sacas calcetines uno por uno sin mirar. ¿Cuál es la cantidad mínima de calcetines que debes sacar para asegurar que tienes al menos un par del mismo color?',
  'A drawer has socks of 5 different colors (red, blue, green, yellow, black), all mixed. You pull socks one by one without looking. What is the MINIMUM number of socks you must pull to guarantee at least one pair of the same color?',
  'Por el principio del palomar, si sacas 5 calcetines podrían ser uno de cada color (sin par). Pero al sacar el 6°, forzosamente debe coincidir con uno de los 5 colores anteriores → par garantizado. Respuesta: $5 + 1 = 6$.',
  'By the pigeonhole principle, pulling 5 socks could give one of each color (no pair). But pulling the 6th MUST match one of the previous 5 colors → pair guaranteed. Answer: $5 + 1 = 6$.',
  'integer', '6',
  null, null,
  false, null, null,
  2, 'Numoria Challenge — Contest Oficial #1', 2026, true
),
-- M-P6 Pythagoras ★★★ — escalera 8-15-17 (palanca: triple pitagórico no trivial, distinto a 3-4-5/5-12-13/9-12-15)
(
  'numoria-c1m-p6-pitagoras-escalera',
  'pythagoras', 3, 'middle',
  'Pitágoras', 'Pythagoras',
  'Una escalera de 17 m de longitud se apoya contra una pared vertical. La base de la escalera está a 8 m del pie de la pared. ¿A qué altura, en metros, llega la escalera sobre la pared?',
  'A 17 m long ladder leans against a vertical wall. The base of the ladder is 8 m from the foot of the wall. How high up the wall, in meters, does the ladder reach?',
  'La escalera, la pared y el suelo forman un triángulo rectángulo donde la escalera es la hipotenusa. Por Pitágoras: $17^2 = 8^2 + h^2 \Rightarrow 289 = 64 + h^2 \Rightarrow h^2 = 225 \Rightarrow h = 15$ m. (Triple pitagórico 8-15-17.)',
  'The ladder, wall and floor form a right triangle with the ladder as the hypotenuse. By Pythagoras: $17^2 = 8^2 + h^2 \Rightarrow 289 = 64 + h^2 \Rightarrow h^2 = 225 \Rightarrow h = 15$ m. (Pythagorean triple 8-15-17.)',
  'integer', '15',
  'Solo el número (en metros).', 'Just the number (in meters).',
  false, null, null,
  3, 'Numoria Challenge — Contest Oficial #1', 2026, true
),
-- M-P7 Sequences ★★★ — recurrencia a_n = a_{n-1} + a_{n-3}
(
  'numoria-c1m-p7-sucesiones-recurrencia',
  'sequences_patterns', 3, 'middle',
  'Sucesiones', 'Sequences',
  'En una sucesión, cada término desde el cuarto en adelante es la suma del término anterior y el término tres lugares atrás: $a_n = a_{n-1} + a_{n-3}$. Si $a_1 = 1$, $a_2 = 2$, $a_3 = 3$, ¿cuál es $a_7$?',
  'In a sequence, each term from the fourth on is the sum of the previous term and the term three places back: $a_n = a_{n-1} + a_{n-3}$. If $a_1 = 1$, $a_2 = 2$, $a_3 = 3$, what is $a_7$?',
  'Calculamos paso a paso: $a_4 = a_3 + a_1 = 3 + 1 = 4$. $a_5 = a_4 + a_2 = 4 + 2 = 6$. $a_6 = a_5 + a_3 = 6 + 3 = 9$. $a_7 = a_6 + a_4 = 9 + 4 = 13$.',
  'Step by step: $a_4 = a_3 + a_1 = 3 + 1 = 4$. $a_5 = a_4 + a_2 = 4 + 2 = 6$. $a_6 = a_5 + a_3 = 6 + 3 = 9$. $a_7 = a_6 + a_4 = 9 + 4 = 13$.',
  'integer', '13',
  null, null,
  false, null, null,
  3, 'Numoria Challenge — Contest Oficial #1', 2026, true
);

-- ============================================================
-- CONTEST OFICIAL #1 — DIVISIÓN M (con calculadora) — 7 problemas
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
-- MC-P1 Percentages ★ — cambio relativo (de 80 a 100, % de aumento)
(
  'numoria-c1mc-p1-porcentajes-cambio',
  'percentages', 1, 'middle',
  'Porcentajes', 'Percentages',
  'El precio de un libro subió de 80 lempiras a 100 lempiras. ¿Qué porcentaje de aumento representa ese cambio?',
  'A book''s price went from 80 lempiras to 100 lempiras. What percentage increase does this change represent?',
  'El aumento absoluto es $100 - 80 = 20$ lempiras. El porcentaje de aumento se calcula sobre el precio ORIGINAL (80): $\frac{20}{80} \times 100\% = 0.25 \times 100\% = 25\%$.',
  'Absolute increase: $100 - 80 = 20$ lempiras. The percentage increase is calculated on the ORIGINAL price (80): $\frac{20}{80} \times 100\% = 0.25 \times 100\% = 25\%$.',
  'integer', '25',
  'Solo el número (en %).', 'Just the number (in %).',
  false, null, null,
  1, 'Numoria Challenge — Contest Oficial #1', 2026, true
),
-- MC-P2 Rate-time ★★ — persecución con salida diferida
(
  'numoria-c1mc-p2-tasa-persecucion',
  'rate_time_distance', 2, 'middle',
  'Persecución', 'Pursuit',
  'Un auto sale del kilómetro 0 a 60 km/h. Dos horas después, una moto sale del kilómetro 0 a 100 km/h por la misma carretera. ¿Cuántas horas después de que sale la moto la alcanza al auto?',
  'A car leaves kilometer 0 at 60 km/h. Two hours later, a motorcycle leaves kilometer 0 at 100 km/h on the same road. How many hours after the motorcycle leaves does it catch up to the car?',
  'Cuando la moto sale, el auto ya recorrió $60 \times 2 = 120$ km. La diferencia de velocidades (velocidad de aproximación) es $100 - 60 = 40$ km/h. Tiempo para cerrar la brecha: $\frac{120}{40} = 3$ horas.',
  'When the motorcycle leaves, the car already traveled $60 \times 2 = 120$ km. Speed difference (closing speed) is $100 - 60 = 40$ km/h. Time to close the gap: $\frac{120}{40} = 3$ hours.',
  'integer', '3',
  'Solo el número (en horas).', 'Just the number (in hours).',
  false, null, null,
  2, 'Numoria Challenge — Contest Oficial #1', 2026, true
),
-- MC-P3 Probability ★★ — independientes (palanca: producto de probabilidades)
(
  'numoria-c1mc-p3-probabilidad-independientes',
  'probability', 2, 'middle',
  'Probabilidad', 'Probability',
  'La probabilidad de que llueva mañana es $\frac{2}{5}$ y la probabilidad de que haya viento fuerte es $\frac{1}{3}$, eventos independientes. ¿Cuál es la probabilidad de que llueva Y haya viento fuerte? Expresa como fracción simplificada.',
  'The probability of rain tomorrow is $\frac{2}{5}$ and the probability of strong wind is $\frac{1}{3}$, independent events. What is the probability of BOTH rain AND strong wind? Express as simplified fraction.',
  'Para eventos independientes, $P(A \cap B) = P(A) \times P(B) = \frac{2}{5} \times \frac{1}{3} = \frac{2}{15}$.',
  'For independent events, $P(A \cap B) = P(A) \times P(B) = \frac{2}{5} \times \frac{1}{3} = \frac{2}{15}$.',
  'fraction_simplified', '2/15',
  'Como fracción simplificada.', 'As simplified fraction.',
  false, null, null,
  2, 'Numoria Challenge — Contest Oficial #1', 2026, true
),
-- MC-P4 Geometry 3D ★★ — prisma hexagonal volumen
(
  'numoria-c1mc-p4-geometria-prisma-hexagonal',
  'geometry_3d', 2, 'middle',
  'Geometría 3D', '3D Geometry',
  'Un prisma hexagonal regular tiene base un hexágono regular de lado 4 cm. La altura del prisma es 10 cm. Sabiendo que el área de un hexágono regular de lado $s$ es $\frac{3\sqrt{3}}{2} s^2$, ¿cuál es el volumen del prisma? Expresa con $\sqrt{3}$ (ej: $120\sqrt{3}$).',
  'A regular hexagonal prism has a regular hexagonal base of side 4 cm. The prism height is 10 cm. Knowing that the area of a regular hexagon of side $s$ is $\frac{3\sqrt{3}}{2} s^2$, what is the prism volume? Express using $\sqrt{3}$ (e.g.: $120\sqrt{3}$).',
  'Área de la base: $\frac{3\sqrt{3}}{2} \times 4^2 = \frac{3\sqrt{3}}{2} \times 16 = 24\sqrt{3}$ cm². Volumen del prisma = área base × altura: $24\sqrt{3} \times 10 = 240\sqrt{3}$ cm³.',
  'Base area: $\frac{3\sqrt{3}}{2} \times 4^2 = \frac{3\sqrt{3}}{2} \times 16 = 24\sqrt{3}$ cm². Prism volume = base area × height: $24\sqrt{3} \times 10 = 240\sqrt{3}$ cm³.',
  'with_units', '240√3 cm³',
  'Incluye unidades y √3 (ej: 240√3 cm³).', 'Include units and √3 (e.g. 240√3 cm³).',
  false, null, null,
  2, 'Numoria Challenge — Contest Oficial #1', 2026, true
),
-- MC-P5 Statistics ★★★ — media geométrica de 2 razones
(
  'numoria-c1mc-p5-estadistica-geometrica',
  'statistics', 3, 'middle',
  'Estadística', 'Statistics',
  'Una inversión crece 25% el primer año y 44% el segundo año. La media geométrica del factor de crecimiento anual es $\sqrt{1.25 \times 1.44}$. Expresada como porcentaje de crecimiento anual promedio, ¿qué número entero corresponde? (El factor 1.0 = 0% crecimiento, factor 1.34 = 34% crecimiento, etc.)',
  'An investment grows 25% the first year and 44% the second year. The geometric mean of the annual growth factor is $\sqrt{1.25 \times 1.44}$. Expressed as a percentage of average annual growth, what integer does it correspond to? (Factor 1.0 = 0% growth, factor 1.34 = 34% growth, etc.)',
  'Calculamos: $\sqrt{1.25 \times 1.44} = \sqrt{1.8}$. Como $1.8 = \frac{9}{5}$, tenemos $\sqrt{1.8} = \sqrt{1.8} \approx 1.3416...$. Pero podemos ser exactos: $1.25 \times 1.44 = 1.80$, y notamos que $1.5^2 = 2.25$ es demasiado, mientras $1.34^2 = 1.7956$. Más preciso: $1.342^2 = 1.8010$. Así $\sqrt{1.8} \approx 1.342$, que como porcentaje de crecimiento es $34\%$. (Truco: $1.25 \times 1.44 = 1.8$, y $1.34^2 \approx 1.80$.)',
  'Compute: $\sqrt{1.25 \times 1.44} = \sqrt{1.8}$. Since $1.8 = \frac{9}{5}$, $\sqrt{1.8} \approx 1.3416...$. More precisely $1.342^2 = 1.8010$. So $\sqrt{1.8} \approx 1.342$, which as growth percentage is $34\%$.',
  'integer', '34',
  'Redondea al entero (en %).', 'Round to the integer (in %).',
  false, null, null,
  3, 'Numoria Challenge — Contest Oficial #1', 2026, true
),
-- MC-P6 Mixtures ★★★ — tres soluciones de distintos % (palanca: ecuación con 3 fuentes)
(
  'numoria-c1mc-p6-mezclas-tres-soluciones',
  'mixtures', 3, 'middle',
  'Mezclas', 'Mixtures',
  'Se mezclan 200 ml de solución al 10% de sal, 300 ml de solución al 20% y 500 ml de solución al 40%. ¿Cuál es el porcentaje de sal en la mezcla final?',
  '200 ml of 10% salt solution, 300 ml of 20% solution, and 500 ml of 40% solution are mixed. What is the salt percentage in the final mixture?',
  'Sal total: $200 \times 0.10 + 300 \times 0.20 + 500 \times 0.40 = 20 + 60 + 200 = 280$ ml de sal. Volumen total: $200 + 300 + 500 = 1000$ ml. Porcentaje: $\frac{280}{1000} \times 100\% = 28\%$.',
  'Total salt: $200 \times 0.10 + 300 \times 0.20 + 500 \times 0.40 = 20 + 60 + 200 = 280$ ml of salt. Total volume: $200 + 300 + 500 = 1000$ ml. Percentage: $\frac{280}{1000} \times 100\% = 28\%$.',
  'integer', '28',
  'Solo el número (en %).', 'Just the number (in %).',
  false, null, null,
  3, 'Numoria Challenge — Contest Oficial #1', 2026, true
),
-- MC-P7 Algebra ★★★ — ecuación cuadrática completar cuadrado
(
  'numoria-c1mc-p7-algebra-cuadrado',
  'algebra', 3, 'middle',
  'Ecuación cuadrática', 'Quadratic Equation',
  'Resuelve la ecuación $x^2 - 6x + 5 = 0$ completando el cuadrado o factorizando. ¿Cuál es la suma de las dos soluciones?',
  'Solve $x^2 - 6x + 5 = 0$ by completing the square or factoring. What is the sum of the two solutions?',
  'Factorizando: $x^2 - 6x + 5 = (x - 1)(x - 5) = 0$, así $x = 1$ o $x = 5$. Suma: $1 + 5 = 6$. (Verificación con Vieta: en $x^2 + bx + c = 0$, suma de raíces $= -b = -(-6) = 6$. ✓)',
  'Factor: $x^2 - 6x + 5 = (x - 1)(x - 5) = 0$, so $x = 1$ or $x = 5$. Sum: $1 + 5 = 6$. (Check by Vieta: in $x^2 + bx + c = 0$, sum of roots $= -b = -(-6) = 6$. ✓)',
  'integer', '6',
  null, null,
  false, null, null,
  3, 'Numoria Challenge — Contest Oficial #1', 2026, true
);

-- ============================================================
-- contest_problems — asociar 7 problemas a cada uno de los 3 contests oficiales #1
-- ============================================================

-- Contest oficial #1 D-E
insert into public.contest_problems (contest_id, problem_id, position)
select c.id, p.id, pos.position
from public.contests c
cross join (values
  (1, 'numoria-c1e-p1-money-comision'),
  (2, 'numoria-c1e-p2-tiempo-medianoche'),
  (3, 'numoria-c1e-p3-geometria-rombo'),
  (4, 'numoria-c1e-p4-fracciones-equivalente'),
  (5, 'numoria-c1e-p5-razones-velocidad'),
  (6, 'numoria-c1e-p6-logica-monedas'),
  (7, 'numoria-c1e-p7-patrones-doble')
) as pos(position, slug)
join public.problems p on p.slug = pos.slug
where c.slug = 'numoria-c1e-nov07-2026';

-- Contest oficial #1 D-M sin calc
insert into public.contest_problems (contest_id, problem_id, position)
select c.id, p.id, pos.position
from public.contests c
cross join (values
  (1, 'numoria-c1m-p1-algebra-absoluto'),
  (2, 'numoria-c1m-p2-teoria-cifras'),
  (3, 'numoria-c1m-p3-geometria-semicirculo'),
  (4, 'numoria-c1m-p4-probabilidad-no-par'),
  (5, 'numoria-c1m-p5-conteo-palomar'),
  (6, 'numoria-c1m-p6-pitagoras-escalera'),
  (7, 'numoria-c1m-p7-sucesiones-recurrencia')
) as pos(position, slug)
join public.problems p on p.slug = pos.slug
where c.slug = 'numoria-c1m-nov07-2026';

-- Contest oficial #1 D-M con calc
insert into public.contest_problems (contest_id, problem_id, position)
select c.id, p.id, pos.position
from public.contests c
cross join (values
  (1, 'numoria-c1mc-p1-porcentajes-cambio'),
  (2, 'numoria-c1mc-p2-tasa-persecucion'),
  (3, 'numoria-c1mc-p3-probabilidad-independientes'),
  (4, 'numoria-c1mc-p4-geometria-prisma-hexagonal'),
  (5, 'numoria-c1mc-p5-estadistica-geometrica'),
  (6, 'numoria-c1mc-p6-mezclas-tres-soluciones'),
  (7, 'numoria-c1mc-p7-algebra-cuadrado')
) as pos(position, slug)
join public.problems p on p.slug = pos.slug
where c.slug = 'numoria-c1mc-nov07-2026';

-- ============================================================
-- NOTA: Los 3 contests del Oficial #1 permanecen en status='draft'.
-- El founder los activará (status='scheduled') cuando verifique los
-- problemas, alrededor de octubre 2026 (antes del 7 nov 2026).
-- ============================================================
