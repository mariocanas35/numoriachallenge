'use client';

import { Link } from '@/i18n/navigation';
import { setContestStatus, updateContestDate } from '@/lib/admin/actions';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export interface AdminContestRow {
  id: string;
  number: number;
  title: string;
  division: string;
  scheduledAt: string;
  status: string;
}

const DIVISION_LABELS: Record<string, string> = {
  elementary: 'Primaria',
  middle: 'Secundaria',
};

/** ISO (UTC) → valor para <input type="datetime-local"> en hora local. */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function ContestsTable({ rows }: { rows: AdminContestRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const run = (fn: () => Promise<{ ok: boolean; message?: string }>) => {
    setMsg(null);
    startTransition(async () => {
      const r = await fn();
      setMsg(r.ok ? '✓ Guardado' : `Error: ${r.message ?? 'desconocido'}`);
      if (r.ok) router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {msg && <output className="block text-sm font-semibold text-numoria-indigo">{msg}</output>}

      <div className="overflow-x-auto rounded-xl border-2 border-numoria-gray bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-numoria-cloud text-[11px] font-bold uppercase tracking-wider text-numoria-mid">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Título</th>
              <th className="px-3 py-2">División</th>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Revisar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-numoria-gray/60">
            {rows.map((c) => (
              <tr key={c.id}>
                <td className="px-3 py-2 font-bold text-numoria-orange">#{c.number}</td>
                <td className="px-3 py-2 font-semibold text-numoria-ink">{c.title}</td>
                <td className="px-3 py-2">{DIVISION_LABELS[c.division] ?? c.division}</td>
                <td className="px-3 py-2">
                  <input
                    type="datetime-local"
                    defaultValue={toLocalInput(c.scheduledAt)}
                    disabled={isPending}
                    onBlur={(e) => {
                      if (e.target.value) run(() => updateContestDate(c.id, e.target.value));
                    }}
                    className="rounded border border-numoria-gray bg-white px-2 py-1 text-xs text-numoria-ink disabled:opacity-50"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={c.status}
                    disabled={isPending}
                    onChange={(e) => run(() => setContestStatus(c.id, e.target.value))}
                    className="rounded border border-numoria-gray bg-white px-2 py-1 text-xs font-bold text-numoria-grafito disabled:opacity-50"
                  >
                    <option value="draft">Borrador (oculta)</option>
                    <option value="scheduled">Programada (visible)</option>
                    <option value="active">Activa (se puede tomar)</option>
                    <option value="closed">Cerrada</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <Link
                    href={`/admin/contests/${c.id}`}
                    className="whitespace-nowrap text-xs font-bold text-numoria-indigo hover:underline"
                  >
                    👁️ Ver / Imprimir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
