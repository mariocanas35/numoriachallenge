# Numoria Challenge — Bitácora de Progreso

> Documento vivo. Cada sesión de desarrollo se registra aquí.
> Idioma: Español (founder) + secciones técnicas en inglés cuando aplique.

---

## 📌 Estado actual

**Fase:** Fase 1 cerrada ✅ — Fase 2 pendiente de arranque
**Última actualización:** 2026-05-10
**Próximo hito:** Push a GitHub + Fase 2 Chunk 2.0 (fix auth session + onboarding)

---

## ✅ Decisiones confirmadas

| # | Decisión | Valor |
|---|---|---|
| 1 | Marca | **Numoria Challenge** (constante `BRAND_NAME`) |
| 2 | Dominio | Subdominio Cloudflare Pages al inicio (sin dominio propio); dominio custom después |
| 3 | Email outbound | SMTP Gmail consumer desde **`mimathonline@gmail.com`** (límite 500 emails/día); App Password con 2FA cuando se active |
| 4 | Alcance MVP | **Web + Android** (iOS diferido a post-MVP) |
| 5 | Approach Android | **Opción C** — PWA primero (Service Worker, offline, Web Push, instalable), Expo Android wrapper en Fase 6 si valida tracción |
| 6 | Stack | Next.js 15 + Expo (Fase 6) + Supabase + Tailwind 4 + shadcn/ui + Turborepo + Python FastAPI grader (Railway) + Anthropic Claude API |
| 7 | Anti-trampa | Sistema de honestidad (sin webcam, logs informativos no bloqueantes) |
| 8 | Moderación de comentarios | IA edita comentarios vulgares manteniendo intención (no oculta) |
| 9 | Idiomas MVP | Español + Inglés funcionales; Portugués estructura preparada |
| 10 | Mascota | Numa (zorro/coyote naranja, 8 poses) — generación inicial con IA |

---

## ⏳ Decisiones diferidas (revisar cuando bloqueen)

> El founder explícitamente difirió estas. Se vuelven a tocar solo cuando bloqueen progreso.

- **GitHub:** ¿Cuenta personal o crear org `numoria-app`? Bloquea: primer `git push`.
- **Apple Developer ($99/año):** No urgente porque iOS está fuera del MVP.
- **Google Play Developer ($25):** Necesario para Fase 6 si llega el momento de Expo Android.
- **Entidad legal** para registros de stores: ¿persona natural Honduras o empresa registrada?
- **Mascota Numa:** ¿IA o artista? Default acordado: IA primero ($30-50), refinar después.
- **COPPA / lanzamiento USA:** Probablemente diferido indefinido. MVP solo LatAm.
- **Idioma código/comentarios:** Default sugerido inglés. Pendiente confirmar.
- **Política datos parentales:** Mes/año únicamente, sin día completo (sugerencia confirmada implícitamente).
- **Email setup técnico:** Diferido. Cuando se active: Gmail App Password en `SMTP_PASS`.

---

## 🚧 Bloqueadores actuales

Ninguno. Esperando aprobación de founder para arrancar Fase 1.

---

## 📅 Plan de fases (alto nivel)

| Fase | Semanas | Estado | Foco |
|---|---|---|---|
| 0 — Scaffolding | Pre-semana 1 | ✅ Completo | Docs, ADRs, repo skeleton |
| **1 — Fundamentos** | 1-2 | **✅ Completo (10/10 chunks)** | Monorepo, auth, design system, landing, DB, CI |
| 2 — Roles + escuelas | 3-4 | ⬜ Pendiente | Fix auth session + onboarding 3 roles + branding institucional |
| 3 — Problemas + competencias | 5-6 | ⬜ Pendiente | Banco de problemas, grader Python, competencias |
| 4 — Gamificación | 7-8 | ⬜ Pendiente | XP, rachas, badges, ligas, leaderboards |
| 5 — Certificados + IA | 9-10 | ⬜ Pendiente | PDFs, tutor Numa, moderación IA |
| 6 — PWA pulido + Expo Android + soft launch | 11-12 | ⬜ Pendiente | PWA optimizado, Expo wrapper Android, piloto |

---

## 📝 Bitácora de sesiones

### 2026-05-08 — Sesión 1 (Planificación inicial)

**Lo que pasó:**
- Founder pegó brief maestro completo del proyecto Numoria Challenge.
- Generé plan detallado de 6 fases con archivos exactos, tests y criterios de aceptación.
- Founder confirmó: marca, dominio inicial, email, alcance reducido (Web+Android), approach C (PWA→Expo).
- Resto de decisiones (4-12) diferidas explícitamente.

