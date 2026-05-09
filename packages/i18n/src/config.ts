/**
 * Numoria — config base de locales y branding.
 */

export const BRAND_NAME = 'Numoria Challenge' as const;
export const BRAND_SHORT = 'Numoria' as const;
export const MASCOT_NAME = 'Numa' as const;

/** Todos los locales planeados (incluye los aún no activos). */
export const locales = ['es', 'en', 'pt'] as const;
export type Locale = (typeof locales)[number];

/** Default si no podemos detectar nada. */
export const defaultLocale: Locale = 'es';

/**
 * Locales realmente activos en el MVP.
 * `pt` está estructurado pero sus mensajes son placeholders.
 */
export const activeLocales = ['es', 'en'] as const satisfies readonly Locale[];
export type ActiveLocale = (typeof activeLocales)[number];

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

export function isActiveLocale(value: unknown): value is ActiveLocale {
  return typeof value === 'string' && (activeLocales as readonly string[]).includes(value);
}

/** Cookie name donde guardamos preferencia explícita del usuario. */
export const LOCALE_COOKIE_NAME = 'numoria_locale';

/** Cookie name donde guardamos override manual del país. */
export const COUNTRY_COOKIE_NAME = 'numoria_country';

/** Display name de cada locale en su propio idioma. */
export const localeDisplayNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  pt: 'Português',
};

/** Bandera emoji representativa para selectores rápidos. */
export const localeFlags: Record<Locale, string> = {
  es: '🇪🇸',
  en: '🇺🇸',
  pt: '🇧🇷',
};
