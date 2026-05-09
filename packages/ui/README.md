# @numoria/ui

Componentes UI compartidos para web y mobile del proyecto Numoria Challenge.

> Consumidos vía `transpilePackages` por las apps Next.js. Sin build step propio en MVP.

---

## Componentes incluidos

| Componente | Variantes | Estado |
|---|---|---|
| `<Button />` | primary, secondary, ghost, destructive, success, outline | ✅ |
| `<NumaAvatar />` | wave, think, celebrate, sad — sm/md/lg/xl/2xl | ✅ (placeholders SVG) |

> Los SVGs de Numa son placeholders inline. Se refinarán con IA o artista después del piloto.

---

## Uso

```tsx
import { Button, NumaAvatar } from '@numoria/ui';

export function Hero() {
  return (
    <div className="flex items-center gap-6">
      <NumaAvatar pose="wave" size="xl" />
      <Button variant="primary" size="lg">
        Empieza gratis
      </Button>
    </div>
  );
}
```

### Pre-requisitos en el consumidor

1. Tailwind 4 instalado
2. Importar tokens Numoria en `globals.css`:
   ```css
   @import "tailwindcss";
   @import "@numoria/config/tailwind/index.css";
   ```
3. En `next.config.ts` agregar `transpilePackages: ['@numoria/ui']`

---

## Scripts

```bash
pnpm test            # Vitest unit tests + a11y (jest-axe)
pnpm test:watch      # Modo watch
pnpm lint            # Biome
pnpm typecheck       # tsc --noEmit
```

---

## Testing

- **Test runner:** Vitest 2.x con `happy-dom`
- **Renderer:** `@testing-library/react`
- **A11y:** `jest-axe` — cada componente debe pasar `toHaveNoViolations()`
- **User events:** `@testing-library/user-event` para interacciones realistas

Tests viven junto al componente como `*.test.tsx`.
