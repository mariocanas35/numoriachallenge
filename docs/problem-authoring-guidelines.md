# Numoria Challenge — Guía de autoría de problemas

> **Audiencia**: equipo Numoria + AI assistants que generen problemas para contests.
> **Versión**: v1.0 (2026-05-12) — founder authoring guidelines.
> **Refs**: business-model-decisions.md (problems curated by Numoria, not teachers).

---

## 🚫 Regla cardinal: calculadora

**Elementary 4° y 5° grado NUNCA deben usar calculadora.**

Convención derivada para nuestro schema `contests.calculator_allowed`:

- **`division='elementary'`** → `calculator_allowed = false` **siempre**
  (cubre grados 4-6; tipo MOEMS Division E)
- **`division='middle'`** → `calculator_allowed` opcional según el contest
  (cubre grados 7-8; tipo MOEMS Division M)

Esta regla **se enforce en authoring**, no en código. Cuando crees un seed migration nuevo para Elementary, valida que `calculator_allowed = false`.

---

## 🎨 Las 7 palancas de creatividad

**Aplica al menos 2 palancas por problema.** Estas convierten problemas mecánicos en problemas de razonamiento que valen la pena.

| # | Palanca | Cómo identificarla |
|---|---|---|
| 1 | **Inversión del problema clásico** | Dar resultado, pedir inicio (ej. "el promedio fue X, ¿cuál es el dato faltante?") |
| 2 | **Doble restricción simultánea** | Dos condiciones que se intersecan (ej. "divisible por 4 Y por 9, de 3 dígitos, mínimo") |
| 3 | **Observación antes que cálculo** | Insight que reduce trabajo (ej. paridad, simetría, simplificación) |
| 4 | **Contextos no escolares reales** | Impresión 3D, streaming, criptomonedas, deliveries, gaming |
| 5 | **Combinación de dos ramas matemáticas** | Geometría + álgebra, conteo + probabilidad, teoría números + secuencias |
| 6 | **Restricción oculta en el enunciado** | Pista que el student debe inferir (ej. "natural" implica positivo no cero) |
| 7 | **Inferencia faltante** | Deducir un dato antes de calcular (ej. "si la suma es par, entonces..."), |

**Aplicación**: cada problema del banco debe poder etiquetarse explícitamente con 2+ palancas. Si solo cabe 1 → es problema "mecánico" → descártalo o mejóralo.

---

## 📚 Temática completa (taxonomía de subtemas)

Los problemas pueden venir de cualquiera de estas áreas. Una contest típica usa **7 categorías distintas** (no repetir rama).

### Aritmética y operaciones
- Porcentajes simples, compuestos, sucesivos
- Descuentos, impuestos, propinas, comisiones
- Interés simple e interés compuesto básico
- Fracciones, decimales, conversión entre ambos
- Razones, proporciones, escala
- Promedios (aritmético, ponderado, móvil)
- Operaciones con números mixtos
- Notación científica básica
- Estimación y redondeo con criterio

### Álgebra
- Ecuaciones lineales en una variable
- Sistemas 2×2 lineales
- Problemas verbales de edad, dinero, monedas
- Tasa-distancia-tiempo (encuentro, alcance, río con corriente)
- Mezcla y concentración
- Trabajo conjunto (dos personas, máquinas, tubería llena/vacía)
- Secuencias aritméticas y geométricas
- Secuencias recursivas simples
- Operadores personalizados (define `a★b = ...` y pide calcular)
- Patrones algebraicos con variables

### Geometría plana
- Área y perímetro: rectángulos, triángulos, paralelogramos, trapecios, círculos
- Áreas de figuras compuestas y regiones sombreadas
- Ángulos: triángulos, polígonos, paralelas cortadas por transversal
- Suma de ángulos interiores/exteriores de polígonos
- Triángulos semejantes y congruentes
- Pitágoras con triples (3-4-5, 5-12-13, 8-15-17, 7-24-25)
- Propiedades: paralelogramos, rombos, cuadrados
- Círculos: radio, diámetro, circunferencia, área, sectores, cuerdas
- Ángulos centrales e inscritos (básico)
- Polígonos regulares
- Reflexiones, rotaciones, simetría

