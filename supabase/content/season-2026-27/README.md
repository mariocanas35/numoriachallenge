# Temporada 2026-2027 — contenido de las competencias

Fuente: los PDF del fundador (`Contest N. <Mes> <Año>.pdf`). Cada PDF trae la prueba
(2 páginas, Middle School, grados 6–8, 35 minutos, 7 problemas, sin calculadora, en inglés)
y la clave con soluciones (2 páginas).

Cada competencia se describe en `contest-N.json` con el formato de abajo. Una migración
SQL generada a partir de estos JSON carga las competencias y sus problemas.
Los diagramas para la versión en línea van en
`apps/web/public/problem-diagrams/2026-27/cN-pK.svg`.

## Formato de `contest-N.json`

```json
{
  "contest_number": 1,
  "slug": "numoria-2627-c1-m",
  "title_es": "Competencia 1 · Noviembre 2026",
  "title_en": "Contest 1 · November 2026",
  "division": "middle",
  "calculator_allowed": false,
  "duration_minutes": 35,
  "window_start": "2026-11-23",
  "window_days": 12,
  "problems": [
    {
      "position": 1,
      "slug": "numoria-2627-c1m-p1-map-scale",
      "category": "ratios_proportions",
      "stars": 1,
      "points": 1,
      "answer_type": "integer",
      "expected_answer": "120",
      "title_es": "Escala del mapa",
      "title_en": "Map Scale",
      "body_es": "…enunciado completo en español…",
      "body_en": "…enunciado completo en inglés, fiel al PDF…",
      "format_directive_es": "Da tu respuesta en minutos. Escribe solo el número.",
      "format_directive_en": "Give your answer in minutes. Type only the number.",
      "explanation_es": "…solución breve (método 1 y la comprobación)…",
      "explanation_en": "…short solution (method 1 and the check)…",
      "diagram": null
    }
  ]
}
```

`diagram` es `null` o `{ "file": "c1-p5.svg", "caption_es": "…", "caption_en": "…" }`.

## Reglas

- **Fidelidad:** `body_en` reproduce el enunciado del PDF sin cambiar datos. `body_es` es una
  traducción natural para estudiantes de 11 a 14 años (tuteo), que conserva nombres, lugares y
  moneda (L = lempiras). No agregar pistas.
- **Fórmulas:** LaTeX en línea entre `$…$` solo cuando ayuda (`$\frac{1}{2}$`, `$x^2$`). La moneda
  se escribe "L 124", nunca con `$`.
- **Puntos:** 1 por problema (el PDF califica sobre 7). `stars` = número de estrellas del PDF (1–3).
- **Categorías** (`problem_category`): algebra, number_theory, plane_geometry,
  counting_combinatorics, probability, ratios_proportions, percentages, rate_time_distance, money,
  statistics, sequences_patterns, logic, fractions_decimals, time_clocks, mixtures, sets_venn,
  custom_operators, geometry_3d, pythagoras.
- **Tipos de respuesta** (`answer_type`) y forma de `expected_answer`:
  - `integer`: un entero sin separadores, `"3439"`.
  - `pair_integer`: dos enteros en el orden que pide el problema, `"48,28"`.
  - `integer_list`: tres o más enteros en el orden que pide el problema, `"2,5,7"`.
  - `fraction_simplified`: `"3/8"` (acepta equivalentes).
  - `decimal_cents`: dinero con dos decimales, `"12.50"`.
  - `with_units`: número y unidad, `"36 cm²"` (se compara sin distinguir mayúsculas).
  - `symbolic_pi`: `"12π"`.
  - `multiple_choice`: una letra, `"B"`.
  - `text_options`: texto libre; todas las variantes aceptadas separadas por `|`, en minúsculas y
    sin tildes, en inglés y en español, `"wednesday|miercoles"`. Úsalo también para decimales
    que pueden escribirse de varias formas, `"2.5|2,5|5/2"`.
- **Directivas de formato:** dicen exactamente qué escribir en la casilla en línea (unidad, orden,
  separador). Para `pair_integer` e `integer_list`: "Escribe los números separados por comas, en
  este orden: …".
- **Explicación:** 2 a 5 pasos cortos del método 1 de la clave, más la comprobación. Sin
  "truco" ni "trampa típica".
- **Diagramas:** solo cuando la figura es necesaria para resolver o aclara mucho (geometría,
  sólidos, tablas). SVG propio, simple y limpio: `viewBox` de unos 360×240, trazos `#1F2937`,
  texto `font-family="Arial, sans-serif"` de 14 px, fondo transparente, `<title>` descriptivo, sin
  fuentes externas ni imágenes incrustadas. Las etiquetas de texto dentro del SVG van en inglés
  solo si son letras o números (A, B, 12 cm); si llevan palabras, evita el texto en el SVG y ponlo
  en el `caption`.
