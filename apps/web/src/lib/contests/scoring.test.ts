import { describe, expect, it } from 'vitest';
import { compareAnswers, normalizeAnswer, scoreProblemAttempt } from './scoring';

describe('normalizeAnswer', () => {
  describe('integer', () => {
    it('trims whitespace', () => {
      expect(normalizeAnswer('  85  ', 'integer')).toBe('85');
    });
    it('removes plus sign and internal spaces', () => {
      expect(normalizeAnswer('+85', 'integer')).toBe('85');
      expect(normalizeAnswer('85 ', 'integer')).toBe('85');
    });
    it('strips thousands separators (commas)', () => {
      expect(normalizeAnswer('1,000', 'integer')).toBe('1000');
    });
    it('strips leading zeros (but preserves negative sign)', () => {
      expect(normalizeAnswer('0085', 'integer')).toBe('85');
      expect(normalizeAnswer('-085', 'integer')).toBe('-85');
    });
  });

  describe('decimal_cents', () => {
    it('normalizes $1.40 → 1.40', () => {
      expect(normalizeAnswer('$1.40', 'decimal_cents')).toBe('1.40');
    });
    it('pads to 2 decimals (1.4 → 1.40)', () => {
      expect(normalizeAnswer('1.4', 'decimal_cents')).toBe('1.40');
    });
    it('handles integer inputs (1 → 1.00)', () => {
      expect(normalizeAnswer('1', 'decimal_cents')).toBe('1.00');
    });
  });

  describe('pair_integer / pair_decimal', () => {
    it('normalizes "3, 5" → "3,5"', () => {
      expect(normalizeAnswer('3, 5', 'pair_integer')).toBe('3,5');
    });
    it('accepts semicolons and whitespace separator', () => {
      expect(normalizeAnswer('3; 5', 'pair_integer')).toBe('3,5');
      expect(normalizeAnswer('3 5', 'pair_integer')).toBe('3,5');
    });
    it('preserves order (not commutative)', () => {
      expect(normalizeAnswer('5,3', 'pair_integer')).toBe('5,3');
    });
  });

  describe('fraction_simplified', () => {
    it('removes spaces around slash', () => {
      expect(normalizeAnswer('3 / 8', 'fraction_simplified')).toBe('3/8');
    });
  });

  describe('symbolic_pi', () => {
    it('normalizes "12 pi" → "12π"', () => {
      expect(normalizeAnswer('12 pi', 'symbolic_pi')).toBe('12π');
      expect(normalizeAnswer('12pi', 'symbolic_pi')).toBe('12π');
      expect(normalizeAnswer('12π', 'symbolic_pi')).toBe('12π');
    });
  });

  describe('with_units', () => {
    it('normalizes "48 cm^2" → "48 cm²"', () => {
      expect(normalizeAnswer('48 cm^2', 'with_units')).toBe('48 cm²');
    });
    it('normalizes "48cm2" → "48 cm²"', () => {
      expect(normalizeAnswer('48cm2', 'with_units')).toBe('48 cm²');
    });
    it('preserves "48 cm²" unchanged', () => {
      expect(normalizeAnswer('48 cm²', 'with_units')).toBe('48 cm²');
    });
  });

  describe('multiple_choice', () => {
    it('extracts first character uppercase', () => {
      expect(normalizeAnswer('a', 'multiple_choice')).toBe('A');
      expect(normalizeAnswer('A) The answer', 'multiple_choice')).toBe('A');
    });
  });

  describe('empty input', () => {
    it('returns empty string for all blank inputs', () => {
      expect(normalizeAnswer('', 'integer')).toBe('');
      expect(normalizeAnswer('   ', 'integer')).toBe('');
    });
  });
});