### Geometría 3D
- Volumen y área superficial: prismas rectangulares, cilindros, pirámides, conos, esferas
- Cubos: aristas, vértices, caras, diagonales
- Redes (nets) de cubos y otros sólidos
- Cubos pintados y cortados (cuántos cubitos tienen 0/1/2/3 caras pintadas)

### Teoría de números
- Divisibilidad y criterios (2, 3, 4, 5, 6, 8, 9, 10, 11)
- Primos y compuestos
- Factorización prima
- MCD y mcm
- Paridad (pares e impares)
- Cuadrados perfectos, cubos perfectos
- Números triangulares y figurados
- Residuos y aritmética modular informal
- Dígitos: suma, producto, manipulación de posiciones
- Palíndromos numéricos
- Bases numéricas (2, 5, 8, conversión)
- Fibonacci básicos
- Números felices, conjeturas con dígitos (introductorio)

### Conteo y combinatoria
- Principio multiplicativo
- Permutaciones simples
- Combinaciones simples (C(n,k) con n pequeño)
- Apretones de manos / problemas de pareo
- Conteo de caminos en cuadrículas
- Casework (sumar casos disjuntos)
- Conteo complementario (total − no deseado)
- Inclusión-exclusión para 2 y 3 conjuntos
- Principio del palomar (pigeonhole) básico
- Arreglos circulares básicos
- Conteo con restricciones (no consecutivos, no juntos, posiciones fijas)

### Probabilidad
- Probabilidad clásica como fracción simplificada
- Eventos compuestos (con y sin reemplazo)
- Eventos independientes y dependientes
- Probabilidad geométrica básica (dardo en región)
- Dados estándar y no estándar
- Cartas, urnas, monedas
- Valor esperado introductorio

### Estadística
- Media, mediana, moda
- Rango y rango intercuartílico básico
- Problemas con datos faltantes (encontrar el valor que produce cierta media)
- Interpretación de gráficos: barras, líneas, circulares
- Diagramas de tallo y hoja
- Pictogramas

### Lógica y razonamiento
- Verdadero/falso con varias declaraciones
- "Quién es quién" (Sudoku lógico narrativo)
- Tablas de verdad implícitas
- Criptoaritmética (`SEND + MORE = MONEY` nivel introductorio)
- Pesadas con balanza
- Cruces de río con restricciones
- Paridad como argumento de imposibilidad
- Coloreado e invariantes simples

### Tiempo, fechas, calendarios
- Días/semanas/meses entre fechas
- Días de la semana con aritmética modular (mod 7)
- Años bisiestos
- Ángulos entre manecillas de un reloj
- Tiempo transcurrido y conversiones
- Husos horarios básicos

### Patrones y secuencias visuales
- Patrones con figuras que crecen
- Secuencias de puntos, palitos, cubos
- Sucesiones de imágenes con regla oculta
- Teselados básicos

### Razonamiento financiero (contexto real)
- Cuentas bancarias con interés simple
- Comparación de planes (telefonía, streaming, gimnasio)
- Tipos de cambio entre monedas
- Descuentos por volumen vs. cupones porcentuales
- Costo unitario y mejor compra

---

## 🎨 Capa visual: diagramas, gráficos y esquemas

### Cuándo incluir diagrama

**Solo cuando es necesario o reduce significativamente la lectura del enunciado.**

Distribución típica: **4 a 6 diagramas en los 14 problemas del contest**, concentrados en:
- Geometría plana
- Geometría 3D
- Conteo con configuración espacial
- Probabilidad con dados o cartas
- Estadística con gráficos

### Convenciones gráficas obligatorias

| Elemento | Convención |
|---|---|
| **Vértices** | Mayúsculas, ubicados FUERA de la figura cuando sea posible |
| **Dimensiones** | Junto al lado correspondiente, paralelas al lado, sin sobreponer la figura |
| **Ángulos** | Arco pequeño cerca del vértice, etiqueta junto al arco |
| **Ángulo recto** | Cuadradito pequeño (NO arco) |
| **Variables desconocidas** | Cursiva (`x`, `y`, `h`, `r`) |
| **Valores conocidos** | Redonda (`8 cm`, `60°`) |
| **Caption "no a escala"** | Casi siempre en olimpiadas (figuras no respetan proporciones reales) |
| **Aristas visibles** | Línea continua |
| **Aristas ocultas 3D** | Línea punteada |
| **Líneas auxiliares** | Gris claro (alturas, diagonales, ejes de simetría) |
| **Regiones de interés** | Sombreadas |
| **Regiones secundarias** | Sin sombrear |
| **Flechas bidireccionales** | Para indicar medidas |
| **Flechas direccionales** | Para indicar movimiento u orden |
| **Etiquetas** | Siempre AFUERA cuando hay riesgo de tapar contenido |

