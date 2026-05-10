import { activeLocales, defaultLocale } from '@numoria/i18n';
import { defineRouting } from 'next-intl/routing';

/**
 * Config compartida de routing para next-intl.
 *
 * - locales activos: 'es', 'en' (pt agregado cuando esté traducido)
 * - default: 'es'
 * - localePrefix: 'always' → todas las URLs incluyen prefijo (/es, /en)
 * - localeDetection: false → desactivamos auto-detección de next-intl;
 *   nuestro middleware hace su propia detección con prioridad sobre país (cf-ipcountry)
 */
export const routing = defineRouting({
  locales: [...activeLocales],
  defaultLocale,
  localePrefix: 'always',
  localeDetection: false,
});