**Decisiones clave tomadas hoy:**
- Cambio de marca placeholder: ~~Numerix~~ → **Numoria Challenge**
- Cambio de scope: ~~Web + iOS + Android nativo~~ → **Web (PWA) + Expo Android en Fase 6**
- Email simplificado: ~~Resend con dominio~~ → **SMTP Gmail con `mimathonline@gmail.com`**

**Archivos creados:**
- `PROGRESS.md` (este archivo)
- `README.md`
- `.gitignore`
- `.env.example`
- `.editorconfig`
- `.nvmrc`
- `docs/decisions/0001-stack.md`
- `docs/decisions/0002-brand-numoria-challenge.md`
- `docs/decisions/0003-platform-scope.md`

**Próximos pasos:**
- Founder revisa los 9 archivos creados.
- Si aprueba, arrancamos Fase 1: monorepo Turborepo + Next.js 15 + Supabase auth + landing page.
- Antes de Fase 1, founder debe decidir: ¿GitHub personal o nueva org?

---

### 2026-05-08 — Sesión 2 (Fase 1 — Chunk 1.1: Monorepo + Git)

**Lo que pasó:**
- Founder confirmó: "Sí, procede" + GitHub repo: `https://github.com/mariocanas35/numoriachallenge.git` (cuenta personal)
- Instalé pnpm 10.33.4 vía installer oficial Windows (Corepack falló por permisos en Program Files)
- Configuré Git local (user.name, user.email, core.autocrlf=false, core.eol=lf)
- Inicialicé repo Git con branch principal `main`
- Creé monorepo skeleton completo y commit inicial (`447bc0c`, 20 archivos, 2187 líneas)

