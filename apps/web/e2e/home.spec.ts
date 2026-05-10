import { expect, test } from '@playwright/test';

test.describe('Home page', () => {
  test('renders Spanish hero by default (no Accept-Language)', async ({ page }) => {
    await page.goto('/es');
    await expect(page).toHaveURL(/\/es$/);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText(/Olimpiadas matemáticas/i);

    // Numa avatar visible y accesible
    await expect(page.getByRole('img', { name: 'Numa saludando' })).toBeVisible();

    // CTAs presentes
    await expect(page.getByRole('link', { name: 'Empieza gratis' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Soy profesor' })).toBeVisible();
  });

  test('renders English hero on /en', async ({ page }) => {
    await page.goto('/en');
    await expect(page).toHaveURL(/\/en$/);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText(/Math olympiads/i);

    await expect(page.getByRole('link', { name: 'Start free' })).toBeVisible();
    await expect(page.getByRole('link', { name: "I'm a teacher" })).toBeVisible();
  });

  test('html lang attribute matches locale', async ({ page }) => {
    await page.goto('/es');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');

    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('has correct localized metadata title', async ({ page }) => {
    await page.goto('/es');
    await expect(page).toHaveTitle(/Numoria Challenge/);

    await page.goto('/en');
    await expect(page).toHaveTitle(/Numoria Challenge/);
  });
});
