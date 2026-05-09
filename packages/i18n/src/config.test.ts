import { describe, expect, it } from 'vitest';
import {
  BRAND_NAME,
  MASCOT_NAME,
  activeLocales,
  defaultLocale,
  isActiveLocale,
  isLocale,
  localeDisplayNames,
  localeFlags,
  locales,
} from './config';

describe('config', () => {
  it('exposes the canonical brand name', () => {
    expect(BRAND_NAME).toBe('Numoria Challenge');
  });

  it('exposes the mascot name as Numa', () => {
    expect(MASCOT_NAME).toBe('Numa');
  });

  it('lists three planned locales (es, en, pt)', () => {
    expect(locales).toEqual(['es', 'en', 'pt']);
  });

  it('defaults to Spanish', () => {
    expect(defaultLocale).toBe('es');
  });

  it('only marks es and en as active for the MVP', () => {
    expect(activeLocales).toEqual(['es', 'en']);
  });

  it('isLocale narrows valid string values', () => {
    expect(isLocale('es')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('pt')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale('')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(isLocale(123)).toBe(false);
  });

  it('isActiveLocale rejects pt while it is still inactive', () => {
    expect(isActiveLocale('es')).toBe(true);
    expect(isActiveLocale('en')).toBe(true);
    expect(isActiveLocale('pt')).toBe(false);
    expect(isActiveLocale('xx')).toBe(false);
  });

  it('provides display names in each locale', () => {
    expect(localeDisplayNames.es).toBe('Español');
    expect(localeDisplayNames.en).toBe('English');
    expect(localeDisplayNames.pt).toBe('Português');
  });

  it('provides flag emojis for selectors', () => {
    for (const locale of locales) {
      // Emoji flags son surrogate pairs — verificamos longitud > 0 y no-ASCII
      const flag = localeFlags[locale];
      expect(flag).toBeTruthy();
      expect(flag.length).toBeGreaterThanOrEqual(2);
      expect(flag.charCodeAt(0)).toBeGreaterThan(127);
    }
  });
});
