'use client';

import { useState } from 'react';

export interface AdminLeadRow {
  email: string;
  source: string;
  name: string | null;
  school: string | null;
  country: string | null;
  capturedAt: string;
}

function csvCell(v: string): string {
  if (/[",\n]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString('es', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function LeadsTable({ rows }: { rows: AdminLeadRow[] }) {
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const filtered = q
    ? rows.filter((r) =>
        `${r.email} ${r.source} ${r.name ?? ''} ${r.school ?? ''} ${r.country ?? ''}`
          .toLowerCase()
          .includes(q),
      )
    : rows;

  const exportCsv = () => {
    const headers = ['Correo', 'Fuente', 'Nombre', 'Escuela', 'Pais', 'Fecha'];
    const lines = filtered.map((r) =>
      [r.email, r.source, r.name ?? '', r.school ?? '', r.country ?? '', r.capturedAt]
        .map(csvCell)
        .join(','),
    );
    const body = [headers.join(','), ...lines].join('\n');
    // BOM para que Excel abra el UTF-8 con acentos correctos.
    const bom = String.fromCharCode(0xfeff);
    const blob = new Blob([`${bom}${body}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'numoria-leads.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por correo, fuente, escuela, país…"
          className="w-full max-w-md rounded-md border-2 border-numoria-gray bg-white px-4 py-2 text-sm focus-visible:border-numoria-indigo focus-visible:outline-none"
        />
        <button
          type="button"
          onClick={exportCsv}
          className="shrink-0 rounded-md bg-numoria-indigo px-4 py-2 text-sm font-bold text-white transition hover:bg-numoria-indigo/90"
        >
          ⬇️ Exportar CSV ({filtered.length})
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border-2 border-numoria-gray bg-white">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-numoria-cloud text-[11px] font-bold uppercase tracking-wider text-numoria-mid">
            <tr>
              <th className="px-3 py-2">Correo</th>
              <th className="px-3 py-2">Fuente</th>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Escuela</th>
              <th className="px-3 py-2">País</th>
              <th className="px-3 py-2">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-numoria-gray/60">
            {filtered.map((r) => (
              <tr key={`${r.email}-${r.capturedAt}`}>
                <td className="px-3 py-2 font-semibold text-numoria-ink">{r.email}</td>
                <td className="px-3 py-2 text-numoria-mid">{r.source}</td>
                <td className="px-3 py-2">{r.name ?? '—'}</td>
                <td className="px-3 py-2">{r.school ?? '—'}</td>
                <td className="px-3 py-2">{r.country ?? '—'}</td>
                <td className="px-3 py-2 text-numoria-mid">{fmt(r.capturedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
