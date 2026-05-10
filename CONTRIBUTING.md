# Contribuir a Numoria Challenge

Bienvenido. Este documento explica cómo contribuir al proyecto durante el MVP.

> Por ahora el equipo es de 1 persona (founder) + Claude Code. Estas convenciones aplican igual para mantener calidad.

---

## Setup inicial

### Pre-requisitos

- **Node.js 22 LTS** (≥20 funciona, pero 22 es lo que usa CI). Recomendado: instalar [nvm-windows](https://github.com/coreybutler/nvm-windows) y correr `nvm install 22 && nvm use 22`.
- **pnpm 10.33.4** — `corepack enable && corepack prepare pnpm@10.33.4 --activate` (en Windows si Node está en `Program Files`, instalar pnpm con el [installer oficial](https://pnpm.io/installation) en `~/AppData/Local/pnpm`).
- **Docker Desktop** — necesario para correr Supabase localmente (Chunk 1.6 en adelante).
- **Git** ≥ 2.40.

### Clonar e instalar

```bash
git clone https://github.com/mariocanas35/numoriachallenge.git
cd numoriachallenge
pnpm install
cp .env.example .env.local       # llenar valores cuando los tengas
```

---

## Comandos clave

```bash
# Desarrollo
pnpm dev                         # Web + (eventualmente admin + mobile) en paralelo via Turbo
pnpm --filter=@numoria/web dev   # Solo la app web
pnpm --filter=@numoria/ui test   # Tests del package UI

# Calidad
pnpm format                      # Aplicar formato Biome
pnpm format:check                # Solo verificar
pnpm lint                        # Lint Biome
pnpm check                       # format + lint + organize-imports + write
pnpm typecheck                   # tsc --noEmit en todos los workspaces
pnpm test                        # Vitest unit tests
pnpm build                       # Build Next.js + tipo de packages
pnpm --filter=@numoria/web test:e2e   # Playwright (necesita `playwright install` primero)
```

---

## Workflow de contribución

### 1. Branches

- `main` siempre debe estar en estado deployable
- Para cambios: `feat/<scope>` o `fix/<scope>` o `docs/<scope>`
- Ej: `feat/auth-google-oauth`, `fix/middleware-redirect-loop`

### 2. Commits — Conventional Commits

Cada commit debe seguir [Conventional Commits](https://www.conventionalcommits.org).
Husky + commitlint validan el formato automáticamente.

```
<tipo>(<scope opcional>): <descripción corta>

[cuerpo opcional con detalles]

[footer opcional con BREAKING CHANGE / refs]
```

Tipos válidos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

Scopes sugeridos: `web`, `mobile`, `admin`, `ui`, `i18n`, `db`, `auth`, `ai`, `grading`, `gamification`, `comp`, `cert`, `infra`, `ci`, `deps`.

Ejemplos:

```bash
feat(auth): agregar login con Google OAuth
fix(competition): corregir cálculo de puntaje cuando timer expira
docs: actualizar PROGRESS.md con cierre de Fase 1
```

### 3. Pre-commit hooks

Husky corre automáticamente:

- `pre-commit` — `biome check --staged` (formato + lint + organize-imports)
- `commit-msg` — commitlint valida el mensaje

Para skipear excepcionalmente: `git commit --no-verify` (uso muy limitado).

### 4. Pull requests

- Llena el template (`.github/PULL_REQUEST_TEMPLATE.md`)
- Cada PR debe pasar todos los checks de CI: lint, typecheck, test, build
- Para PRs grandes (>500 LOC), divide en commits atómicos para facilitar review
- Toda feature debe venir con tests (unit + E2E si afecta flujos críticos)

### 5. Bitácora

Actualiza `PROGRESS.md` al cerrar cada chunk grande con:
- Lo que pasó
- Archivos creados/modificados
- Verificaciones que pasaron
- Próximos pasos

---

## Estructura de packages

Importante: **siempre usar `@numoria/*` aliases**, nunca paths relativos cross-package.

```typescript
// ✅ Correcto
import { Button } from '@numoria/ui';
import { detectLocale } from '@numoria/i18n';

// ❌ Incorrecto
import { Button } from '../../packages/ui/src/components/Button';
```

Los packages internos se consumen via `transpilePackages` en Next.js — sin build step propio.

---

## Decisiones arquitectónicas (ADRs)

Cualquier decisión técnica importante (cambio de stack, patrón nuevo, deuda asumida) requiere un ADR en `docs/decisions/`:

```
docs/decisions/
├── 0001-stack.md
├── 0002-brand-numoria-challenge.md
├── 0003-platform-scope.md
├── 0004-<tu-nueva-decisión>.md
```

Formato: contexto → decisión → alternativas consideradas → consecuencias → revisión.

---

## Calidad de código

### TypeScript

- `strict: true` en todo el monorepo
- Cero `any` (excepto wrappers de librerías sin tipos, con `// biome-ignore`)
- `noUncheckedIndexedAccess: true` — todos los arrays/Records se acceden con narrow checks

### Tests

- **Unit tests** son parte de la feature, no opcionales
- **E2E tests** para flujos críticos (registro, competencia, certificado)
- Coverage mínimo recomendado: 80% en lógica de negocio

### Accesibilidad

- WCAG 2.1 AA mínimo
- Tests de a11y con axe-core en cada componente UI nuevo
- Contraste de colores verificado para Numoria palette

---

## Seguridad

- **NUNCA** commitees secrets, tokens, credenciales, o `.env.local`
- Sospecha de secret leak: notificar inmediatamente
- Para vulnerabilidades de producto: email a `mimathonline@gmail.com`, NO issue público

---

## Memoria del proyecto

Lecturas obligatorias antes de contribuir:

1. [README.md](README.md) — Overview
2. [PROGRESS.md](PROGRESS.md) — Bitácora viva del desarrollo
3. [docs/decisions/](docs/decisions/) — ADRs vigentes
