/**
 * CSV utility — pure functions para serializar tabular data.
 *
 * RFC 4180-ish: campos con comas, comillas o newlines son envueltos en `"`,
 * las comillas internas duplicadas. CRLF line endings (Excel-friendly) + BOM
 * para que Excel detecte UTF-8 correctamente con tildes y acentos del español.
 */

const BOM = '﻿';

type CSVValue = string | number | boolean | null | undefined;

/**
 * Escapa un valor individual según RFC 4180:
 * - null/undefined → cadena vacía
 * - boolean → 'true'/'false'
 * - number → toString
 * - string con coma/comilla/CR/LF → envuelto en " con " duplicadas
 */
function escapeCell(v: CSVValue): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Convierte un array de objetos en un string CSV.
 *
 * - La primera row se usa para extraer las column keys (header).
 * - Mantiene el orden de keys del primer objeto.
 * - Excel-friendly: BOM UTF-8 + CRLF line endings.
 *
 * @example
 * toCSV([{ name: 'Mario', score: 11 }, { name: 'Ana', score: 14 }])
 * // → "﻿name,score\r\nMario,11\r\nAna,14"
 */
export function toCSV(rows: Array<Record<string, CSVValue>>): string {
  if (rows.length === 0) return BOM;
  const keys = Object.keys(rows[0] ?? {});
  const header = keys.map((k) => escapeCell(k)).join(',');
  const lines = rows.map((r) => keys.map((k) => escapeCell(r[k])).join(','));
  return BOM + [header, ...lines].join('\r\n');
}
