import { describe, expect, it } from 'vitest';
import { toCSV } from './csv';

describe('toCSV', () => {
  const BOM = '﻿';

  it('returns just BOM for empty array', () => {
    expect(toCSV([])).toBe(BOM);
  });

  it('emits header from first row keys, preserves order', () => {
    const csv = toCSV([{ name: 'Mario', score: 14, grade: 5 }]);
    expect(csv).toBe(`${BOM}name,score,grade\r\nMario,14,5`);
  });

  it('joins multiple rows with CRLF', () => {
    const csv = toCSV([
      { rank: 1, name: 'Mario' },
      { rank: 2, name: 'Ana' },
    ]);
    expect(csv).toBe(`${BOM}rank,name\r\n1,Mario\r\n2,Ana`);
  });

  it('quotes values containing commas', () => {
    const csv = toCSV([{ team: 'Águilas, 6º grado' }]);
    expect(csv).toBe(`${BOM}team\r\n"Águilas, 6º grado"`);
  });

  it('escapes double quotes by doubling them', () => {
    const csv = toCSV([{ note: 'She said "hello"' }]);
    expect(csv).toBe(`${BOM}note\r\n"She said ""hello"""`);
  });

  it('quotes values containing newlines (LF and CRLF)', () => {
    const csvLF = toCSV([{ desc: 'line1\nline2' }]);
    expect(csvLF).toBe(`${BOM}desc\r\n"line1\nline2"`);

    const csvCRLF = toCSV([{ desc: 'line1\r\nline2' }]);
    expect(csvCRLF).toBe(`${BOM}desc\r\n"line1\r\nline2"`);
  });

  it('renders null and undefined as empty cells', () => {
    const csv = toCSV([{ a: null, b: undefined, c: 0 }]);
    expect(csv).toBe(`${BOM}a,b,c\r\n,,0`);
  });

  it('stringifies numbers and booleans', () => {
    const csv = toCSV([{ score: 14.5, passed: true, blank: false }]);
    expect(csv).toBe(`${BOM}score,passed,blank\r\n14.5,true,false`);
  });

  it('preserves accented characters (tildes) — needs BOM for Excel UTF-8 detection', () => {
    const csv = toCSV([{ name: 'Mario Cañas', team: 'Águilas' }]);
    expect(csv).toBe(`${BOM}name,team\r\nMario Cañas,Águilas`);
    // BOM is what makes Excel read UTF-8 correctly; if dropped, "Cañas" → "CaÃ±as"
    expect(csv.startsWith(BOM)).toBe(true);
  });
});
