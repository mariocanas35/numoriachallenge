# ADR 0001 — Stack tecnológico

- **Estado:** Aceptado
- **Fecha:** 2026-05-08
- **Decididores:** Mario Cañas (founder), Claude Code (co-developer)

---

## Contexto

Numoria Challenge es una plataforma educativa para olimpiadas matemáticas dirigida a niños de 8-14 años. Restricciones del proyecto:

- **Equipo:** 1 founder + Claude como co-desarrollador
- **Timeline MVP:** 12 semanas
- **Presupuesto:** Bajo (free tiers preferidos)
- **Calidad esperada:** Production-grade desde día 1
- **Mercado primario:** Latinoamérica (alto tráfico móvil 4G)
- **Plataformas MVP:** Web (PWA) + Android (Expo en Fase 6)

Necesitamos un stack que: minimice fricción operativa, comparta código entre web y mobile, sea económicamente sostenible en piloto, y permita crecer sin migración mayor.

## Decisión

### Frontend Web

| Capa | Tecnología | Razón |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | RSC + streaming, mejor en LatAm 4G; ecosistema más rico que Remix; deploy trivial en Vercel |
| Lenguaje | **TypeScript 5.x estricto** | Cero `any` por default; `noUncheckedIndexedAccess` |
| Estilos | **Tailwind CSS 4 + shadcn/ui** | Velocidad + control total del DS; sin lock-in a librería |
| Estado cliente | **Zustand** | API mínima; compatible con RN para reuso futuro |
| Estado servidor | **TanStack Query** | Cache, retries, optimistic updates resueltos |
| Forms | **React Hook Form + Zod** | Validación tipada compartida cliente/servidor |
| i18n | **next-intl** | Routing por locale, server components, mejor que next-i18next en App Router |
| Render matemático | **KaTeX** | 10× más rápido que MathJax, suficiente para olimpiadas escolares |
| Input matemático | **MathLive (cortexjs.io)** | Único editor LaTeX con UX táctil decente |
| Geometría dinámica | **GeoGebra embed** | Estándar de facto en didáctica matemática |
| Animaciones | **Motion (framer-motion v11+)** | API declarativa, performance buena |
| PDF | **react-pdf** + microservicio Node con Puppeteer | react-pdf para generación simple; Puppeteer para certificados de alta calidad |

### Mobile (Fase 6)

| Capa | Tecnología | Razón |
|---|---|---|
| Framework | **Expo SDK 52 + React Native** | Reusa Zustand/forms/i18n del web; OTA updates; EAS para builds |
| Navegación | **Expo Router** | File-based routing igual que Next |
| Estilos | **NativeWind** | Tailwind classes en RN — compartir tokens con web |
| Storage local | **expo-secure-store + MMKV** | MMKV es 30× más rápido que AsyncStorage |

> **Nota sobre Fase 6:** El MVP entrega PWA primero. Expo Android wrapper se construye solo si el piloto valida tracción.

### Backend

| Capa | Tecnología | Razón |
|---|---|---|
| BD + Auth + Storage + Realtime | **Supabase (PostgreSQL 15)** | Free tier generoso; RLS robusto; menos infra que armar Postgres + Hasura + S3 + WebSockets manualmente |
| Edge Functions | **Supabase Edge (Deno)** | Cerca de la BD, latencia baja para hooks transaccionales |
| Microservicio matemático | **Python FastAPI + SymPy** en Railway | SymPy es la única librería robusta para equivalencias simbólicas; no portable a Deno |
| Email transaccional | **SMTP Gmail** (mimathonline@gmail.com) | Cero config externa para piloto; migración a Resend cuando se compre dominio |
| WhatsApp (Fase 4) | **Twilio WhatsApp Business API** | Único provider con cobertura confiable LatAm |
| IA primaria | **Anthropic Claude (claude-sonnet-4-6)** | Mejor razonamiento matemático para tutor; mejor en español que GPT-4 |
| IA fallback | **OpenAI GPT-4o-mini** | Disponibilidad y costo cuando Claude esté caído |
| Monitoring | **Sentry + PostHog** | Free tiers cubren MVP entero |

### Infraestructura

| Capa | Tecnología | Razón |
|---|---|---|
| Hosting web | **Vercel (Hobby free)** | Cero config Next.js; ISR; Edge Runtime |
| Hosting grader | **Railway ($5-20/mes)** | Único PaaS con Docker fácil + autoscale económico |
| CDN + DNS | **Cloudflare** | Gratis; cf-ipcountry para geo-detection |
| Storage CDN | **Cloudflare R2** | Sin tarifas de egreso (S3 cobra $0.09/GB salida) |
| Anti-bot | **Cloudflare Turnstile** | Gratis, sin CAPTCHA visible (mejor UX que reCAPTCHA) |

### DevOps

| Capa | Tecnología |
|---|---|
| Monorepo | **Turborepo** + **pnpm workspaces** |
| CI/CD | **GitHub Actions** |
| Linter + formatter | **Biome** + ESLint puntual |
| Testing | **Vitest** (unit) + **Playwright** (e2e) + **Detox** (RN, Fase 6+) |
| Commits | **Conventional Commits** + **Husky** + **commitlint** |

## Alternativas consideradas y descartadas

| Alternativa | Por qué no |
|---|---|
| **Remix en lugar de Next** | Ecosistema más pequeño; menos integraciones edtech existentes |
| **SvelteKit** | Founder y Claude tienen mejor velocidad en React; reuso con RN/Expo |
| **Firebase en lugar de Supabase** | Vendor lock-in NoSQL; SQL es crítico para reportes complejos de competencias |
| **Hasura + Postgres separado** | Más infra para 1 persona mantener |
| **AWS Lambda + RDS** | Demasiado bajo nivel; gasto rápido en piloto |
| **Mantine / MUI** | Customización lenta; bundle pesado |
| **Pyodide para grader** (SymPy en navegador) | 10MB descarga, demasiado para LatAm 4G |
| **Stripe Identity para verificación parental** | Costo + complejidad; diferimos COPPA al posponer USA |
| **Inter / Roboto fonts** | Usadas en demasiados sitios — Plus Jakarta Sans + Fraunces dan personalidad |

## Consecuencias

### Positivas
- Stack 90% TypeScript en cliente y servidor → un lenguaje principal
- Free tiers cubren primeros 6-12 meses incluso con 5K usuarios
- Migración futura: si Supabase falla, schemas SQL son portables
- PWA reduce ~30% del trabajo total vs apps nativas duplicadas

### Negativas / riesgos
- **Vendor concentration en Supabase** — si tienen outage, autenticación cae. Mitigación: Sentry alerts + status page propia.
- **Tailwind 4 + shadcn/ui** todavía maduran su integración. Mitigación: si rompe en Fase 1, downgrade a Tailwind 3.4.
- **MathLive bundle ~300KB** — cargar dynamic-only en pantallas de input.
- **Microservicio Python** agrega complejidad operativa. Costo aceptable: SymPy es irreemplazable.

## Revisión

Re-evaluar este ADR al cerrar **Fase 3** (semana 6) y al cerrar **Fase 6** (semana 12). Si los riesgos negativos se materializan, abrir ADRs específicos para mitigaciones.
