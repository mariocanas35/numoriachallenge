/**
 * Augmentación de matchers de Vitest con jest-axe.
 *
 * Permite que `expect(results).toHaveNoViolations()` esté tipada correctamente.
 */
import 'vitest';

interface AxeMatchers<R = unknown> {
  toHaveNoViolations(): R;
}

declare module 'vitest' {
  // biome-ignore lint/suspicious/noExplicitAny: required by Vitest matcher augmentation pattern
  interface Assertion<T = any> extends AxeMatchers<T> {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
