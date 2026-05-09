/**
 * Numoria — mapeo país (ISO 3166-1 alpha-2) → config local.
 *
 * Cubre los 22 países objetivo del MVP + defaults para el resto del mundo.
 * Se usa para:
 * - Detectar idioma por defecto según IP del usuario
 * - Mostrar precios en moneda local (con conversión USD)
 * - Formatear fechas y horas en timezone correcto
 */

import type { Locale } from './config';

export interface CountryConfig {
  /** Idioma por defecto del país. */
  locale: Locale;
  /** Código ISO 4217 de moneda (USD, MXN, BRL, etc.). */
  currency: string;
  /** Símbolo gráfico de la moneda. */
  symbol: string;
  /** Timezone IANA primaria (ej. America/Tegucigalpa). */
  timezone: string;
  /** Bandera emoji. */
  flag: string;
  /** Nombre legible del país en cada locale. */
  name: Record<Locale, string>;
}

export const COUNTRY_CONFIG: Record<string, CountryConfig> = {
  // ============== CENTROAMÉRICA (mercado prioritario) ==============
  HN: {
    locale: 'es',
    currency: 'HNL',
    symbol: 'L',
    timezone: 'America/Tegucigalpa',
    flag: '🇭🇳',
    name: { es: 'Honduras', en: 'Honduras', pt: 'Honduras' },
  },
  GT: {
    locale: 'es',
    currency: 'GTQ',
    symbol: 'Q',
    timezone: 'America/Guatemala',
    flag: '🇬🇹',
    name: { es: 'Guatemala', en: 'Guatemala', pt: 'Guatemala' },
  },
  SV: {
    locale: 'es',
    currency: 'USD',
    symbol: '$',
    timezone: 'America/El_Salvador',
    flag: '🇸🇻',
    name: { es: 'El Salvador', en: 'El Salvador', pt: 'El Salvador' },
  },
  NI: {
    locale: 'es',
    currency: 'NIO',
    symbol: 'C$',
    timezone: 'America/Managua',
    flag: '🇳🇮',
    name: { es: 'Nicaragua', en: 'Nicaragua', pt: 'Nicarágua' },
  },
  CR: {
    locale: 'es',
    currency: 'CRC',
    symbol: '₡',
    timezone: 'America/Costa_Rica',
    flag: '🇨🇷',
    name: { es: 'Costa Rica', en: 'Costa Rica', pt: 'Costa Rica' },
  },
  PA: {
    locale: 'es',
    currency: 'USD',
    symbol: '$',
    timezone: 'America/Panama',
    flag: '🇵🇦',
    name: { es: 'Panamá', en: 'Panama', pt: 'Panamá' },
  },

  // ============== MÉXICO ==============
  MX: {
    locale: 'es',
    currency: 'MXN',
    symbol: '$',
    timezone: 'America/Mexico_City',
    flag: '🇲🇽',
    name: { es: 'México', en: 'Mexico', pt: 'México' },
  },

  // ============== SUDAMÉRICA HISPANA ==============
  CO: {
    locale: 'es',
    currency: 'COP',
    symbol: '$',
    timezone: 'America/Bogota',
    flag: '🇨🇴',
    name: { es: 'Colombia', en: 'Colombia', pt: 'Colômbia' },
  },
  PE: {
    locale: 'es',
    currency: 'PEN',
    symbol: 'S/',
    timezone: 'America/Lima',
    flag: '🇵🇪',
    name: { es: 'Perú', en: 'Peru', pt: 'Peru' },
  },
  EC: {
    locale: 'es',
    currency: 'USD',
    symbol: '$',
    timezone: 'America/Guayaquil',
    flag: '🇪🇨',
    name: { es: 'Ecuador', en: 'Ecuador', pt: 'Equador' },
  },
  CL: {
    locale: 'es',
    currency: 'CLP',
    symbol: '$',
    timezone: 'America/Santiago',
    flag: '🇨🇱',
    name: { es: 'Chile', en: 'Chile', pt: 'Chile' },
  },
  AR: {
    locale: 'es',
    currency: 'ARS',
    symbol: '$',
    timezone: 'America/Argentina/Buenos_Aires',
    flag: '🇦🇷',
    name: { es: 'Argentina', en: 'Argentina', pt: 'Argentina' },
  },
  UY: {
    locale: 'es',
    currency: 'UYU',
    symbol: '$',
    timezone: 'America/Montevideo',
    flag: '🇺🇾',
    name: { es: 'Uruguay', en: 'Uruguay', pt: 'Uruguai' },
  },
  PY: {
    locale: 'es',
    currency: 'PYG',
    symbol: '₲',
    timezone: 'America/Asuncion',
    flag: '🇵🇾',
    name: { es: 'Paraguay', en: 'Paraguay', pt: 'Paraguai' },
  },
  BO: {
    locale: 'es',
    currency: 'BOB',
    symbol: 'Bs',
    timezone: 'America/La_Paz',
    flag: '🇧🇴',
    name: { es: 'Bolivia', en: 'Bolivia', pt: 'Bolívia' },
  },
  VE: {
    locale: 'es',
    currency: 'VES',
    symbol: 'Bs.S',
    timezone: 'America/Caracas',
    flag: '🇻🇪',
    name: { es: 'Venezuela', en: 'Venezuela', pt: 'Venezuela' },
  },

  // ============== CARIBE HISPANO ==============
  DO: {
    locale: 'es',
    currency: 'DOP',
    symbol: 'RD$',
    timezone: 'America/Santo_Domingo',
    flag: '🇩🇴',
    name: {
      es: 'República Dominicana',
      en: 'Dominican Republic',
      pt: 'República Dominicana',
    },
  },
  PR: {
    locale: 'es',
    currency: 'USD',
    symbol: '$',
    timezone: 'America/Puerto_Rico',
    flag: '🇵🇷',
    name: { es: 'Puerto Rico', en: 'Puerto Rico', pt: 'Porto Rico' },
  },
  CU: {
    locale: 'es',
    currency: 'CUP',
    symbol: '$',
    timezone: 'America/Havana',
    flag: '🇨🇺',
    name: { es: 'Cuba', en: 'Cuba', pt: 'Cuba' },
  },

  // ============== PORTUGUÉS (Fase 2-post) ==============
  BR: {
    locale: 'pt',
    currency: 'BRL',
    symbol: 'R$',
    timezone: 'America/Sao_Paulo',
    flag: '🇧🇷',
    name: { es: 'Brasil', en: 'Brazil', pt: 'Brasil' },
  },
  PT: {
    locale: 'pt',
    currency: 'EUR',
    symbol: '€',
    timezone: 'Europe/Lisbon',
    flag: '🇵🇹',
    name: { es: 'Portugal', en: 'Portugal', pt: 'Portugal' },
  },

  // ============== MERCADOS ANGLO ==============
  US: {
    locale: 'en',
    currency: 'USD',
    symbol: '$',
    timezone: 'America/New_York',
    flag: '🇺🇸',
    name: { es: 'Estados Unidos', en: 'United States', pt: 'Estados Unidos' },
  },
  GB: {
    locale: 'en',
    currency: 'GBP',
    symbol: '£',
    timezone: 'Europe/London',
    flag: '🇬🇧',
    name: { es: 'Reino Unido', en: 'United Kingdom', pt: 'Reino Unido' },
  },
  CA: {
    locale: 'en',
    currency: 'CAD',
    symbol: 'C$',
    timezone: 'America/Toronto',
    flag: '🇨🇦',
    name: { es: 'Canadá', en: 'Canada', pt: 'Canadá' },
  },
  AU: {
    locale: 'en',
    currency: 'AUD',
    symbol: 'A$',
    timezone: 'Australia/Sydney',
    flag: '🇦🇺',
    name: { es: 'Australia', en: 'Australia', pt: 'Austrália' },
  },
};

