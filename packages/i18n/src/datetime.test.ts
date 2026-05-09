import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatDuration,
  formatRelativeTime,
  formatTime,
} from './datetime';

const FIXED_NOW = new Date('2026-05-08T15:30:00Z'); // 2026-05-08, 15:30 UTC

describe('formatDate', () => {
  it('formato largo en español, timezone Tegucigalpa', () => {
    // 15:30 UTC → 09:30 hora HN (UTC-6) → mismo día (8 mayo)
    const out = formatDate(FIXED_NOW, 'es', 'America/Tegucigalpa');
    expect(out).toMatch(/8 de mayo de 2026/);
  });

  it('formato largo en inglés, timezone NY', () => {
    const out = formatDate(FIXED_NOW, 'en', 'America/New_York');
    expect(out).toMatch(/May 8, 2026/);
  });

  it('acepta input string ISO', () => {
    const out = formatDate('2026-05-08T15:30:00Z', 'es', 'UTC');
    expect(out).toMatch(/8 de mayo de 2026/);
  });

  it('acepta input timestamp en ms', () => {
    const out = formatDate(FIXED_NOW.getTime(), 'es', 'UTC');
    expect(out).toMatch(/8 de mayo/);
  });
});

describe('formatTime', () => {
  it('hora local Honduras (UTC-6)', () => {
    // 15:30 UTC → 09:30 HN
    const out = formatTime(FIXED_NOW, 'es', 'America/Tegucigalpa');
    expect(out).toMatch(/09:30/);
  });

  it('hora local Tokyo', () => {
    // 15:30 UTC → 00:30 JP del día siguiente
    const out = formatTime(FIXED_NOW, 'en', 'Asia/Tokyo');
    expect(out).toMatch(/12:30 AM|00:30/);
  });
});

describe('formatDateTime', () => {
  it('combina fecha + hora en español', () => {
    const out = formatDateTime(FIXED_NOW, 'es', 'America/Mexico_City');
    expect(out).toMatch(/2026/);
    expect(out).toMatch(/may/i);
    expect(out).toMatch(/\d{2}:\d{2}/);
  });
});

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('hace 5 minutos en español', () => {
    const past = new Date(FIXED_NOW.getTime() - 5 * 60 * 1000);
    expect(formatRelativeTime(past, 'es')).toMatch(/hace 5 min/i);
  });

  it('2 horas en el futuro en español', () => {
    const future = new Date(FIXED_NOW.getTime() + 2 * 60 * 60 * 1000);
    // CLDR puede devolver 'en 2 horas' o 'dentro de 2 horas' según versión
    expect(formatRelativeTime(future, 'es')).toMatch(/2 horas/i);
  });

  it('5 minutes ago en inglés', () => {
    const past = new Date(FIXED_NOW.getTime() - 5 * 60 * 1000);
    expect(formatRelativeTime(past, 'en')).toMatch(/5 minutes ago/i);
  });

  it('handles días, meses, años', () => {
    const yesterday = new Date(FIXED_NOW.getTime() - 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(yesterday, 'en')).toMatch(/yesterday|1 day ago/i);

    const lastMonth = new Date(FIXED_NOW.getTime() - 35 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(lastMonth, 'en')).toMatch(/last month|1 month ago/i);

    const lastYear = new Date(FIXED_NOW.getTime() - 400 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(lastYear, 'en')).toMatch(/last year|1 year ago/i);
  });

  it('respeta baseDate explícito', () => {
    const past = new Date('2026-05-08T15:00:00Z');
    const base = new Date('2026-05-08T15:30:00Z');
    expect(formatRelativeTime(past, 'es', base)).toMatch(/hace 30 min/i);
  });
});

describe('formatDuration', () => {
  it('formato MM:SS para menos de 1 hora', () => {
    expect(formatDuration(0)).toBe('00:00');
    expect(formatDuration(30)).toBe('00:30');
    expect(formatDuration(60)).toBe('01:00');
    expect(formatDuration(125)).toBe('02:05');
    expect(formatDuration(3599)).toBe('59:59');
  });

  it('formato HH:MM:SS para 1 hora o más', () => {
    expect(formatDuration(3600)).toBe('01:00:00');
    expect(formatDuration(3661)).toBe('01:01:01');
    expect(formatDuration(7200)).toBe('02:00:00');
  });

  it('clamp negativos a 0', () => {
    expect(formatDuration(-30)).toBe('00:00');
  });

  it('redondea fracciones a piso', () => {
    expect(formatDuration(59.9)).toBe('00:59');
  });
});
