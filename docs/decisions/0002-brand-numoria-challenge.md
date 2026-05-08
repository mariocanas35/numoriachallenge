# ADR 0002 — Marca: Numoria Challenge

- **Estado:** Aceptado
- **Fecha:** 2026-05-08
- **Decididores:** Mario Cañas (founder)

---

## Contexto

Necesitamos un nombre de marca para la plataforma de olimpiadas matemáticas. Requisitos:

- Funcional en español, inglés y portugués sin traducción
- Disponible como dominio cuando se compre (futuro)
- Memorable para el público objetivo (estudiantes 8-14 + padres + escuelas)
- Sin conflicto obvio de trademark
- Capaz de soportar identidad visual coherente (mascota Numa, paleta Duolingo-inspired)

## Decisión

**Nombre oficial: Numoria Challenge**

- **Numoria:** sugiere "número" + sufijo evocador de espacio/territorio (memoria, victoria, gloria)
- **Challenge:** comunica directamente el componente competitivo
- **Aliasing técnico:**
  - Constante de código: `BRAND_NAME = "Numoria Challenge"`
  - Slug URL preferente: `numoria-challenge` (cuando se compre dominio)
  - Slug corto interno: `numoria` (para nombres de package, ej. `@numoria/ui`)
  - Mascota: **Numa** (zorro/coyote naranja)

## Rechazadas

| Alternativa | Razón de rechazo |
|---|---|
| Numerix | Founder eligió Numoria Challenge directamente |
| MathArena | No evaluada por founder |
| Olimpix | No evaluada por founder |
| Pi Quest | No evaluada por founder |

## Pendientes técnicos derivados

- [ ] Verificar disponibilidad de dominio cuando founder lo solicite (`.com`, `.app`, `.education`, `.io`)
- [ ] Verificar trademark en USPTO (TESS) y EUIPO antes de marketing serio
- [ ] Verificar que `mimathonline@gmail.com` (correo actual) tenga buena entregabilidad
- [ ] Diseñar logo final (mark + wordmark) — placeholder SVG genera Claude/founder en Fase 1
- [ ] Generar 8 poses iniciales de Numa (mascota)

## Consecuencias

### Positivas
- "Challenge" comunica producto sin ambigüedad
- "Numoria" es lo suficientemente único para destacar en búsquedas
- Funciona fonéticamente en ES/EN/PT sin alteraciones

### Riesgos
- Si trademark falla en algún mercado, requerirá rebranding
- Dominio `.com` puede no estar disponible — preparar alternativas (`.app`, `numoria.io`, `numoria-challenge.com`)

## Implementación

Toda referencia textual al nombre del producto debe usar:

- **Frontend (UI):** literal `"Numoria Challenge"`
- **Código (constantes):** `BRAND_NAME` exportado desde `packages/i18n/src/config.ts`
- **Email (from):** `"Numoria Challenge"` como display name
- **Asset filenames:** `numoria-*.svg`, `numa-*.svg` para mascota
- **Package names internos:** prefijo `@numoria/` (ej. `@numoria/ui`)

Cualquier rebranding futuro debe ser un cambio de variable global + búsqueda y reemplazo controlado, sin strings duplicados regados por el código.