---

## 📐 Catálogo de plantillas de diagramas

### Geometría plana

| Plantilla | Descripción |
|---|---|
| Rectángulos concéntricos | Exterior con dims totales; interior centrado; área entre ambos sombreada; variable indicando ancho desconocido uniforme |
| Cuadrado dividido por puntos medios | Cuadrado con puntos medios marcados; segmentos que conectan puntos con vértices; región interior sombreada |
| Triángulo con altura/mediana/bisectriz | Vértices etiquetados; segmento auxiliar en gris claro; ángulo recto con cuadradito si aplica |
| Triángulo isósceles/equilátero con marcas | Lados iguales con tildes (1 raya, 2 rayas) para indicar congruencia |
| Triángulos semejantes lado a lado | Dos triángulos de distinto tamaño; vértices correspondientes (ABC y A'B'C'); razón de semejanza |
| Figura compuesta con regiones sombreadas | Polígono irregular dividido en partes; dimensiones parciales etiquetadas |
| Polígono regular con diagonales | Pentágono/hexágono/octágono con todas o algunas diagonales |
| Círculo con cuerda/sector/segmento | Centro O marcado; cuerda/radio/diámetro etiquetado; sector sombreado entre dos radios |
| Círculos tangentes | Dos+ círculos tangentes (exterior o interior); centros marcados; radios etiquetados |
| Inscritos/circunscritos | Cuadrado en círculo o viceversa; vértices sobre la otra figura; dimensión clave dada |
| Líneas paralelas + transversal | Dos líneas paralelas (con marcas de paralelismo: flechas pequeñas); transversal diagonal; ángulos marcados |
| Polígono con ángulos | Pentágono/hexágono con cada ángulo interior marcado por arco; etiquetas variables o valores |

### Geometría 3D

| Plantilla | Descripción |
|---|---|
| Cilindro isométrico | Base elíptica superior e inferior; generatrices verticales; aristas posteriores punteadas; radio y altura |
| Cono isométrico | Base elíptica, vértice superior, generatriz lateral; aristas ocultas punteadas; radio y altura |
| Prisma rectangular | Vista isométrica; aristas frontales continuas, posteriores punteadas; 3 dimensiones (largo, ancho, alto) |
| Cubo con caras pintadas/etiquetadas | Cubo isométrico; caras sombreadas o letras/números; aristas posteriores punteadas |
| Cubo cortado en cubitos | Cuadrícula visible (3×3×3 o 4×4×4); cubitos exteriores vs interiores |
| Red (net) de cubo/sólido | Despliegue plano de las 6 caras (cruz, T, L); cada cara con número/letra/color |
| Pirámide | Base cuadrada/triangular; aristas laterales hacia ápice; altura interna auxiliar; posteriores punteadas |
| Esfera con plano de corte | Esfera con círculo ecuatorial; radio/diámetro; opcional plano horizontal que corta |

### Tablas y matrices

| Plantilla | Descripción |
|---|---|
| Cuadrado mágico 3×3 | Cuadrícula con bordes; números visibles centrados; celdas vacías en blanco |
| Tabla de doble entrada | Filas y columnas etiquetadas; celdas con valores; favorables marcadas |
| Calendario mensual | Cuadrícula 7×5 o 7×6; días en cabecera; fechas; celdas sombreadas |
| Tabla de frecuencias | Dos columnas (valor/intervalo, frecuencia) |

### Configuraciones de objetos

| Plantilla | Descripción |
|---|---|
| Configuración lineal | Fila de cuadrados/círculos/letras (sillas, personas, casillas); algunas etiquetadas, otras como guiones bajos |
| Configuración circular | Círculo grande con objetos/personas distribuidos en bordes; etiquetas |
| Configuración en cuadrícula | Grid m×n con casillas marcadas/sombreadas/con símbolos (X, O) |

### Conjuntos y conteo

| Plantilla | Descripción |
|---|---|
| Venn de 2 conjuntos | Dos círculos solapados; etiquetas de conjuntos arriba; números en cada región |
| Venn de 3 conjuntos | Tres círculos solapados; siete regiones numeradas; exterior opcional |
| Árbol de probabilidad | Nodo raíz; ramas con probabilidades; hojas con resultados; productos al final |

### Recta numérica y ejes

| Plantilla | Descripción |
|---|---|
| Recta numérica con puntos | Línea horizontal con marcas regulares; números etiquetados; puntos de interés con círculos sólidos |
| Plano cartesiano con puntos | Ejes x/y con escala; puntos con coordenadas etiquetadas; segmentos opcionales |
| Plano cartesiano con figura | Polígono dibujado conectando puntos con coordenadas |

### Gráficos estadísticos

| Plantilla | Descripción |
|---|---|
| Gráfico de barras | Barras verticales u horizontales; ejes etiquetados; valores arriba o en escala |
| Gráfico de líneas | Eje horizontal de tiempo/categoría; puntos conectados; valores opcionales |
| Gráfico circular (pie) | Círculo dividido; cada sector con porcentaje/valor; etiquetas afuera o adentro |
| Tallo y hoja | Dos columnas; línea vertical separadora; hojas ordenadas |
| Pictograma | Iconos repetidos; leyenda indicando valor de cada icono |

### Relojes y elementos temporales

| Plantilla | Descripción |
|---|---|
| Reloj analógico | Círculo con números 1-12 o marcas horarias; manecillas (hora corta, minuto larga); ángulo entre manecillas opcional |
| Línea de tiempo | Línea horizontal con eventos en puntos; etiquetas de fechas/duraciones; flechas indicando intervalos |

### Configuraciones específicas

| Plantilla | Descripción |
|---|---|
| Balanza con objetos | Dos platos en equilibrio o desequilibrio; objetos como figuras simples; pesos etiquetados o desconocidos |
| Diamante de béisbol / pista circular | Cuadrado rotado 45° con vértices (home, primera, segunda, tercera); o pista oval |
| Mapa o cuadrícula de calles | Manhattan grid con calles/avenidas; puntos A y B marcados; restricciones con flechas |
| Patrón secuencial de figuras | Tres-cuatro etapas (Figura 1, 2, 3, ...) mostrando crecimiento; preguntar por figura n |
| Tangram o disección | Cuadrado/figura dividida en piezas geométricas; algunas sombreadas; pide área de pieza específica |

---

## ✅ Checklist para crear un problema nuevo

1. [ ] Tema asignado de la taxonomía (no repetir categoría dentro del mismo contest)
2. [ ] Al menos 2 palancas de creatividad aplicadas
3. [ ] Dificultad alineada con stars (1 = ★, 2 = ★★, 3 = ★★★)
4. [ ] Bilingüe ES + EN (mismo problema, mismas dimensiones numéricas)
5. [ ] `answer_type` correcto (integer / pair_integer / fraction_simplified / decimal_cents / with_units / symbolic_pi / multiple_choice)
6. [ ] Si `division=elementary` → contest tiene `calculator_allowed=false`
7. [ ] Explicación KaTeX con razonamiento paso a paso (en ES + EN)
8. [ ] Si tiene diagrama: usar plantilla del catálogo + convenciones gráficas + caption "no dibujado a escala"
9. [ ] SVG diagrama en `apps/web/public/problem-diagrams/<slug>.svg` (pipeline existente desde Phase 3)
10. [ ] Slug del problema: `numoria-c<N><E|M>-p<pos>-<categoria>-<short-desc>`

---

## Referencias

- Inspiración: ASMA (American School Math Association), MOEMS (Math Olympiad for Elementary and Middle Schools)
- Implementación de scoring: [apps/web/src/lib/contests/scoring.ts](apps/web/src/lib/contests/scoring.ts)
- Schema de problems: [supabase/migrations/20260513000003_problems_contests_schema.sql](supabase/migrations/20260513000003_problems_contests_schema.sql)
- Seed actual (referencia): [supabase/migrations/20260513000005_seed_contest_1_division_e.sql](supabase/migrations/20260513000005_seed_contest_1_division_e.sql)
