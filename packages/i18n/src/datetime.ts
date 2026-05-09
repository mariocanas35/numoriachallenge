/**
 * Numoria — formateo de fechas, horas y tiempos relativos.
 *
 * Construido sobre `Intl.DateTimeFormat` y `Intl.RelativeTimeFormat`.
 * Soporta timezones IANA (ej. 'America/Tegucigalpa', 'America/Sao_Paulo').
 */

import type { Locale } from './config';

export type DateInput = Date | string | number;

function asDate(input: DateInput): Date {
  if (input instanceof Date) return input;
  return new Date(input);
}

/**
 * Formato de fecha completo (ej. '8 de mayo de 2026').
 */
export function formatDate(
  date: DateInput,
  locale: Locale,
  timezone: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(asDate(date));
}

/**
 * Formato de hora corta (ej. '15:30').
 */
export function formatTime(
  date: DateInput,
  locale: Locale,
  timezone: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(asDate(date));
}

/**
 * Formato combinado de fecha + hora (ej. '8 may 2026, 15:30').
 */
export function formatDateTime(
  date: DateInput,
  locale: Locale,
  timezone: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(asDate(date));
}

/**
 * Tiempo relativo legible: "hace 5 minutos", "in 3 hours", "ontem", etc.
 *
 * @param date Fecha objetivo (futuro o pasado).
 * @param locale Idioma de salida.
 * @param baseDate Punto de referencia (default: ahora).
 */
export function formatRelativeTime(
  date: DateInput,
  locale: Locale,
  baseDate: Date = new Date(),
): string {
  const target = asDate(date);
  const diffMs = target.getTime() - baseDate.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const absSec = Math.abs(diffSec);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (absSec < 60) return rtf.format(diffSec, 'second');

  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');

  const diffHr = Math.round(diffMin / 60);
  if (Math.abs(diffHr) < 24) return rtf.format(diffHr, 'hour');

  const diffDay = Math.round(diffHr / 24);
  if (Math.abs(diffDay) < 30) return rtf.format(diffDay, 'day');

  const diffMonth = Math.round(diffDay / 30);
  if (Math.abs(diffMonth) < 12) return rtf.format(diffMonth, 'month');

  const diffYear = Math.round(diffMonth / 12);
  return rtf.format(diffYear, 'year');
}

/**
 * Duración en formato "MM:SS" o "HH:MM:SS" — útil para timer de competencia.
 */
export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return hrs > 0 ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
}
