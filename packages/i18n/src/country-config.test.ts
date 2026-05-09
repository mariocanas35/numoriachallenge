import { describe, expect, it } from 'vitest';
import {
  COUNTRY_CONFIG,
  DEFAULT_COUNTRY,
  getCountriesByLocale,
  getCountryConfig,
  isSupportedCountry,
  listSupportedCountries,
} from './country-config';

describe('country-config', () => {
  describe('Honduras (mercado prioritario)', () => {
    it('mapea HN → es / HNL / America/Tegucigalpa', () => {
      const cfg = getCountryConfig('HN');
      expect(cfg.locale).toBe('es');
      expect(cfg.currency).toBe('HNL');
      expect(cfg.symbol).toBe('L');
      expect(cfg.timezone).toBe('America/Tegucigalpa');
      expect(cfg.flag).toBe('🇭🇳');
      expect(cfg.name.es).toBe('Honduras');
    });
  });

  describe('Brasil (locale pt)', () => {
    it('mapea BR → pt / BRL / America/Sao_Paulo', () => {
      const cfg = getCountryConfig('BR');
      expect(cfg.locale).toBe('pt');
      expect(cfg.currency).toBe('BRL');
      expect(cfg.symbol).toBe('R$');
      expect(cfg.timezone).toBe('America/Sao_Paulo');
      expect(cfg.name.es).toBe('Brasil');
      expect(cfg.name.en).toBe('Brazil');
    });
  });

  describe('USA / mercados anglo', () => {
    it('mapea US → en / USD / America/New_York', () => {
      const cfg = getCountryConfig('US');
      expect(cfg.locale).toBe('en');
      expect(cfg.currency).toBe('USD');
      expect(cfg.timezone).toBe('America/New_York');
    });

    it('mapea GB → en / GBP / Europe/London', () => {
      const cfg = getCountryConfig('GB');
      expect(cfg.currency).toBe('GBP');
      expect(cfg.symbol).toBe('£');
    });
  });

  describe('países dolarizados de LatAm', () => {
    it('SV usa USD', () => {
      expect(getCountryConfig('SV').currency).toBe('USD');
    });
    it('EC usa USD', () => {
      expect(getCountryConfig('EC').currency).toBe('USD');
    });
    it('PA usa USD', () => {
      expect(getCountryConfig('PA').currency).toBe('USD');
    });
    it('PR usa USD', () => {
      expect(getCountryConfig('PR').currency).toBe('USD');
    });
  });

  describe('fallback por defecto', () => {
    it('países desconocidos caen al DEFAULT_COUNTRY', () => {
      expect(getCountryConfig('XX')).toEqual(DEFAULT_COUNTRY);
      expect(getCountryConfig('zz')).toEqual(DEFAULT_COUNTRY);
    });

    it('null/undefined/empty también caen al default', () => {
      expect(getCountryConfig(null)).toEqual(DEFAULT_COUNTRY);
      expect(getCountryConfig(undefined)).toEqual(DEFAULT_COUNTRY);
      expect(getCountryConfig('')).toEqual(DEFAULT_COUNTRY);
    });

    it('default usa USD/en/UTC', () => {
      expect(DEFAULT_COUNTRY.currency).toBe('USD');
      expect(DEFAULT_COUNTRY.locale).toBe('en');
      expect(DEFAULT_COUNTRY.timezone).toBe('UTC');
    });
  });

  describe('case insensitivity', () => {
    it('mx, Mx, MX devuelven la misma config', () => {
      const a = getCountryConfig('mx');
      const b = getCountryConfig('Mx');
      const c = getCountryConfig('MX');
      expect(a).toEqual(b);
      expect(b).toEqual(c);
      expect(c.currency).toBe('MXN');
    });

    it('whitespace en código no rompe', () => {
      expect(getCountryConfig('  hn  ').currency).toBe('HNL');
    });
  });

  describe('isSupportedCountry', () => {
    it('reconoce los 22 países preconfigurados', () => {
      const countries = [
        'HN',
        'GT',
        'SV',
        'NI',
        'CR',
        'PA',
        'MX',
        'CO',
        'PE',
        'EC',
        'CL',
        'AR',
        'UY',
        'PY',
        'BO',
        'VE',
        'DO',
        'PR',
        'CU',
        'BR',
        'PT',
        'US',
      ];
      for (const c of countries) {
        expect(isSupportedCountry(c)).toBe(true);
      }
    });

    it('rechaza países no listados', () => {
      expect(isSupportedCountry('XX')).toBe(false);
      expect(isSupportedCountry('JP')).toBe(false);
      expect(isSupportedCountry(null)).toBe(false);
      expect(isSupportedCountry(undefined)).toBe(false);
    });
  });

  describe('getCountriesByLocale', () => {
    it('devuelve todos los países hispanohablantes', () => {
      const esCountries = getCountriesByLocale('es');
      expect(esCountries.length).toBeGreaterThan(15);
      const codes = esCountries.map(([code]) => code);
      expect(codes).toContain('HN');
      expect(codes).toContain('MX');
      expect(codes).toContain('AR');
      expect(codes).not.toContain('BR');
      expect(codes).not.toContain('US');
    });

    it('devuelve solo BR y PT para pt', () => {
      const ptCountries = getCountriesByLocale('pt');
      const codes = ptCountries.map(([code]) => code);
      expect(codes).toEqual(expect.arrayContaining(['BR', 'PT']));
      expect(codes).toHaveLength(2);
    });
  });

  describe('integridad del registro', () => {
    it('todas las configs tienen los campos obligatorios', () => {
      for (const [code, cfg] of Object.entries(COUNTRY_CONFIG)) {
        expect(cfg.locale, `${code} locale`).toBeTruthy();
        expect(cfg.currency, `${code} currency`).toMatch(/^[A-Z]{3}$/);
        expect(cfg.symbol, `${code} symbol`).toBeTruthy();
        expect(cfg.timezone, `${code} timezone`).toMatch(/^[A-Z][a-zA-Z_]+\/[A-Za-z_]+/);
        expect(cfg.flag, `${code} flag`).toBeTruthy();
        expect(cfg.name.es, `${code} name.es`).toBeTruthy();
        expect(cfg.name.en, `${code} name.en`).toBeTruthy();
        expect(cfg.name.pt, `${code} name.pt`).toBeTruthy();
      }
    });

    it('listSupportedCountries devuelve todos los códigos', () => {
      const list = listSupportedCountries();
      expect(list.length).toBe(Object.keys(COUNTRY_CONFIG).length);
      expect(list).toContain('HN');
      expect(list).toContain('BR');
    });
  });
});