describe('compareAnswers', () => {
  describe('integer', () => {
    it('matches identical integers', () => {
      expect(compareAnswers('85', '85', 'integer')).toBe(true);
    });
    it('matches with leading/trailing whitespace', () => {
      expect(compareAnswers(' 85 ', '85', 'integer')).toBe(true);
    });
    it('rejects different integers', () => {
      expect(compareAnswers('86', '85', 'integer')).toBe(false);
    });
    it('rejects empty submitted', () => {
      expect(compareAnswers('', '85', 'integer')).toBe(false);
    });
  });

  describe('fraction_simplified — cross-multiply equivalence', () => {
    it('accepts 6/16 as equivalent to 3/8 (simplified)', () => {
      expect(compareAnswers('6/16', '3/8', 'fraction_simplified')).toBe(true);
    });
    it('accepts integer-form "1" as equivalent to "2/2"', () => {
      expect(compareAnswers('1', '2/2', 'fraction_simplified')).toBe(true);
    });
    it('rejects 3/8 vs 4/8', () => {
      expect(compareAnswers('4/8', '3/8', 'fraction_simplified')).toBe(false);
    });
    it('handles negative fractions', () => {
      expect(compareAnswers('-3/8', '-3/8', 'fraction_simplified')).toBe(true);
      expect(compareAnswers('3/-8', '-3/8', 'fraction_simplified')).toBe(true);
    });
  });

  describe('with_units — case-insensitive', () => {
    it('matches "44 CM²" with "44 cm²"', () => {
      expect(compareAnswers('44 CM²', '44 cm²', 'with_units')).toBe(true);
    });
    it('matches "44cm2" with "44 cm²" after normalization', () => {
      expect(compareAnswers('44cm2', '44 cm²', 'with_units')).toBe(true);
    });
  });

  describe('decimal_cents', () => {
    it('matches "$1.40" with "1.40"', () => {
      expect(compareAnswers('$1.40', '1.40', 'decimal_cents')).toBe(true);
    });
    it('matches "1.4" with "1.40" (auto-padding)', () => {
      expect(compareAnswers('1.4', '1.40', 'decimal_cents')).toBe(true);
    });
  });

  describe('multiple_choice', () => {
    it('case-insensitive single letter', () => {
      expect(compareAnswers('a', 'A', 'multiple_choice')).toBe(true);
    });
    it('extracts first letter from prose answers', () => {
      expect(compareAnswers('A) The right answer', 'A', 'multiple_choice')).toBe(true);
    });
  });

  describe('symbolic_pi', () => {
    it('matches "12 pi" with "12π"', () => {
      expect(compareAnswers('12 pi', '12π', 'symbolic_pi')).toBe(true);
    });
  });
});

describe('scoreProblemAttempt', () => {
  it('awards full points when correct', () => {
    expect(
      scoreProblemAttempt({
        submitted: '85',
        expected: '85',
        type: 'integer',
        problemPoints: 3,
      }),
    ).toEqual({ isCorrect: true, pointsEarned: 3 });
  });

  it('awards 0 points when incorrect', () => {
    expect(
      scoreProblemAttempt({
        submitted: '86',
        expected: '85',
        type: 'integer',
        problemPoints: 3,
      }),
    ).toEqual({ isCorrect: false, pointsEarned: 0 });
  });

  it('awards 0 points when submitted is null', () => {
    expect(
      scoreProblemAttempt({
        submitted: null,
        expected: '85',
        type: 'integer',
        problemPoints: 3,
      }),
    ).toEqual({ isCorrect: false, pointsEarned: 0 });
  });

  it('awards 0 points when submitted is empty/whitespace', () => {
    expect(
      scoreProblemAttempt({
        submitted: '   ',
        expected: '85',
        type: 'integer',
        problemPoints: 3,
      }),
    ).toEqual({ isCorrect: false, pointsEarned: 0 });
  });

  it('handles the historical P3 bug (with_units "44" before fix)', () => {
    // Pre-fix: P3 esperaba "44 cm²" pero student envió "44" → false
    // Este test documenta el bug fixed por migration 0017 + decisión "with_units
    // solo si la unidad discrimina"
    const result = scoreProblemAttempt({
      submitted: '44',
      expected: '44 cm²',
      type: 'with_units',
      problemPoints: 2,
    });
    expect(result.isCorrect).toBe(false); // sin unidades en input → no match con_units
  });

  it('handles P3 post-fix (integer "44" matches "44")', () => {
    const result = scoreProblemAttempt({
      submitted: '44',
      expected: '44',
      type: 'integer',
      problemPoints: 2,
    });
    expect(result).toEqual({ isCorrect: true, pointsEarned: 2 });
  });
});
