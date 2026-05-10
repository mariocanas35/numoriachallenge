import { expect, test } from '@playwright/test';

test.describe('Locale detection middleware', () => {
  test('redirects / to /es by default (no signals)', async ({ page }) => {
    const response = await page.goto('/');
    // Following the redirect, final URL is /es
    expect(page.url()).toMatch(/\/es$/);
    expect(response?.status()).toBeLessThan(400);
  });

  test('respects Accept-Language: en when no cookie or country', async ({ browser }) => {
    const context = await browser.newContext({
      locale: 'en-US',
      extraHTTPHeaders: { 'accept-language': 'en-US,en;q=0.9' },
    });
    const page = await context.newPage();
    await page.goto('/');
    expect(page.url()).toMatch(/\/en$/);
    await context.close();
  });

  test('respects numoria_locale cookie over geo and Accept-Language', async ({ browser }) => {
    const context = await browser.newContext({
      locale: 'en-US',
      extraHTTPHeaders: { 'accept-language': 'en-US,en;q=0.9' },
    });
    await context.addCookies([
      {
        name: 'numoria_locale',
        value: 'es',
        url: 'http://localhost:3000',
      },
    ]);
    const page = await context.newPage();
    await page.goto('/');
    expect(page.url()).toMatch(/\/es$/);
    await context.close();
  });

  test('respects cf-ipcountry header (HN → es)', async ({ browser }) => {
    const context = await browser.newContext({
      extraHTTPHeaders: { 'cf-ipcountry': 'HN', 'accept-language': 'en-US' },
    });
    const page = await context.newPage();
    await page.goto('/');
    // HN → es (overrides Accept-Language)
    expect(page.url()).toMatch(/\/es$/);
    await context.close();
  });

  test('respects cf-ipcountry header (US → en)', async ({ browser }) => {
    const context = await browser.newContext({
      extraHTTPHeaders: { 'cf-ipcountry': 'US' },
    });
    const page = await context.newPage();
    await page.goto('/');
    expect(page.url()).toMatch(/\/en$/);
    await context.close();
  });

  test('preserves path while redirecting (e.g. /about → /es/about)', async ({ page }) => {
    // Path doesn't exist yet, but middleware should still preserve it before next.js 404s
    const response = await page.goto('/some-path', { waitUntil: 'commit' });
    expect(page.url()).toMatch(/\/es\/some-path$/);
    expect(response).toBeTruthy();
  });
});
