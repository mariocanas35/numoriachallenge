/**
 * Vitest setup — Testing Library matchers + auto cleanup + jest-axe a11y.
 *
 * @testing-library/react no hace cleanup automático con Vitest cuando
 * `globals: false`. Lo registramos aquí explícitamente.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { toHaveNoViolations } from 'jest-axe';
import { afterEach, expect } from 'vitest';

expect.extend(toHaveNoViolations);

afterEach(() => {
  cleanup();
});
