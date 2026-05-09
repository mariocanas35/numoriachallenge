/**
 * Numoria — detección de locale a partir de señales del request.
 *
 * Orden de prioridad:
 *   1. Cookie de preferencia explícita del usuario
 *   2. País detectado vía cf-ipcountry (Cloudflare) o request.geo (Vercel)
 *   3. Header Accept-Language
 *   4. defaultLocale
 */

import { type Locale, defaultLocale, isActiveLocale } from './config';
import { getCountryConfig } from './country-config';

export interface DetectLocaleInput {
  cookieLocale?: string | null;
  countryCode?: string | null;
  acceptLanguage?: string | null;
}

export function detectLocale(input: DetectLocaleInput): Locale {
  // 1. Cookie preference (usuario eligió explícitamente)
  if (input.cookieLocale && isActiveLocale(input.cookieLocale)) {
    return input.cookieLocale;
  }

  // 2. País → locale por defecto del país
  if (input.countryCode) {
    const cfg = getCountryConfig(input.countryCode);
    if (isActiveLocale(cfg.locale)) {
      return cfg.locale;
    }
  }

  // 3. Accept-Language del navegador
  if (input.acceptLanguage) {
    const fromHeader = parseAcceptLanguage(input.acceptLanguage);
    if (fromHeader && isActiveLocale(fromHeader)) {
      return fromHeader;
    }
  }

  // 4. Fallback final
  return defaultLocale;
}

/**
 * Extrae el primer código de idioma de un header Accept-Language.
 * Ej: 'es-HN,es;q=0.9,en;q=0.8' → 'es'
 */
export function parseAcceptLanguage(header: string): string | null {
  const trimmed = header.trim();
  if (!trimmed) return null;
  const first = trimmed.split(',')[0]?.split(';')[0]?.trim().toLowerCase();
  if (!first) return null;
  // 'en-US' → 'en'; 'pt-BR' → 'pt'
  return first.split('-')[0] ?? null;
}
