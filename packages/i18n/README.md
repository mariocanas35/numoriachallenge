# @numoria/i18n

Internacionalización del proyecto. Locales, mapeo país → idioma + moneda, formato de precios y fechas, y mensajes traducidos.

> Cero runtime dependencies — todo con `Intl` nativo de la plataforma.

---

## Exports

```typescript
import {
  // Config & locales
  BRAND_NAME, locales, defaultLocale, activeLocales,
  isLocale, isActiveLocale,

  // Country
  COUNTRY_CONFIG, getCountryConfig, isSupportedCountry, getCountriesByLocale,

  // Pricing
  formatPrice, formatLocalCurrency,

  // Datetime
  formatDate, formatTime, formatDateTime, formatRelativeTime,

  // Locale detection
  detectLocale, parseAcceptLanguage,
} from '@numoria/i18n';

// Subpath imports también disponibles:
import esMessages from '@numoria/i18n/messages/es.json';
import enMessages from '@numoria/i18n/messages/en.json';
```

---

## Locales soportados

| Estado | Locale | Notas |
|---|---|---|
| ✅ Activo | `es` | Default. Cubre toda LatAm hispanohablante. |
| ✅ Activo | `en` | USA, UK, Canadá, Australia, fallback global. |
| 🚧 Estructura lista | `pt` | Brasil, Portugal. Mensajes pendientes en Fase 2-post. |

---

## Detección de locale (orden de prioridad)

1. **Cookie de preferencia** (`numoria_locale`) — usuario eligió manualmente
2. **País detectado** vía `cf-ipcountry` o `request.geo` (Vercel)
3. **Header `Accept-Language`**
4. **defaultLocale** (`es`)

```typescript
const locale = detectLocale({
  cookieLocale: cookies.get('numoria_locale')?.value,
  countryCode: request.headers.get('cf-ipcountry'),
  acceptLanguage: request.headers.get('accept-language'),
});
```

---

## Países cubiertos

22 países preconfigurados con `{ locale, currency, symbol, timezone, flag, name }`:

- **Centroamérica:** HN, GT, SV, NI, CR, PA
- **México:** MX
- **Sudamérica hispana:** CO, PE, EC, CL, AR, UY, PY, BO, VE
- **Caribe hispano:** DO, PR, CU
- **Brasil + Portugal:** BR, PT
- **Anglo:** US, GB, CA, AU
- **Default:** `🌐 Internacional` con USD

---

## Pricing

```typescript
formatPrice(500_00, 'HN', { HNL: 24.5 });
// → { amountCents: 1225000, currency: 'HNL', symbol: 'L', formatted: 'L 12,250.00' }

formatPrice(500_00, 'BR', { BRL: 5.0 });
// → { amountCents: 250000, currency: 'BRL', symbol: 'R$', formatted: 'R$ 2.500,00' }
```

> Precios base se almacenan en USD cents. Conversión a moneda local con tasa de cambio (cacheada 24h en producción via Cloudflare KV).

---

## Datetime

```typescript
formatDate(new Date(), 'es', 'America/Tegucigalpa');
// → '8 de mayo de 2026'

formatDateTime(new Date(), 'en', 'America/New_York');
// → 'May 8, 2026, 03:30 PM'

formatRelativeTime(new Date(Date.now() + 3_600_000), 'es');
// → 'en 1 hora'
```

---

## Estructura de mensajes

```
messages/
├── es.json    ← Default (Honduras y LatAm)
├── en.json    ← USA / global
└── pt.json    ← Brasil (estructura preparada, pending)
```

Namespaces: `brand`, `landing`, `auth`, `common`, `errors`, `footer`.
