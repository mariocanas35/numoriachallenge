/**
 * @numoria/i18n — public API
 */

// Branding & locales
export {
  BRAND_NAME,
  BRAND_SHORT,
  MASCOT_NAME,
  locales,
  defaultLocale,
  activeLocales,
  isLocale,
  isActiveLocale,
  LOCALE_COOKIE_NAME,
  COUNTRY_COOKIE_NAME,
  localeDisplayNames,
  localeFlags,
} from './config';
export type { Locale, ActiveLocale } from './config';

// Country mapping
export {
  COUNTRY_CONFIG,
  DEFAULT_COUNTRY,
  getCountryConfig,
  isSupportedCountry,
  getCountriesByLocale,
  listSupportedCountries,
} from './country-config';
export type { CountryConfig } from './country-config';

// Pricing
export { formatPrice, formatLocalCurrency, convertUsdCents } from './pricing';
export type { PriceInfo } from './pricing';

// Datetime
export {
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatDuration,
} from './datetime';
export type { DateInput } from './datetime';

// Locale detection
export { detectLocale, parseAcceptLanguage } from './detect';
export type { DetectLocaleInput } from './detect';
