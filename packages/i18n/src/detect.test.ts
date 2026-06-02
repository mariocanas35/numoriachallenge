import { describe, expect, it } from 'vitest';
import { detectLocale, parseAcceptLanguage } from './detect';

describe('parseAcceptLanguage', () => {
  it('extrae idioma del header simple', () => {
    expect(parseAcceptLanguage('en')).toBe('en');
    expect(parseAcceptLanguage('es')).toBe('es');
  });

  it('quita la región (en-US → en)', () => {
    expect(parseAcceptLanguage('en-US')).toBe('en');
    expect(parseAcceptLanguage('pt-BR')).toBe('pt');
    expect(parseAcceptLanguage('es-HN')).toBe('es');
  });

  it('toma solo el primer idioma cuando hay lista', () => {
    expect(parseAcceptLanguage('es-HN,es;q=0.9,en;q=0.8')).toBe('es');
    expect(parseAcceptLanguage('pt-BR,pt;q=0.9,en-US;q=0.5')).toBe('pt');
  });

  it('devuelve null para input vacío', () => {
    expect(parseAcceptLanguage('')).toBeNull();
    expect(parseAcceptLanguage('   ')).toBeNull();
  });

  it('case insensitive', () => {
    expect(parseAcceptLanguage('EN-US')).toBe('en');
    expect(parseAcceptLanguage('ES-mx')).toBe('es');
  });
});

describe('detectLocale — prioridad de fuentes', () => {
  it('1. cookie preference gana sobre todo lo demás', () => {
    expect(
      detectLocale({
        cookieLocale: 'en',
        countryCode: 'BR', // sería pt
        acceptLanguage: 'es',
      }),
    ).toBe('en');
  });

  it('cookie inválida es ignorada', () => {
    expect(
      detectLocale({
        cookieLocale: 'fr',
        countryCode: 'HN',
      }),
    ).toBe('es');
  });

  it('cookie con locale inactivo (pt) se ignora hasta que se active', () => {
    expect(
      detectLocale({
        cookieLocale: 'pt',
        countryCode: 'US',
      }),
    ).toBe('en'); // BR daría pt pero pt no está active todavía
  });

  it('2. accept-language (idioma del navegador) cuando no hay cookie', () => {
    expect(detectLocale({ acceptLanguage: 'en-US' })).toBe('en');
    expect(detectLocale({ acceptLanguage: 'es-HN' })).toBe('es');
  });

  it('el idioma del navegador gana sobre el país', () => {
    // Navegador en inglés pero IP en país hispano → inglés (idioma de la persona)
    expect(
      detectLocale({
        cookieLocale: null,
        countryCode: 'HN',
        acceptLanguage: 'en-US,en;q=0.9',
      }),
    ).toBe('en');

    // Navegador en español pero IP en país anglófono → español
    expect(
      detectLocale({
        cookieLocale: null,
        countryCode: 'US',
        acceptLanguage: 'es-419,es;q=0.9',
      }),
    ).toBe('es');
  });

  it('3. country code detecta locale cuando no hay cookie ni idioma de navegador', () => {
    expect(detectLocale({ countryCode: 'HN' })).toBe('es');
    expect(detectLocale({ countryCode: 'MX' })).toBe('es');
    expect(detectLocale({ countryCode: 'US' })).toBe('en');
    expect(detectLocale({ countryCode: 'GB' })).toBe('en');
  });

  it('country es respaldo cuando el navegador pide un idioma no soportado', () => {
    // Navegador en francés (no soportado) + IP en US → en (por país)
    expect(
      detectLocale({
        countryCode: 'US',
        acceptLanguage: 'fr-FR,fr;q=0.9',
      }),
    ).toBe('en');
    // Navegador en francés + IP en MX → es (por país)
    expect(
      detectLocale({
        countryCode: 'MX',
        acceptLanguage: 'fr',
      }),
    ).toBe('es');
  });

  it('country con locale inactivo (BR → pt) cae al siguiente nivel', () => {
    // BR mapea a pt pero pt no está activo → debe caer a accept-language o default
    expect(
      detectLocale({
        countryCode: 'BR',
        acceptLanguage: 'en-US',
      }),
    ).toBe('en');

    expect(detectLocale({ countryCode: 'BR' })).toBe('es'); // default
  });

  it('accept-language con idioma inactivo cae al default', () => {
    expect(detectLocale({ acceptLanguage: 'pt-BR' })).toBe('es'); // pt no activo
    expect(detectLocale({ acceptLanguage: 'fr' })).toBe('es');
  });

  it('4. defaultLocale cuando no hay ninguna señal', () => {
    expect(detectLocale({})).toBe('es');
    expect(
      detectLocale({
        cookieLocale: null,
        countryCode: null,
        acceptLanguage: null,
      }),
    ).toBe('es');
  });

  it('caso real Honduras: sin cookie, IP HN, browser español', () => {
    expect(
      detectLocale({
        cookieLocale: null,
        countryCode: 'HN',
        acceptLanguage: 'es-HN,es;q=0.9,en;q=0.8',
      }),
    ).toBe('es');
  });

  it('caso real USA: visitante en USA con browser inglés', () => {
    expect(
      detectLocale({
        cookieLocale: null,
        countryCode: 'US',
        acceptLanguage: 'en-US,en;q=0.9',
      }),
    ).toBe('en');
  });

  it('caso real expat: hondureño en USA quiere español manualmente', () => {
    expect(
      detectLocale({
        cookieLocale: 'es', // override manual
        countryCode: 'US',
        acceptLanguage: 'en-US',
      }),
    ).toBe('es');
  });
});