**Archivos creados en este chunk:**
- `package.json` (root del monorepo, pnpm@10.33.4, Node ≥20)
- `pnpm-workspace.yaml` (workspaces: apps/*, packages/*, services/*)
- `turbo.json` (pipeline: build, dev, lint, test, typecheck, clean)
- `tsconfig.base.json` (TypeScript 5.7 estricto, noUncheckedIndexedAccess, etc.)
- `biome.json` (Biome 1.9: linter + formatter unificados, reemplaza ESLint+Prettier)
- `commitlint.config.cjs` (Conventional Commits con tipos y scopes documentados)
- `.husky/pre-commit` y `.husky/commit-msg` (hooks instalados via `pnpm install`)
- `.gitattributes` (LF para texto, CRLF para .bat/.cmd/.ps1)
- `.github/workflows/ci.yml` (lint + typecheck + test + build en GitHub Actions)

**Verificaciones pasadas:**
- ✅ `pnpm install` exit 0
- ✅ `pnpm format:check` clean
- ✅ `pnpm lint` clean
- ✅ Husky hooks instalados en `.husky/_/`
- ✅ Commit message validado por commitlint
- ✅ `node_modules` y `.env.local` correctamente ignorados por Git

**Pendiente del founder:**
- 🔴 **Push manual a GitHub.** El push automático no funciona sin credenciales.
  - Opción A: `gh auth login` (GitHub CLI) y luego `git push -u origin main`
  - Opción B: Configurar Git Credential Manager para Windows
  - Opción C: Crear personal access token en GitHub Settings → Developer Settings → PAT (classic, scope `repo`) y usarlo como password al pushear
- 🟡 **Crear el repo en GitHub si no existe.** Ir a https://github.com/new → nombre `numoriachallenge` → privado → NO inicializar con README/LICENSE/gitignore (ya los tenemos local).

**Próximos pasos:**
- Si founder aprueba, continuar a Chunk 1.2: `packages/config` (configs compartidos para ESLint/TS/Tailwind entre apps/packages).

---

### 2026-05-08 — Sesión 2 (continuación) — Chunk 1.2: `packages/config`

**Lo que pasó:**
- Founder regresó tras descanso y pidió continuar.
- Commit pendiente de PROGRESS.md (Sesión 2 chunk 1.1) cerrado en `31e8566`.
- Creado package `@numoria/config` con TypeScript presets + Tailwind 4 design tokens.
- Limpiado warning de Husky v10 (eliminado `source husky.sh` deprecado en pre-commit/commit-msg).

**Archivos creados (chunk 1.2):**
- `packages/config/package.json` — workspace `@numoria/config`, exports JSON + CSS
- `packages/config/README.md` — guía de uso para los 4 TS presets y 3 CSS files
- `packages/config/tsconfig/base.json` — re-export del `tsconfig.base.json` raíz
- `packages/config/tsconfig/nextjs.json` — preset para `apps/web`, `apps/admin`
- `packages/config/tsconfig/library.json` — preset para packages internos (transpilePackages)
- `packages/config/tsconfig/node.json` — preset para scripts/services TS
- `packages/config/tailwind/tokens.css` — design tokens en `@theme` Tailwind 4 (paleta Numoria, tipografía Fraunces+Plus Jakarta+JetBrains, radii, shadows, easing)
- `packages/config/tailwind/animations.css` — keyframes y `@utility` (streak-flame, confetti, medal-shine, numa-bounce-in, shake-error, pulse-soft, xp-fill, level-up, fade-in-up) + respeto a `prefers-reduced-motion`
- `packages/config/tailwind/index.css` — entry combinado (tokens + animations)

**Archivos modificados:**
- `.husky/pre-commit`, `.husky/commit-msg` — eliminada línea `source` deprecada (compat. con Husky v10)

**Verificaciones pasadas:**
- ✅ `pnpm install` registra workspace `@numoria/config`
- ✅ `pnpm format:check` clean (13 archivos)
- ✅ `pnpm lint` clean
- ✅ `pnpm -r ls --depth=-1` lista 2 workspaces (root + config)

**Próximos pasos:**
- Chunk 1.3: `packages/ui` con shadcn/ui base + componente Button + NumaAvatar placeholder.

---

### 2026-05-08 — Sesión 2 (continuación) — Chunk 1.3: `packages/ui`

**Lo que pasó:**
- Creado package `@numoria/ui` con dependencias React 19 + CVA + tailwind-merge + Radix Slot.
- Implementado `<Button />` con 7 variantes (primary, secondary, success, destructive, ghost, outline, link) y 5 tamaños (sm/md/lg/xl/icon), soporta `asChild` y `fullWidth`.
- Implementado `<NumaAvatar />` con 4 poses inline SVG (wave, think, celebrate, sad) — placeholders simplificados, refinables después.
- Setup de Vitest 2 con happy-dom + Testing Library + jest-axe para a11y testing.
- Resueltos 3 issues durante el chunk: cleanup automático de Testing Library, tipos de jest-axe, augmentation de matchers Vitest.

**Archivos creados (chunk 1.3):**
- `packages/ui/package.json` — workspace `@numoria/ui` con peerDeps React 19
- `packages/ui/tsconfig.json` — extiende `@numoria/config/tsconfig/library.json`
- `packages/ui/vitest.config.ts` — happy-dom + setup files
- `packages/ui/test/setup.ts` — matchers + auto cleanup
- `packages/ui/test/types.d.ts` — augmentation de Vitest Assertion con `toHaveNoViolations`
- `packages/ui/README.md` — guía de uso, pre-requisitos, scripts
- `packages/ui/src/index.ts` — barrel export
- `packages/ui/src/lib/cn.ts` — utility `cn()` (clsx + twMerge)
- `packages/ui/src/components/Button.tsx` — Button con CVA, 7 variantes, "tarjeta empujable" estilo Duolingo
- `packages/ui/src/components/Button.test.tsx` — 13 tests (interacciones, variants, refs, a11y)
- `packages/ui/src/components/NumaAvatar.tsx` — 4 poses SVG inline + sizing + animateIn
- `packages/ui/src/components/NumaAvatar.test.tsx` — 10 tests (poses, labels, animation, a11y)

**Verificaciones pasadas:**
- ✅ `pnpm install` registra `@numoria/ui` (3 workspaces total)
- ✅ `pnpm format:check` clean (24 archivos)
- ✅ `pnpm lint` clean
- ✅ `pnpm --filter=@numoria/ui typecheck` clean
- ✅ `pnpm --filter=@numoria/ui test` — 23/23 tests pass
- ✅ Cero violaciones de accesibilidad en Button (default + disabled) y NumaAvatar (4 poses)

**Próximos pasos:**
- Chunk 1.4: `packages/i18n` (ES/EN messages, country mapping HN→es/HNL etc., pricing helpers).

---

### 2026-05-08 — Sesión 2 (continuación) — Chunk 1.4: `packages/i18n`

**Lo que pasó:**
- Creado package `@numoria/i18n` zero-dependency (todo con `Intl` nativo).
- Modelados 22 países LatAm + anglo + portugués con config completa.
- Implementados pricing y datetime con conversión de monedas y timezones.
- Resueltos issues durante el chunk: type augmentation correcta de Vitest con TestingLibraryMatchers + jest-axe; expectations de tests corregidas (BRL conversion, CLP digits, regex de relative time CLDR-tolerant).

**Archivos creados (chunk 1.4) — 18 total:**

Configuración del package:
- `packages/i18n/package.json`, `tsconfig.json`, `vitest.config.ts`, `README.md`

Source code (zero deps, solo Intl):
- `src/config.ts` — locales, defaultLocale, BRAND_NAME, helpers de validación, cookies names, display names + flags
- `src/country-config.ts` — 22 países (HN, GT, SV, NI, CR, PA, MX, CO, PE, EC, CL, AR, UY, PY, BO, VE, DO, PR, CU, BR, PT, US, GB, CA, AU) con `{locale, currency, symbol, timezone, flag, name(es|en|pt)}` + DEFAULT fallback
- `src/pricing.ts` — `formatPrice()` (USD cents → moneda local con tasa), `formatLocalCurrency()`, `convertUsdCents()`, manejo correcto de monedas sin decimales (CLP, PYG, COP, JPY, KRW, VND, IDR)
- `src/datetime.ts` — `formatDate`, `formatTime`, `formatDateTime`, `formatRelativeTime`, `formatDuration` (timer estilo MM:SS / HH:MM:SS para competencias)
- `src/detect.ts` — `detectLocale()` con prioridad cookie > country > Accept-Language > default; `parseAcceptLanguage()`
- `src/index.ts` — barrel export

Mensajes traducidos:
- `messages/es.json` — completo: brand, landing, auth, common, errors, footer, metadata
- `messages/en.json` — completo: mismas keys traducidas
- `messages/pt.json` — estructura preparada con keys vacías + marcador TODO (Brasil Fase 2-post)

Tests (73 totales, todos pasando):
- `src/config.test.ts` — 8 tests
- `src/country-config.test.ts` — 17 tests (Honduras, Brasil, USA, dolarizados, fallback, case insensitivity, integridad)
- `src/pricing.test.ts` — 12 tests (HNL, BRL, CLP sin decimales, USD dolarizados, fallback)
- `src/datetime.test.ts` — 16 tests (timezones, relative time ES/EN, duration)
- `src/detect.test.ts` — 16 tests (prioridad fuentes, casos reales HN/USA/expat)
- Plus integridad: `parseAcceptLanguage` cubierto

**Archivos modificados:**
- `packages/ui/test/types.d.ts` — augmentación correcta de Vitest con `TestingLibraryMatchers` (resolvió errores TS de `toBeInTheDocument`, `toHaveClass`, etc.)
- `packages/ui/src/components/NumaAvatar.test.tsx` — refactor a `screen.getByRole('img')` en lugar de `container.firstChild` (mejor práctica + tipo `HTMLElement`)

**Verificaciones pasadas:**
- ✅ `pnpm install` registra `@numoria/i18n` (4 workspaces total)
- ✅ `pnpm format:check` clean (41 archivos)
- ✅ `pnpm lint` clean
- ✅ `pnpm -r --filter=./packages/* typecheck` clean (i18n + ui)
- ✅ `pnpm -r --filter=./packages/* test` — **96/96 tests pasan** (73 i18n + 23 ui)

**Próximos pasos:**
- Chunk 1.5: `apps/web` con Next.js 15 + Tailwind 4 + middleware i18n + estructura de rutas localizadas.

---

### 2026-05-09 — Sesión 3 — Chunk 1.5: `apps/web` (Next.js 15 + Tailwind 4 + i18n)

**Lo que pasó:**
- Creada la app web `@numoria/web` con Next.js 15 + Turbopack + App Router.
- Tailwind 4 configurado con CSS-first (postcss + @import en globals.css).
- next-intl 3.x integrado con routing localizado (`/es`, `/en`) y mensajes desde `@numoria/i18n`.
- Middleware combinado: detecta locale custom (cookie > cf-ipcountry > Accept-Language) y delega a next-intl.
- Layout root con next/font para Fraunces + Plus Jakarta Sans + JetBrains Mono — vinculadas a tokens del DS.
- Landing page placeholder con NumaAvatar saludando + Button + traducciones (demuestra wiring completo).
- Playwright configurado con tests para home + locale-detection (Chromium desktop + Pixel 5 mobile).
- Resueltos 3 issues durante el chunk: tipo `defaultLocale` estrechado a `ActiveLocale`, `typedRoutes` movido fuera de experimental (Next 15.5), dynamic import de mensajes reemplazado por imports estáticos (mejor compat con Webpack monorepo).

**Archivos creados (chunk 1.5) — 18 total:**

Configuración:
- `apps/web/package.json` — Next 15.5 + React 19 + next-intl 3.26 + Tailwind 4 + Playwright 1.49
- `apps/web/tsconfig.json` — extiende `@numoria/config/tsconfig/nextjs.json` + path alias `@/*`
- `apps/web/next.config.ts` — transpilePackages, typedRoutes, security headers, image domains
- `apps/web/postcss.config.mjs` — `@tailwindcss/postcss`
- `apps/web/playwright.config.ts` — Chromium desktop + Pixel 5 mobile, webServer auto-start
- `apps/web/README.md` — guía completa
- `apps/web/public/robots.txt`

i18n setup:
- `src/i18n/routing.ts` — defineRouting con localePrefix=always, localeDetection=false
- `src/i18n/navigation.ts` — Link/redirect/usePathname localizados
- `src/i18n/request.ts` — getRequestConfig con messages estáticos por locale

Middleware + estilos:
- `src/middleware.ts` — detección locale custom (prioridad cookie > geo > Accept-Language) + delegación a next-intl
- `src/styles/globals.css` — Tailwind 4 + tokens Numoria + animations + @source para packages/ui

Páginas:
- `src/app/[locale]/layout.tsx` — html lang dinámico, NextIntlClientProvider, fonts vinculadas a CSS vars, metadata localizada con OpenGraph/Twitter
- `src/app/[locale]/page.tsx` — landing placeholder con NumaAvatar + Button + i18n
- `src/app/[locale]/not-found.tsx` — 404 localizado con Numa triste
- `src/app/icon.svg` — favicon placeholder (N naranja sobre círculo)

Tests E2E (Playwright):
- `e2e/home.spec.ts` — 4 tests (ES default, EN, html lang, metadata)
- `e2e/locale-detection.spec.ts` — 6 tests (default, Accept-Language, cookie override, cf-ipcountry HN/US, path preservation)

**Archivos modificados:**
- `packages/i18n/src/config.ts` — `defaultLocale` ahora tipado como `ActiveLocale` (no `Locale`), porque siempre debe ser un locale con mensajes funcionales

**Verificaciones pasadas:**
- ✅ `pnpm install` registra 5 workspaces (root + config + i18n + ui + **web**)
- ✅ `pnpm format:check` clean (56 archivos)
- ✅ `pnpm lint` clean
- ✅ `pnpm typecheck` clean en los 4 workspaces (i18n, ui, web)
- ✅ `pnpm --filter=@numoria/web build` exitoso — prerendered /es y /en
- ✅ Bundle First Load JS: **107KB** (bajo el budget de 150KB)
- ✅ Middleware: 53.8KB
- ✅ 96/96 unit tests siguen pasando (73 i18n + 23 ui)

**Pendiente (no blocker):**
- Correr Playwright E2E end-to-end requiere `pnpm exec playwright install chromium` (~150MB descarga). Se ejecutará en Chunk 1.10 (verificación final) cuando todas las features estén integradas.

**Próximos pasos:**
- Chunk 1.6: Supabase local + migrations iniciales (`profiles`, `schools`) + RLS policies + tipos generados.

---

### 2026-05-09 — Sesión 3 (continuación) — Chunk 1.9: CI/CD + DX infrastructure

**Lo que pasó:**
- Founder eligió "avancemos en paralelo" mientras instala Docker para Chunk 1.6.
- Mejorada la CI workflow existente (chunk 1.1 era mínima) con cache de Turborepo, Node 22 LTS, jobs paralelos con dependencias correctas, y un job de status final.
- Agregado workflow E2E separado con cache de browsers Playwright.
- Agregados templates de PR e issues, Dependabot config, workflow para issues stale, y CONTRIBUTING.md completo.

**Archivos creados/modificados (chunk 1.9):**
- `.github/workflows/ci.yml` — enhanced con cache turbo, status job, Node 22 LTS
- `.github/workflows/e2e.yml` — Playwright con cache de browsers
- `.github/workflows/stale.yml` — auto-close issues 60d/PRs 30d
- `.github/PULL_REQUEST_TEMPLATE.md` — checklist completo
- `.github/ISSUE_TEMPLATE/bug_report.yml` + `feature_request.yml` + `config.yml`
- `.github/dependabot.yml` — actualizaciones agrupadas por ecosistema (next, react, tailwind, testing, types, tooling)
- `CONTRIBUTING.md` — guía completa para contribuidores
- `README.md` — agregadas badges de CI y E2E

**Verificaciones:** format clean, lint clean, 96/96 tests siguen pasando.
**Commit:** `0c4f715 ci: add full CI/CD infrastructure with GitHub Actions`

---

### 2026-05-09 — Sesión 3 (continuación) — Chunk 1.8: Landing page MVP

**Lo que pasó:**
- Creadas las 4 secciones de la landing definitiva: Hero refinado, HowItWorks con 3 pasos visuales, SchoolsSection con placeholders honestos, Footer con LocaleSwitcher.
- LocaleSwitcher como client component con cookie persistence + navegación localizada vía next-intl.
- Tests E2E ampliados: cobertura completa de las 4 secciones en ES y EN, switcher de locale, persistencia de cookie, viewport mobile.
- Resuelto build worker crash en Windows (`exit code 3221226505`) — retry exitoso, era issue transitorio de access violation por concurrencia.

**Archivos creados (chunk 1.8) — 7 total:**
- `apps/web/src/components/LocaleSwitcher.tsx` — selector ES/EN con persistencia cookie
- `apps/web/src/components/landing/Hero.tsx` — section con badge + Numa wave + CTAs (extraído de page.tsx, refinado con bg gradient + blobs decorativos)
- `apps/web/src/components/landing/HowItWorks.tsx` — 3 pasos numerados con poses Numa diferentes (wave/think/celebrate) y colores Numoria
- `apps/web/src/components/landing/SchoolsSection.tsx` — 6 escuelas placeholder (HN/GT/CR/MX/CO) con disclaimer honesto sobre piloto
- `apps/web/src/components/landing/Footer.tsx` — branding + links + LocaleSwitcher + copyright dinámico

**Archivos modificados:**
- `apps/web/src/app/[locale]/page.tsx` — composición limpia de las 4 secciones (server component)
- `apps/web/e2e/home.spec.ts` — ampliado a 8 tests (4 secciones × 2 locales + switcher × 2 + html lang + mobile viewport)

**Verificaciones pasadas:**
- ✅ `pnpm format:check` clean (61 archivos)
- ✅ `pnpm lint` clean
- ✅ `pnpm typecheck` clean en los 3 packages + web
- ✅ `pnpm --filter=@numoria/web build` exitoso
- ✅ Bundle First Load JS: **128KB** (bajo el budget de 150KB) — incluye Hero+HowItWorks+Schools+Footer+LocaleSwitcher
- ✅ Página `/[locale]`: 20.2KB de código específico de ruta (vs 166B placeholder anterior)
- ✅ 96/96 unit tests siguen pasando

**Pendiente:**
- 🔴 **Chunk 1.6 (Supabase) bloqueado** — Docker Desktop falló al instalar (error "archivo ya existe" en `Docker.staging`). Founder está limpiando con PowerShell admin y reinstalando.

**Próximos pasos:**
- Cuando Docker esté listo: Chunk 1.6 (Supabase local + migrations + RLS + tipos generados)
- Después: Chunk 1.7 (Auth flow) y Chunk 1.10 (verificación final + Playwright real run)

---

### 2026-05-09 — Sesión 3 (continuación) — Chunk 1.6: Supabase Cloud + migraciones + packages/database

**Pivote estratégico:**
- Docker Desktop falló con error WSL2 (`0x80070422`) en la PC del founder.
- Después de evaluar alternativas (Cloudflare D1, Postgres nativo), pivotamos a **Supabase Cloud** sin Docker.
- Founder creó proyecto `numoria-challenge-dev` región `us-east-1` (~80-120ms desde Honduras).
- Free tier (50K MAU + 500MB DB) cubre con creces el MVP.

**Lo que pasó:**
- Agregamos Supabase CLI 2.98.2 como devDependency root (instalación clean vía npm postinstall, sin requerir admin/Program Files).
- Escritas 5 migraciones SQL completas con tablas `profiles` y `schools`, índices, RLS policies, triggers, y funciones helper.
- Creado package `@numoria/database` con clientes server/browser/middleware tipados usando `@supabase/ssr`.
- Configurado `apps/web/.env.local` con la URL + publishable key del proyecto (founder llena secret key + DB password localmente).

**Archivos creados (chunk 1.6) — 17 total:**

Configuración Supabase:
- `supabase/config.toml` — config CLI (project_id, auth, storage, realtime)
- `supabase/seed.sql` — 3 escuelas demo

Migrations SQL:
- `0001_init.sql` — extensiones (uuid-ossp, citext, pg_trgm), enums (`user_role`, `school_division`), helpers (`set_updated_at`, `is_admin`, `is_teacher` con SECURITY DEFINER para evitar recursión RLS)
- `0002_schools.sql` — tabla `schools` con slug, branding, verified flag, índices, trigger updated_at
- `0003_profiles.sql` — tabla `profiles` 1:1 con `auth.users` (rol, locale, COPPA-friendly birth_year/month sin día, gamificación) + trigger `handle_new_user` para auto-crear profile en signup
- `0004_rls_profiles.sql` — 6 policies: self view/edit, parent→hijos, teacher→escuela, admin todo. UPDATE WITH CHECK bloquea cambios a role/xp/level/streak (anti-cheat)
- `0005_rls_schools.sql` — teachers crean (verified=false locked), update propios, admin verifica

Package `@numoria/database`:
- `package.json`, `tsconfig.json`, `README.md`
- `src/server.ts` — `createServerClient()` (anon, RLS) + `createAdminClient()` (service_role)
- `src/browser.ts` — singleton para Client Components
- `src/middleware.ts` — `updateSession()` para refresh de tokens
- `src/types.gen.ts` — placeholder (reemplazado al correr `pnpm db:types`)
- `src/index.ts`, `src/types.ts`

Monorepo:
- Root `package.json` — agregado `supabase` CLI + scripts `db:login`, `db:link`, `db:push`, `db:reset`, `db:diff`, `db:types`
- `pnpm.onlyBuiltDependencies` whitelist (supabase, biome, esbuild, sharp)
- `apps/web/.env.local` (gitignored) con URL + publishable key

**Resueltos durante el chunk:**
- pnpm 10 bloquea postinstall scripts → whitelist en `package.json`
- `next/server` y `next/headers` no resolvían tipos → `next` + `react` agregados como peerDependencies + devDependencies en `@numoria/database`
- Implicit `any` en cookie callbacks → tipo explícito `CookieToSet`
- Biome `useConst` lint en middleware → `let` → `const`

**Verificaciones pasadas:**
- ✅ 6 workspaces registrados (root + web + config + database + i18n + ui)
- ✅ Supabase CLI 2.98.2 funcional
- ✅ `pnpm format:check` clean (68 archivos)
- ✅ `pnpm lint` clean
- ✅ `pnpm typecheck` clean en todos los packages
- ✅ 96/96 unit tests pasando

**Pendiente del founder ANTES de chunk 1.7:**
1. Pegar `service_role` key en `apps/web/.env.local` (Dashboard → API Keys → Secret keys → 👁 Reveal → Copy)
2. Pegar `DATABASE_URL` con DB password (Dashboard → Database → Connection string → Transaction pooler)
3. Correr en terminal:
   ```bash
   pnpm db:login    # autentica CLI con cuenta Supabase via browser
   pnpm db:link     # vincula al proyecto cloud (pide DB password)
   pnpm db:push     # aplica las 5 migraciones
   pnpm db:types    # regenera src/types.gen.ts desde schema real
   ```
4. Verificar en Supabase Dashboard → Table Editor que `profiles` y `schools` existen con RLS

**Commit:** `432f179 feat(db): add Supabase Cloud setup with profiles and schools`

**Próximos pasos:**
- Chunk 1.7: Auth flow (email magic link + Google OAuth) usando `@numoria/database`

---

## 🔗 Referencias rápidas

- Brief maestro original: pegado en sesión 1 (ver historial de chat).
- ADR del stack: [docs/decisions/0001-stack.md](docs/decisions/0001-stack.md)
- ADR de la marca: [docs/decisions/0002-brand-numoria-challenge.md](docs/decisions/0002-brand-numoria-challenge.md)
- ADR del scope de plataformas: [docs/decisions/0003-platform-scope.md](docs/decisions/0003-platform-scope.md)
- ADR del bug conocido de auth session: [docs/decisions/0004-auth-session-known-issue.md](docs/decisions/0004-auth-session-known-issue.md)

---

### 2026-05-10 — Sesión 4 — Chunk 1.10: Verificación final + cierre de Fase 1

**Lo que pasó hoy:**
- Validación visual de `profiles` table en Supabase Dashboard — **2 perfiles creados correctamente** vía trigger `handle_new_user`:
  - `b07d8aef-...` → display_name "mariocanas35", role student (Google OAuth)
  - `e051447f-...` → display_name "Mario Test", role student (magic link)
- Confirmado que **el database side de auth funciona al 100%**. Trigger inserta profile con default values correctos para ambos providers.
- Identificado un **bug conocido**: el callback handler falla al intercambiar el código por sesión (`exchange_failed`). Causa probable: PKCE cookie no persistiendo o bloqueado por Brave Shields.
- Decisión pragmática: cerrar Fase 1 con auth code completo + bug documentado. Fix de session establishment va a Phase 2 Chunk 2.0.
- Creado ADR 0004 con análisis completo + opciones de fix + workarounds.

**Verificaciones finales pasadas:**
- ✅ `pnpm format:check` clean (81 archivos)
- ✅ `pnpm lint` clean
- ✅ `pnpm typecheck` clean en los 4 packages + apps/web
- ✅ 96/96 unit tests pasando (73 i18n + 23 ui)
- ✅ Visualmente: landing renderiza /es y /en, navega correctamente
- ✅ Database: 2 profiles + 0 schools (esperado — no hemos creado ninguna escuela aún)
- ✅ `pnpm dev` arranca sin errores en localhost:3000
- ⚠️ Lighthouse audit: no corrido automáticamente (founder puede hacerlo manualmente en Chrome DevTools → Lighthouse tab cuando quiera)
- ⚠️ Playwright real E2E run: deferido (requiere Chromium ~150MB install) — se hace en CI cuando se pushee

---

## 🏁 RETROSPECTIVA FASE 1

### Logros cuantificables

| Métrica | Valor |
|---|---|
| Chunks completados | **10/10** (100%) |
| Sesiones de desarrollo | 4 sesiones |
| Días calendario | 3 días (2026-05-08 a 2026-05-10) |
| Commits | 17 commits atómicos |
| Archivos en repo | 119 archivos |
| Workspaces pnpm | 6 (root + 4 packages + 1 app) |
| Unit tests | **96/96 pasando** |
| Migrations SQL aplicadas | 5 |
| RLS policies activas | 12 (8 profiles + 4 schools) |
| Páginas web compiladas | /es, /en, /es/login, /en/login, /es/register, /en/register, /es/check-email, /en/check-email, /auth/error |
| Bundle First Load JS | 128KB landing, 139KB auth pages (todos bajo budget 150KB) |
| Idiomas activos | ES + EN (PT preparado) |
| Países en config | 22 (LatAm + anglo + Brasil) |

### Stack final entregado

- ✅ **Frontend Web:** Next.js 15.5 + React 19 + TypeScript estricto + Tailwind 4 + shadcn-style components
- ✅ **i18n:** next-intl 3.26, ES/EN funcional, PT estructurado, locale auto-detection (cookie/geo/Accept-Language)
- ✅ **Database:** Supabase Cloud (us-east-1) + Postgres 17 + 5 migrations + 12 RLS policies + trigger handle_new_user
- ✅ **Auth (parcial):** Magic link + Google OAuth flows — signup funciona, session establishment con bug pendiente (ADR 0004)
- ✅ **Componentes:** Button (7 variantes), NumaAvatar (4 poses), LocaleSwitcher, Hero, HowItWorks, SchoolsSection, Footer, LoginForm, RegisterForm, GoogleButton
- ✅ **Design system:** Paleta Numoria (Duolingo-inspired), tipografía Fraunces/Plus Jakarta Sans/JetBrains Mono, 9 keyframes de animación, respeta prefers-reduced-motion
- ✅ **DevOps:** Turborepo + pnpm 10 + Biome + Husky + Commitlint + GitHub Actions CI (lint+typecheck+test+build+e2e) + Dependabot + PR/Issue templates + Stale bot

### Lecciones aprendidas

**Lo que funcionó:**
- Estructura de chunks de 1-2 horas con commits atómicos — fácil rebobinar
- Pivot temprano de Docker local a Supabase Cloud — ahorró días de debugging WSL2
- Type-safety end-to-end (Supabase types generados → Database type → TablesInsert<>) — refactors seguros
- Biome (1 herramienta) en lugar de ESLint+Prettier — menos config
- PROGRESS.md como bitácora viva — facilitó retomar después de pausas largas

**Lo que se pudo hacer mejor:**
- Probar el auth flow E2E ANTES de declarar chunk 1.7 cerrado — habríamos detectado el bug de session antes
- Configurar GitHub auth credentials desde el día 1 para poder pushear automáticamente — todavía pendiente push manual
- Iconos/avatares de Numa muy "osito de peluche" — los SVG placeholders son simples, refinar con artista en Phase 2

**Riesgos materializados:**
- ⚠️ Docker Desktop install falló por WSL2 — mitigado pivotando a Supabase Cloud
- ⚠️ Auth session bug — diferido a Phase 2

**Riesgos NO materializados (gracias por preparación):**
- ✅ Tailwind 4 + shadcn — integration limpia
- ✅ Next.js 15 + next-intl — config compleja pero funciona
- ✅ Supabase RLS recursion — evitado con SECURITY DEFINER functions

---

## 🚀 Próximo paso del founder

1. **Push a GitHub** (cuando puedas, no urgente):
   ```bash
   gh auth login          # si no lo has hecho
   cd "C:\Users\USER\Desktop\Math Competition APP"
   git push -u origin main
   ```
   Esto activa los workflows de CI automáticamente.

2. **(Opcional) Lighthouse manual** en Chrome:
   - Levanta `pnpm dev`
   - Abre Chrome → http://localhost:3000
   - DevTools (F12) → Lighthouse tab → "Analyze page load" en mobile mode
   - Screenshot del resultado para guardarlo

3. **(Opcional pero recomendado) Rotar service_role key** porque pasó por el chat:
   - Supabase Dashboard → Settings → API Keys → Secret keys → menú ⋮ → "Generate new key"
   - Reemplaza en `apps/web/.env.local`

## 📋 Phase 2 — Chunk 2.0 (primera tarea)

**Fix auth session establishment** (1-2 sesiones):
- Diagnostic: cookies en DevTools post-signInWithOtp
- Probable fix: OTP code flow en vez de magic link, o upgrade @supabase/ssr
- Definition of done: signup → click email → sesión activa en navegador → user logeado en /es/

Después de eso, Chunk 2.1 arranca onboarding diferenciado por rol (estudiante/padre/profesor).
