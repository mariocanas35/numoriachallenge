/**
 * Numoria — detección de locale a partir de señales del request.
 *
 * Orden de prioridad:
 *   1. Cookie de preferencia explícita del usuario (override manual)
 *   2. Header Accept-Language (idioma predeterminado del navegador de la persona)
 *   3. País detectado vía cf-ipcountry (Cloudflare) o x-vercel-ip-country (Vercel)
 *   4. defaultLocale
 *
 * El idioma del navegador manda sobre el país: queremos mostrarle a cada
 * visitante el sitio en SU idioma predeterminado (p.ej. alguien con el navegador
 * en inglés ve inglés aunque su IP esté en un país hispanohablante). El país solo
 * decide cuando el navegador pide un idioma que aún no soportamos.
 */

import { type Locale, defaultLocale, isActiveLocale } from './config';
import { getCountryConfig } from './country-config';

export interface DetectLocaleInput {
  cookieLocale?: string | null;
  countryCode?: string | null;
  acceptLanguage?: string | null;
}

export function detectLocale(input: DetectLocaleInput): Locale {
  // 1. Cookie preference (usuario eligió explícitamente vía LocaleSwitcher)
  if (input.cookieLocale && isActiveLocale(input.cookieLocale)) {
    return input.cookieLocale;
  }

  // 2. Accept-Language del navegador (idioma predeterminado de la persona)
  if (input.acceptLanguage) {
    const fromHeader = parseAcceptLanguage(input.acceptLanguage);
    if (fromHeader && isActiveLocale(fromHeader)) {
      return fromHeader;
    }
  }

  // 3. País → locale del país (respaldo cuando el navegador pide un idioma que
  //    aún no soportamos, p.ej. francés en México → es)
  if (input.countryCode) {
    const cfg = getCountryConfig(input.countryCode);
    if (isActiveLocale(cfg.locale)) {
      return cfg.locale;
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
