/**
 * Augmentación de matchers de Vitest:
 * - jest-dom: toBeInTheDocument, toHaveClass, toHaveAttribute, etc.
 * - jest-axe: toHaveNoViolations
 *
 * Sin esto, TypeScript no reconoce los matchers extra que `expect.extend`
 * registra en runtime desde test/setup.ts.
 */
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import 'vitest';

interface AxeMatchers<R = unknown> {
  toHaveNoViolations(): R;
}

declare module 'vitest' {
  // biome-ignore lint/suspicious/noExplicitAny: required by Vitest matcher augmentation pattern
  interface Assertion<T = any> extends TestingLibraryMatchers<T, void>, AxeMatchers<T> {}
  // biome-ignore lint/suspicious/noExplicitAny: required by Vitest matcher augmentation pattern
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, void>, AxeMatchers {}
}
