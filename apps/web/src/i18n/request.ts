import enMessages from '@numoria/i18n/messages/en.json';
import esMessages from '@numoria/i18n/messages/es.json';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

/**
 * Config server-side por request.
 * - Resuelve locale desde el segmento de URL
 * - Carga el JSON de mensajes apropiado de @numoria/i18n
 * - Falls back a defaultLocale si el locale no es válido o activo
 *
 * Mensajes importados estáticamente — Webpack/Turbopack los tree-shakes
 * por locale y los activos al MVP son pequeños (~3KB cada uno).
 */
type ActiveLocale = (typeof routing.locales)[number];

/**
 * Estructura recursiva que espera next-intl (`AbstractIntlMessages`):
 * solo strings u objetos anidados. Los mensajes informativos contienen
 * arrays (p.ej. `pages.help.faqs`, `pages.*.points`) que se leen con
 * `t.raw()` — next-intl los soporta en runtime, pero su tipo no admite
 * arrays, de ahí el cast `as unknown`.
 */
type IntlMessages = { [key: string]: string | IntlMessages };

const messagesByLocale: Record<ActiveLocale, IntlMessages> = {
  es: esMessages as unknown as IntlMessages,
  en: enMessages as unknown as IntlMessages,
};

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as ActiveLocale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: messagesByLocale[locale as ActiveLocale],
  };
});