/** Fallback genérico para cualquier país no listado. */
export const DEFAULT_COUNTRY: CountryConfig = {
  locale: 'en',
  currency: 'USD',
  symbol: '$',
  timezone: 'UTC',
  flag: '🌐',
  name: {
    es: 'Internacional',
    en: 'International',
    pt: 'Internacional',
  },
};

/**
 * Resuelve config para un código de país.
 * Tolerante a null/undefined/case-insensitive.
 */
export function getCountryConfig(countryCode?: string | null): CountryConfig {
  if (!countryCode) return DEFAULT_COUNTRY;
  const upper = countryCode.toUpperCase().trim();
  return COUNTRY_CONFIG[upper] ?? DEFAULT_COUNTRY;
}

/** True si el país está explícitamente listado. */
export function isSupportedCountry(countryCode?: string | null): boolean {
  if (!countryCode) return false;
  return countryCode.toUpperCase().trim() in COUNTRY_CONFIG;
}

/** Devuelve todos los pares [código, config] para un locale dado. */
export function getCountriesByLocale(locale: Locale): Array<[string, CountryConfig]> {
  return Object.entries(COUNTRY_CONFIG).filter(([, cfg]) => cfg.locale === locale);
}

/** Lista todos los códigos de país soportados. */
export function listSupportedCountries(): string[] {
  return Object.keys(COUNTRY_CONFIG);
}
