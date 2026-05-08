# ADR 0003 — Alcance de plataformas: Web (PWA) + Android (Expo en Fase 6)

- **Estado:** Aceptado
- **Fecha:** 2026-05-08
- **Decididores:** Mario Cañas (founder)

---

## Contexto

El brief original consideraba MVP nativo en Web + iOS + Android desde el día 1. Sin embargo:

- El equipo es 1 persona + Claude
- Timeline MVP es 12 semanas
- iOS requiere Apple Developer Account ($99/año + verificación 1-2 semanas) y proceso de review más lento
- En Latinoamérica, Android tiene ~85% de market share móvil; iOS es minoría
- PWAs tienen soporte sólido en Chrome Android (instalable, push, offline) — aunque limitado en iOS Safari

## Decisión

**Reducción de alcance MVP a Web + Android. iOS diferido a post-MVP.**

Approach específico (Opción C escogida por founder):

| Fase | Plataforma | Tecnología |
|---|---|---|
| 1-5 | **Web (PWA)** | Next.js 15 + Service Worker + Web Push + Manifest instalable |
| 6 | **+ Android nativo** | Expo SDK 52 wrapper en Google Play Internal Testing |
| Post-MVP | **+ iOS** | Misma codebase Expo + Apple Developer + TestFlight |

### Comportamiento del MVP

- En **Chrome Android**: el sitio se ofrece como app instalable ("Agregar a pantalla de inicio"). Funciona offline para práctica. Push notifications via Web Push API.
- En **iOS Safari**: instalable también pero con limitaciones (sin push hasta iOS 16.4+ en standalone mode). Aceptable porque iOS no es target prioritario.
- En **Desktop**: experiencia web completa.

## Rechazadas

| Alternativa | Razón |
|---|---|
| **Opción A: PWA-only siempre** | Founder quiere presencia en Google Play eventualmente para credibilidad y descubribilidad |
| **Opción B: Expo Android desde Fase 1** | Duplica trabajo en fases iniciales sin valor comprobado todavía |
| **Web + iOS + Android nativo (brief original)** | No factible en 12 semanas con 1 persona |
| **Web nativa (Kotlin/Swift desde cero)** | Sin reuso con web; no apto para founder solo |
| **Capacitor en lugar de Expo** | Ecosistema más pequeño; menor calidad de bridges nativos |

## Implicaciones técnicas

### Lo que SÍ hace MVP
- Diseñar mobile-first absoluto desde Fase 1 (360px first)
- Service Worker robusto (Workbox) — offline para práctica de problemas
- Manifest + iconos para "Add to Home Screen" en Android
- Web Push setup desde Fase 4 (rachas en peligro, recordatorios de competencia)
- Componentes UI accesibles para input móvil táctil (incluyendo MathLive)
- Tests Playwright en viewport mobile (360×640) y desktop (1280×800)

### Lo que NO hace MVP
- ❌ Apple Developer Account / TestFlight / iOS build
- ❌ Detox iOS testing
- ❌ Native iOS push (APNs)
- ❌ App Store Connect screenshots
- ❌ Google Play submission (eso llega en Fase 6)
- ❌ Native Android-specific APIs (cámara avanzada, NFC, etc.)

### Lo que prepara MVP para Fase 6 (Expo Android)
- Stack React + Zustand + i18n elegido para portabilidad RN
- Componentes UI separados por package (`@numoria/ui`) reutilizables
- Auth flows compatibles con deep linking (Expo Router preparado)
- API contracts (TanStack Query) reusables

### Lo que prepara MVP para post-MVP iOS
- Toda la codebase Expo Android se reusa para iOS con cambios mínimos
- Solo se requiere: Apple Developer Account + ajustes de iconos + revisar APIs específicas

## Consecuencias

### Positivas
- **Reduce ~2-3 semanas de trabajo** del MVP original
- **Elimina dependencia bloqueante** de Apple Developer (verificación lenta)
- **Lanzamiento más rápido del piloto** = más tiempo de validación con escuelas reales
- **PWA permite hot updates** sin pasar por review de stores

### Negativas / mitigaciones
- ⚠️ **Sin presencia en App Store / Play Store en Fase 1-5** — los padres pueden buscar la marca en stores y no encontrarla. Mitigación: la landing page debe explicar claramente "Instala desde tu navegador" con instrucciones visuales.
- ⚠️ **iOS Safari tiene PWA limitado** — algunos padres con iPhone tendrán experiencia degradada. Mitigación: comunicar que iOS app llega después; web funciona.
- ⚠️ **Push en iOS Safari requiere iOS 16.4+** y solo en modo standalone. Mitigación: caer a email + WhatsApp para usuarios iOS.

## Revisión

Re-evaluar al cerrar **Fase 5** (semana 10):

- ¿El piloto en escuelas piloto valida tracción? → seguir a Expo Android Fase 6
- ¿El piloto tiene baja tracción? → enfocar Fase 6 en pulir PWA y diferir nativo más
- ¿Founder confirma demanda iOS? → planificar post-MVP con Apple Developer
