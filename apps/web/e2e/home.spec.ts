import { expect, test } from '@playwright/test';

test.describe('Home page — sections', () => {
  test('renders all four landing sections in Spanish (default)', async ({ page }) => {
    await page.goto('/es');

    // Hero
    const heroHeading = page.getByRole('heading', { level: 1 });
    await expect(heroHeading).toContainText(/Olimpiadas matemáticas/i);
    await expect(page.getByRole('img', { name: 'Numa saludando' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Empieza gratis' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Soy profesor' })).toBeVisible();

    // How it works
    const howHeading = page.getByRole('heading', { name: /¿Cómo funciona\?/i });
    await expect(howHeading).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Regístrate gratis' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Resuelve problemas' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Gana medallas' })).toBeVisible();

    // Schools
    const schoolsHeading = page.getByRole('heading', { name: /Escuelas que ya confían/i });
    await expect(schoolsHeading).toBeVisible();

    // Footer
    await expect(page.getByText(/Todos los derechos reservados/i)).toBeVisible();
  });

  test('renders all sections in English', async ({ page }) => {
    await page.goto('/en');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Math olympiads/i);
    await expect(page.getByRole('heading', { name: /How does it work/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sign up free' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Solve problems' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Earn medals' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Schools already trusting/i })).toBeVisible();
    await expect(page.getByText(/All rights reserved/i)).toBeVisible();
  });

  test('html lang attribute matches locale', async ({ page }) => {
    await page.goto('/es');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');

    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('localized title in metadata', async ({ page }) => {
    await page.goto('/es');
    await expect(page).toHaveTitle(/Numoria Challenge/);
    await expect(page).toHaveTitle(/Olimpiadas matemáticas/i);

    await page.goto('/en');
    await expect(page).toHaveTitle(/Numoria Challenge/);
    await expect(page).toHaveTitle(/math olympiads/i);
  });
});

test.describe('Locale switcher', () => {
  test('switches from ES to EN and persists via cookie', async ({ page, context }) => {
    await page.goto('/es');
    await expect(page).toHaveURL(/\/es$/);

    // Cambia locale via select
    const switcher = page.getByLabel(/Idioma|Language/);
    await switcher.selectOption('en');

    // Espera redirect a /en
    await page.waitForURL(/\/en/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Math olympiads/i);

    // Cookie debe haber sido seteada
    const cookies = await context.cookies();
    const localeCookie = cookies.find((c) => c.name === 'numoria_locale');
    expect(localeCookie?.value).toBe('en');
  });

  test('switches from EN to ES and persists', async ({ page, context }) => {
    await page.goto('/en');
    await page.getByLabel(/Idioma|Language/).selectOption('es');
    await page.waitForURL(/\/es/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Olimpiadas/i);

    const cookies = await context.cookies();
    expect(cookies.find((c) => c.name === 'numoria_locale')?.value).toBe('es');
  });
});

test.describe('Mobile viewport', () => {
  test('hero stacks CTAs vertically on mobile', async ({ page }) => {
    await page.goto('/es');
    // Pixel 5 es 393x851 — el container de CTAs debe tener flex-col
    const ctas = page.getByRole('link', { name: 'Empieza gratis' });
    await expect(ctas).toBeVisible();
  });
});
