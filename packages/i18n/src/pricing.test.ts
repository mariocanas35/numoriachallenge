import { describe, expect, it } from 'vitest';
import { convertUsdCents, formatLocalCurrency, formatPrice } from './pricing';

describe('formatPrice', () => {
  it('convierte USD a HNL con tasa de cambio', () => {
    const result = formatPrice(500_00, 'HN', { HNL: 24.5 });
    expect(result.currency).toBe('HNL');
    expect(result.symbol).toBe('L');
    expect(result.amountCents).toBe(1_225_000); // 5 USD * 24.5 = 122.50 HNL = 12250 cents
    // El formato exacto depende del CLDR pero debe contener el monto
    expect(result.formatted).toMatch(/12.?250/);
  });

  it('convierte USD a BRL en formato pt-BR', () => {
    // 1000 USD * 5 BRL/USD = 5000 BRL → 500_000 cents (digits=2)
    const result = formatPrice(1000_00, 'BR', { BRL: 5.0 });
    expect(result.currency).toBe('BRL');
    expect(result.symbol).toBe('R$');
    expect(result.amountCents).toBe(500_000);
    expect(result.formatted).toMatch(/5\.?000/);
  });

  it('respeta monedas sin decimales (CLP, PYG, COP)', () => {
    // 100 USD * 950 CLP/USD = 95000 CLP → 95000 cents (digits=0, factor 1)
    const clp = formatPrice(100_00, 'CL', { CLP: 950 });
    expect(clp.currency).toBe('CLP');
    expect(clp.amountCents).toBe(95_000);
    // No debe haber sufijo decimal — el número termina en `000` (separador de miles)
    // sin separador decimal seguido de dígitos. Ej válidos: '$95.000', '$95,000', 'CLP 95000'
    // Inválido: '$95.000,00', '$95,000.00'
    expect(clp.formatted).not.toMatch(/[.,]\d{2}$/);
  });

  it('asume 1:1 cuando falta exchange rate', () => {
    const result = formatPrice(100_00, 'MX');
    expect(result.currency).toBe('MXN');
    expect(result.amountCents).toBe(100_00);
  });

  it('usa USD para países dolarizados (SV, EC, PA)', () => {
    expect(formatPrice(50_00, 'SV').currency).toBe('USD');
    expect(formatPrice(50_00, 'EC').currency).toBe('USD');
    expect(formatPrice(50_00, 'PA').currency).toBe('USD');
  });

  it('cae a default (USD/en) para países desconocidos', () => {
    const result = formatPrice(100_00, 'XX');
    expect(result.currency).toBe('USD');
    expect(result.symbol).toBe('$');
  });

  it('respeta locale override', () => {
    // Mismo país pero forzando locale en — el formato debe seguir reglas en-HN
    const result = formatPrice(100_00, 'HN', { HNL: 24.5 }, 'en');
    expect(result.currency).toBe('HNL');
    expect(result.formatted).toBeTruthy();
  });
});

describe('formatLocalCurrency', () => {
  it('formatea USD en en-US', () => {
    const out = formatLocalCurrency(1234.56, 'USD', 'en');
    expect(out).toContain('1,234.56');
    expect(out).toContain('$');
  });

  it('formatea HNL en es', () => {
    const out = formatLocalCurrency(1234.56, 'HNL', 'es');
    expect(out).toContain('1234');
  });

  it('CLP sin decimales', () => {
    const out = formatLocalCurrency(50000, 'CLP', 'es');
    expect(out).not.toMatch(/[.,]00\b/);
  });
});

describe('convertUsdCents', () => {
  it('convierte usando rate', () => {
    expect(convertUsdCents(100_00, 'HNL', { HNL: 24.5 })).toBeCloseTo(2450, 2);
  });

  it('asume 1:1 si falta rate', () => {
    expect(convertUsdCents(100_00, 'XYZ')).toBe(100);
  });

  it('case insensitive en target currency', () => {
    expect(convertUsdCents(100_00, 'hnl', { HNL: 24.5 })).toBeCloseTo(2450, 2);
  });
});
