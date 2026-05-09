# @numoria/config

Configuración compartida para todo el monorepo de Numoria Challenge.

> Solo archivos estáticos (JSON + CSS). No exporta código JavaScript ejecutable.

---

## TypeScript

Cuatro presets, cada uno extiende `base`:

| Preset | Cuándo usar |
|---|---|
| `tsconfig/base.json` | Re-export de `tsconfig.base.json` raíz. Base común. |
| `tsconfig/nextjs.json` | Apps Next.js (`apps/web`, `apps/admin`). |
| `tsconfig/library.json` | Packages internos consumidos via `transpilePackages` (`packages/ui`, etc.). |
| `tsconfig/node.json` | Scripts Node, microservicios TS, edge functions. |

### Uso

```jsonc
// apps/web/tsconfig.json
{
  "extends": "@numoria/config/tsconfig/nextjs.json",
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", ".next"]
}
```

```jsonc
// packages/ui/tsconfig.json
{
  "extends": "@numoria/config/tsconfig/library.json",
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
```

---

## Tailwind CSS 4

### Tokens del design system

`tailwind/tokens.css` define todos los design tokens de Numoria como custom properties dentro de un bloque `@theme`. Esto los hace disponibles automáticamente como utilidades de Tailwind (`bg-numoria-blue`, `text-numoria-orange`, `font-display`, etc.).

### Animaciones

`tailwind/animations.css` define keyframes y `@utility` rules para animaciones de marca:

- `animate-streak-flame` — llama de racha pulsando
- `animate-confetti` — confeti cayendo (correctas)
- `animate-medal-shine` — brillo dorado medallas
- `animate-numa-bounce-in` — Numa entra rebotando
- `animate-shake-error` — shake en error
- `animate-pulse-soft` — pulse sutil
- `animate-xp-fill` — barra XP llenándose

### Import combinado

`tailwind/index.css` importa tokens + animations en uno:

```css
/* apps/web/src/styles/globals.css */
@import "tailwindcss";
@import "@numoria/config/tailwind/index.css";

/* tu CSS específico de la app aquí */
```

---

## Mantenimiento

- **Cambios de paleta:** editar `tailwind/tokens.css`. Toda la app cambia automáticamente.
- **Nueva animación:** agregar `@keyframes` y `@utility` en `tailwind/animations.css`.
- **Nuevo TS preset:** crear archivo en `tsconfig/`, agregar al `exports` de `package.json`.

---

## ⚠️ No incluido

- **Biome config** — vive en `biome.json` raíz; cubre todo el monorepo desde un solo lugar.
- **ESLint** — no se usa (Biome lo reemplaza completamente).
- **Prettier** — tampoco (Biome maneja formato).
