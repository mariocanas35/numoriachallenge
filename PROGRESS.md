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

## 🔗 Referencias rápidas

- Brief maestro original: pegado en sesión 1 (ver historial de chat).
- ADR del stack: [docs/decisions/0001-stack.md](docs/decisions/0001-stack.md)
- ADR de la marca: [docs/decisions/0002-brand-numoria-challenge.md](docs/decisions/0002-brand-numoria-challenge.md)
- ADR del scope de plataformas: [docs/decisions/0003-platform-scope.md](docs/decisions/0003-platform-scope.md)
