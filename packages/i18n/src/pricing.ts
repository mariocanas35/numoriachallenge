/**
 * Numoria — formateo de precios y conversión USD → moneda local.
 *
 * Los precios canónicos se almacenan en USD cents (entero) en la BD.
 * Para mostrar al usuario, convertimos con tasa de cambio (cache 24h)
 * y formateamos en su locale + moneda.
 */

import type { Locale } from './config';
import { getCountryConfig } from './country-config';

export interface PriceInfo {
  /** Monto en cents de la moneda destino (entero). */
  amountCents: number;
  /** Código ISO 4217. */
  currency: string;
  /** Símbolo gráfico. */
  symbol: string;
  /** String formateado para mostrar (incluye moneda). */
  formatted: string;
}

/**
 * Monedas sin subdivisión decimal (los enteros ya son la unidad mínima).
 * Para estas, formateamos sin decimales.
 */
const NO_FRACTION_CURRENCIES = new Set(['CLP', 'PYG', 'COP', 'JPY', 'KRW', 'VND', 'IDR']);

function fractionDigitsFor(currency: string): number {
  return NO_FRACTION_CURRENCIES.has(currency.toUpperCase()) ? 0 : 2;
}

function buildIntlLocale(locale: Locale, country: string): string {
  // Ej: 'es-HN', 'pt-BR', 'en-US'
  return `${locale}-${country.toUpperCase()}`;
}

/**
 * Formatea un precio dado en USD cents a la moneda y locale del país.
 *
 * @param amountUsdCents Precio canónico en cents USD (ej. 500_00 = $5 USD).
 * @param countryCode País destino (ej. 'HN').
 * @param exchangeRates Tabla de tasas: { HNL: 24.5, BRL: 5.0, ... } (1 USD = N de la moneda).
 *                      Si no se provee o falta la moneda, asume 1:1 (útil para dev).
 * @param overrideLocale Locale explícito para el formato (sino usa el default del país).
 */
export function formatPrice(
  amountUsdCents: number,
  countryCode: string,
  exchangeRates?: Record<string, number>,
  overrideLocale?: Locale,
): PriceInfo {
  const config = getCountryConfig(countryCode);
  const usdAmount = amountUsdCents / 100;
  const rate = exchangeRates?.[config.currency] ?? 1;
  const localAmount = usdAmount * rate;
  const fmtLocale = buildIntlLocale(overrideLocale ?? config.locale, countryCode);
  const digits = fractionDigitsFor(config.currency);

  const formatted = new Intl.NumberFormat(fmtLocale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(localAmount);

  return {
    amountCents: Math.round(localAmount * 10 ** digits),
    currency: config.currency,
    symbol: config.symbol,
    formatted,
  };
}

/**
 * Formatea un monto que YA está en la moneda local (sin conversión).
 * Útil cuando el usuario ingresa un precio directamente en su moneda.
 */
export function formatLocalCurrency(
  amount: number,
  currency: string,
  locale: Locale = 'en',
): string {
  const digits = fractionDigitsFor(currency);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount);
}

/**
 * Convierte cents USD a un número plano en la moneda destino (sin formato).
 * Útil para cálculos, no para display.
 */
export function convertUsdCents(
  amountUsdCents: number,
  targetCurrency: string,
  exchangeRates?: Record<string, number>,
): number {
  const rate = exchangeRates?.[targetCurrency.toUpperCase()] ?? 1;
  return (amountUsdCents / 100) * rate;
}
