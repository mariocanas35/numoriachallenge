import type { Database } from '@numoria/database/types';

type AnswerType = Database['public']['Enums']['answer_type'];

/**
 * Devuelve un hint placeholder para el input según answer_type del problema.
 * Función pura (sin React deps) para poder llamarse desde Server Components
 * o Client Components.
 */
export function inputHintForType(type: AnswerType, locale: 'es' | 'en'): string {
  const ej = locale === 'es' ? 'Ej:' : 'E.g.:';
  switch (type) {
    case 'integer':
      return `${ej} 42`;
    case 'pair_integer':
      return `${ej} 3, 5`;
    case 'pair_decimal':
      return `${ej} 1.40, 1.60`;
    case 'decimal_cents':
      return `${ej} 1.40`;
    case 'fraction_simplified':
      return `${ej} 3/8`;
    case 'symbolic_pi':
      return `${ej} 12π`;
    case 'with_units':
      return locale === 'es' ? 'Incluye unidades' : 'Include units';
    case 'multiple_choice':
      return `${ej} A`;
    default:
      return '';
  }
}
