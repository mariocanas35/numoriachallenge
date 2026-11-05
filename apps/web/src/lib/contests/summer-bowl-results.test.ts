import { describe, expect, it, vi } from 'vitest';

vi.mock('@numoria/database/server', () => ({ createAdminClient: vi.fn() }));

import { formatPublicName, median, rankByScore } from './summer-bowl-results';

describe('formatPublicName', () => {
  it('shows first name and last initial', () => {
    expect(formatPublicName('Carlos Andonie')).toBe('Carlos A.');
    expect(formatPublicName('Sebastian F')).toBe('Sebastian F.');
  });

  it('splits usernames on dots and drops numbers', () => {
    expect(formatPublicName('ricardo.jacome.2012')).toBe('Ricardo J.');
  });

  it('drops emojis and digits', () => {
    expect(formatPublicName('Dennis Portillo 7 🥶')).toBe('Dennis P.');
  });

  it('keeps accents and capitalizes', () => {
    expect(formatPublicName('maría josé álvarez')).toBe('María Á.');
  });

  it('shows only the initial for single-word usernames', () => {
    expect(formatPublicName('fvalerio528')).toBe('F.');
  });

  it('keeps a clean single first name', () => {
    expect(formatPublicName('Cesar')).toBe('Cesar');
  });

  it('handles empty names', () => {
    expect(formatPublicName('')).toBe('—');
    expect(formatPublicName(null)).toBe('—');
    expect(formatPublicName('1234 🥶')).toBe('—');
  });
});

describe('rankByScore', () => {
  it('gives ties the same rank and skips the next one', () => {
    const ranked = rankByScore([
      { name: 'Ana', score: 12 },
      { name: 'Luis', score: 13 },
      { name: 'Beto', score: 12 },
      { name: 'Eva', score: 10 },
    ]);
    expect(ranked.map((r) => [r.name, r.rank])).toEqual([
      ['Luis', 1],
      ['Ana', 2],
      ['Beto', 2],
      ['Eva', 4],
    ]);
  });
});

describe('median', () => {
  it('handles odd, even and empty lists', () => {
    expect(median([13, 12, 12, 10, 9, 7, 6])).toBe(10);
    expect(median([1, 3])).toBe(2);
    expect(median([])).toBe(0);
  });
});
