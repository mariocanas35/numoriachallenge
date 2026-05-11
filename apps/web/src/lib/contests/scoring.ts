import type { Database } from '@numoria/database/types';

export type AnswerType = Database['public']['Enums']['answer_type'];

/**
 * Normaliza la respuesta del student a una forma canónica que pueda compararse
 * con `problems.expected_answer`.
 *
 * Reglas comunes:
 * - Trim whitespace
 * - Lowercase (excepto para casos donde mayúscula importa, ej. multiple_choice usa upper)
 * - Remueve espacios internos donde aplica
 * - Normaliza separadores (coma + espacios → solo coma)
 */
export function normalizeAnswer(raw: string, type: AnswerType): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  switch (type) {
    case 'integer':
      // Remover signos +, espacios, comas como miles
      return trimmed.replace(/[+\s,_]/g, '').replace(/^([-]?)0+(\d)/, '$1$2');

    case 'pair_integer':
    case 'pair_decimal': {
      // "1.40, 1.60" / "1.40,1.60" / "1.4, 1.6" → "1.40,1.60" (orden preservado)
      const parts = trimmed
        .split(/[,;]\s*|\s+/)
        .map((p) => p.trim())
        .filter(Boolean);
      if (parts.length !== 2) return trimmed; // formato inválido, dejar tal cual
      return parts.join(',');
    }

    case 'decimal_cents': {
      // "$1.40" → "1.40", "1.4" → "1.40" (2 decimales)
      const cleaned = trimmed.replace(/[$\s,]/g, '');
      const num = Number(cleaned);
      if (Number.isNaN(num)) return cleaned;
      return num.toFixed(2);
    }

    case 'fraction_simplified': {
      // "3 / 8" → "3/8"
      return trimmed.replace(/\s+/g, '');
    }

    case 'symbolic_pi': {
      // "12π", "12 pi", "12pi" → "12π" (estándar)
      return trimmed.toLowerCase().replace(/\s+/g, '').replace(/pi/g, 'π');
    }

    case 'with_units': {
      // "48 cm²", "48cm2", "48 cm^2" → normaliza a "48 cm²"
      // Estrategia: separa número + unidad, normaliza ^2 → ², limita espacios
      return trimmed
        .replace(/\s+/g, ' ')
        .replace(/\^2/g, '²')
        .replace(/\^3/g, '³')
        .replace(/cm2/gi, 'cm²')
        .replace(/cm3/gi, 'cm³')
        .replace(/m2/gi, 'm²')
        .replace(/(\d)\s+([a-zA-ZºμπΩ²³])/g, '$1 $2');
    }

    case 'multiple_choice':
      // "A", "a", "A) X..." → "A"
      return trimmed.charAt(0).toUpperCase();

    default:
      return trimmed;
  }
}

/**
 * Compara una respuesta del student (normalizada) contra expected_answer.
 * Type-aware: para algunos types acepta tolerancias razonables.
 */
export function compareAnswers(submitted: string, expected: string, type: AnswerType): boolean {
  const normalizedSubmitted = normalizeAnswer(submitted, type);
  const normalizedExpected = normalizeAnswer(expected, type);

  if (!normalizedSubmitted) return false;

  // Comparación case-insensitive para texto general, exacto para números
  switch (type) {
    case 'fraction_simplified': {
      // Acepta "6/16" como equivalente a "3/8" simplificando primero
      return fractionsEqual(normalizedSubmitted, normalizedExpected);
    }

    case 'with_units': {
      // Comparación liberal — ignora diferencias de mayúsculas en unidades
      return normalizedSubmitted.toLowerCase() === normalizedExpected.toLowerCase();
    }

    case 'symbolic_pi': {
      return normalizedSubmitted === normalizedExpected;
    }

    default:
      return normalizedSubmitted === normalizedExpected;
  }
}

/**
 * Compara dos fracciones representadas como "a/b" considerándolas equivalentes
 * si simplificadas son iguales. Acepta enteros sin "/" como "n/1".
 */
function fractionsEqual(a: string, b: string): boolean {
  const parseFraction = (s: string): [number, number] | null => {
    const match = s.match(/^([-]?\d+)\s*\/\s*([-]?\d+)$/);
    if (match) {
      const num = Number(match[1]);
      const denom = Number(match[2]);
      if (denom === 0 || Number.isNaN(num) || Number.isNaN(denom)) return null;
      return [num, denom];
    }
    // Integer like "5"
    const n = Number(s);
    if (!Number.isNaN(n)) return [n, 1];
    return null;
  };

  const fa = parseFraction(a);
  const fb = parseFraction(b);
  if (!fa || !fb) return false;

  // Cross-multiply: a/b === c/d  ⟺  a*d === c*b (con mismo signo)
  return fa[0] * fb[1] === fb[0] * fa[1];
}

/**
 * Resultado de scoring para un problem_attempt.
 */
export interface ScoringResult {
  isCorrect: boolean;
  pointsEarned: number;
}

export function scoreProblemAttempt(args: {
  submitted: string | null;
  expected: string;
  type: AnswerType;
  problemPoints: number;
}): ScoringResult {
  if (!args.submitted || !args.submitted.trim()) {
    return { isCorrect: false, pointsEarned: 0 };
  }
  const isCorrect = compareAnswers(args.submitted, args.expected, args.type);
  return {
    isCorrect,
    pointsEarned: isCorrect ? args.problemPoints : 0,
  };
}
