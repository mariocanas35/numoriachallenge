# Numoria Challenge

> Plataforma global de olimpiadas matemáticas online para estudiantes de 8-14 años.
> Mobile-first, multilingüe (ES/EN), foco inicial Latinoamérica.

[![CI](https://github.com/mariocanas35/numoriachallenge/actions/workflows/ci.yml/badge.svg)](https://github.com/mariocanas35/numoriachallenge/actions/workflows/ci.yml)
[![E2E](https://github.com/mariocanas35/numoriachallenge/actions/workflows/e2e.yml/badge.svg)](https://github.com/mariocanas35/numoriachallenge/actions/workflows/e2e.yml)

**Estado:** 🟡 Fase 1 en curso (50% completo)
**Versión actual:** 0.0.0
**Última actualización:** 2026-05-09

---

## 🎯 Visión

Construir una alternativa moderna a MOEMS y Math Kangaroo para el mercado latinoamericano de 600M de habitantes, con:

- Web instalable como PWA (offline + push)
- App Android nativa en Fase 6 (vía Expo)
- iOS en post-MVP
- 3 competencias completamente gratis sin tarjeta como gancho de adquisición
- Gamificación tipo Duolingo (XP, rachas, badges, ligas)
- Certificados imprimibles + ranking institucional con logos de escuelas
- Tutor IA "Numa" para pistas socráticas
- Multilingüe ES + EN desde día 1, PT en Fase 2

---

## 📐 Stack técnico (resumen)

| Capa | Tecnología |
|---|---|
| Web | Next.js 15 (App Router) + TypeScript + Tailwind 4 + shadcn/ui |
| PWA | next-pwa + Workbox + Web Push |
| Mobile (Fase 6) | Expo SDK 52 + React Native + NativeWind |
| Backend | Supabase (PostgreSQL + Auth + Storage + Realtime + Edge Functions) |
| Grader matemático | Python FastAPI + SymPy (Railway) |
| IA | Anthropic Claude API + OpenAI fallback |
| Email | SMTP Gmail (piloto) |
| Hosting web | Vercel + Cloudflare CDN |
| Monorepo | Turborepo + pnpm |

Detalles completos: [docs/decisions/0001-stack.md](docs/decisions/0001-stack.md)

---

## 📁 Estructura del proyecto (planificada)

```
numoria-challenge/
├── apps/
│   ├── web/              # Next.js 15 — sitio principal + PWA
│   ├── mobile/           # Expo Android (Fase 6+)
│   └── admin/            # Next.js — admin.numoria-challenge.app
├── packages/
│   ├── ui/               # Componentes shadcn/ui compartidos
│   ├── database/         # Tipos Supabase + queries
│   ├── i18n/             # ES, EN, PT (preparado)
│   ├── math/             # KaTeX, MathLive, parsing
│   ├── grading/          # Cliente del microservicio Python
│   ├── ai/               # Wrapper Claude/OpenAI
│   ├── gamification/     # Engine de XP/rachas/badges
│   └── config/           # ESLint, TS, Tailwind compartidos
├── services/
│   └── grading-py/       # FastAPI + SymPy
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed.sql
├── docs/
│   ├── decisions/        # ADRs
│   ├── architecture.md
│   └── api.md
├── scripts/              # Seeds, migraciones de datos
├── e2e/                  # Playwright (web), Detox (mobile post-Fase 6)
├── PROGRESS.md           # Bitácora viva
└── README.md
```

> En esta fase de scaffolding solo existen los archivos de documentación y configuración base. La estructura de apps/packages se crea en Fase 1.

---

## 🚀 Setup local (en construcción)

> ⚠️ Aún no instalable. Estos comandos serán válidos al cerrar Fase 1.

```bash
# Pre-requisitos: Node 20.x LTS, pnpm 9+, Docker (para Supabase local)
nvm use                  # lee .nvmrc
pnpm install
cp .env.example .env.local   # llenar valores reales

pnpm db:start            # arranca Supabase local
pnpm db:reset            # aplica migraciones + seed
pnpm dev                 # web en http://localhost:3000
```

---

## 📋 Roadmap

Plan completo en [PROGRESS.md](PROGRESS.md).

| Fase | Semanas | Foco |
|---|---|---|
| 1 | 1-2 | Fundamentos: monorepo, auth, design system, landing |
| 2 | 3-4 | Roles (estudiante/padre/profesor) + escuelas + branding institucional |
| 3 | 5-6 | Banco de problemas con LaTeX + competencias + grader |
| 4 | 7-8 | Gamificación (XP, rachas, badges, ligas, leaderboards) |
| 5 | 9-10 | Certificados PDF + Tutor IA Numa + moderación IA |
| 6 | 11-12 | PWA pulido + Expo Android + soft launch piloto |

---

## 🔒 Privacidad y seguridad

Plataforma para menores de edad. Compromisos:
- Datos mínimos: email, nombre, **mes/año** de nacimiento (NO día completo)
- Encriptación TLS 1.3 + AES-256 en reposo
- Sin publicidad behavioral, sin tracking de terceros
- Cumplimiento LGPD (Brasil), GDPR-K (UE), COPPA (USA — diferido)
- Botón "Borrar mi cuenta" con eliminación verificable

---

## 📖 Documentación

- [PROGRESS.md](PROGRESS.md) — bitácora viva de desarrollo
- [docs/decisions/](docs/decisions/) — Architecture Decision Records (ADRs)
- `docs/architecture.md` — visión técnica completa (pendiente, Fase 1)
- `docs/api.md` — endpoints y contratos (pendiente, Fase 3)

---

## 👤 Equipo

- **Founder + Product + Math content:** Mario Cañas (Honduras)
- **Co-developer:** Claude Code (Anthropic) — implementación, tests, docs

---

## 📜 Licencia

TBD. Por defecto, **All Rights Reserved** durante el MVP. Decisión final post-piloto.
