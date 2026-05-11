import path from 'node:path';
import { defineConfig } from 'vitest/config';

/**
 * Vitest config para apps/web.
 *
 * Solo cubre pure functions de `src/lib/**` (scoring, csv, state, etc.).
 * Componentes React + Server Actions + route handlers se testean con
 * Playwright E2E (test:e2e) — no aquí.
 *
 * Alias `@/*` → `./src/*` matchea el tsconfig.json para que las pure
 * functions puedan importar tipos/helpers sin paths relativos largos.
 */
export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['src/lib/**/*.{test,spec}.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
