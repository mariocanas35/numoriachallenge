# Numoria Challenge — Bitácora de Progreso

> Documento vivo. Cada sesión de desarrollo se registra aquí.
> Idioma: Español (founder) + secciones técnicas en inglés cuando aplique.

---

## 📌 Estado actual

**Fase:** Pre-Fase 1 — Scaffolding inicial y revisión del plan
**Última actualización:** 2026-05-08
**Próximo hito:** Aprobación del founder para arrancar Fase 1 (Fundamentos)

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
| 0 — Scaffolding | Pre-semana 1 | 🟡 En curso | Docs, ADRs, repo skeleton |
| 1 — Fundamentos | 1-2 | ⬜ Pendiente | Monorepo, auth, design system, landing |
| 2 — Roles + escuelas | 3-4 | ⬜ Pendiente | Onboarding 3 roles, branding institucional |
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

## 🔗 Referencias rápidas

- Brief maestro original: pegado en sesión 1 (ver historial de chat).
- ADR del stack: [docs/decisions/0001-stack.md](docs/decisions/0001-stack.md)
- ADR de la marca: [docs/decisions/0002-brand-numoria-challenge.md](docs/decisions/0002-brand-numoria-challenge.md)
- ADR del scope de plataformas: [docs/decisions/0003-platform-scope.md](docs/decisions/0003-platform-scope.md)
