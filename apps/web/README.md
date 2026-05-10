# @numoria/web

Aplicación web principal de Numoria Challenge — Next.js 15 + App Router + PWA.

---

## Stack

- **Framework:** Next.js 15 (App Router, Turbopack en dev)
- **React:** 19
- **Estilos:** Tailwind CSS 4 (CSS-first config) + tokens `@numoria/config`
- **i18n:** next-intl 3.x con locale prefix obligatorio (`/es`, `/en`)
- **UI:** componentes desde `@numoria/ui`
- **Testing E2E:** Playwright (Chromium desktop + Pixel 5 mobile)

---

## Detección de locale

Middleware ejecuta detección al inicio de cada request:

1. Si la URL ya tiene prefijo (`/es/...`, `/en/...`) → next-intl la procesa
2. Si no → `detectLocale()` con prioridad:
   1. Cookie `numoria_locale`
   2. Header `cf-ipcountry` (Cloudflare) o `x-vercel-ip-country` (Vercel)
   3. Header `Accept-Language`
   4. Default `es`
3. Redirige `/{locale}{path}`

Casos cubiertos por tests:
- Visitante de Honduras sin cookie → redirige a `/es`
- Visitante de USA sin cookie → redirige a `/en`
- Cookie explícita `en` con IP de Honduras → respeta cookie

---

## Scripts

```bash
pnpm dev                     # Dev server con Turbopack en :3000
pnpm build                   # Production build
pnpm start                   # Run production build
pnpm typecheck               # tsc --noEmit
pnpm lint                    # Biome lint
pnpm test:e2e                # Playwright tests (boots dev server)
pnpm test:e2e:ui             # Playwright UI mode (debugging)
pnpm playwright:install      # Bajar binario Chromium una vez
```

---

## Estructura de rutas

```
src/app/
├── [locale]/
│   ├── layout.tsx       # Root layout — fuentes, html lang, NextIntlProvider
│   ├── page.tsx         # Landing page (placeholder en chunk 1.5, completa en 1.8)
│   └── not-found.tsx    # 404 localizado
├── icon.svg             # Favicon
└── manifest.ts          # PWA manifest (chunk Fase 6)

src/i18n/
├── routing.ts           # Config compartida next-intl (locales, default)
├── navigation.ts        # Link, redirect, usePathname localizados
└── request.ts           # getRequestConfig (carga messages por locale)

src/middleware.ts        # Detección de locale + redirect inteligente
src/styles/globals.css   # Tailwind 4 + tokens Numoria
```

---

## Variables de entorno

Copia las plantillas de la raíz:

```bash
cp ../../.env.example .env.local
```

Para dev local en Fase 1, basta con dejar valores vacíos — la app no llama a Supabase ni IA todavía.
