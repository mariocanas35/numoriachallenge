'use client';

import { deleteUserAccount, renameUser, setUserBanned } from '@/lib/admin/actions';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  confirmed: boolean;
  role: string;
  country: string | null;
  school: string | null;
  lastSignIn: string | null;
  banned: boolean;
  createdAt: string;
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function UsersTable({
  rows,
  currentAdminId,
}: {
  rows: AdminUserRow[];
  currentAdminId: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? rows.filter((r) =>
        `${r.name} ${r.email} ${r.school ?? ''} ${r.country ?? ''} ${r.role}`
          .toLowerCase()
          .includes(q),
      )
    : rows;

  const run = (fn: () => Promise<{ ok: boolean; message?: string }>, confirmMsg?: string) => {
    if (confirmMsg && !confirm(confirmMsg)) return;
    setMsg(null);
    startTransition(async () => {
      const r = await fn();
      setMsg(r.ok ? '✓ Hecho' : `Error: ${r.message ?? 'desconocido'}`);
      if (r.ok) router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, correo, escuela, país, rol…"
          className="w-full max-w-md rounded-md border-2 border-numoria-gray bg-white px-4 py-2 text-sm focus-visible:border-numoria-indigo focus-visible:outline-none"
        />
        <span className="shrink-0 text-xs text-numoria-mid">
          {filtered.length} de {rows.length}
        </span>
      </div>

      {msg && <output className="block text-sm font-semibold text-numoria-indigo">{msg}</output>}

      <div className="overflow-x-auto rounded-xl border-2 border-numoria-gray bg-white">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-numoria-cloud text-[11px] font-bold uppercase tracking-wider text-numoria-mid">
            <tr>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Correo</th>
              <th className="px-3 py-2">Conf.</th>
              <th className="px-3 py-2">Rol</th>
              <th className="px-3 py-2">País</th>
              <th className="px-3 py-2">Escuela</th>
              <th className="px-3 py-2">Última sesión</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-numoria-gray/60">
            {filtered.map((r) => (
              <tr key={r.id} className={r.banned ? 'bg-numoria-red/5' : ''}>
                <td className="px-3 py-2 font-semibold text-numoria-ink">
                  {r.name}
                  {r.banned && (
                    <span className="ml-1" title="Bloqueado">
                      🚫
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-numoria-mid">{r.email}</td>
                <td className="px-3 py-2">{r.confirmed ? '✓' : '⚠'}</td>
                <td className="px-3 py-2">{r.role}</td>
                <td className="px-3 py-2">{r.country ?? '—'}</td>
                <td className="px-3 py-2">{r.school ?? '—'}</td>
                <td className="px-3 py-2 text-numoria-mid">{fmtDate(r.lastSignIn)}</td>
                <td className="px-3 py-2">
                  {r.id === currentAdminId ? (
                    <span className="text-xs text-numoria-mid">(tú)</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => {
                          const n = window.prompt('Nuevo nombre:', r.name);
                          if (n?.trim()) run(() => renameUser(r.id, n.trim()));
                        }}
                        className="rounded border border-numoria-gray px-2 py-0.5 text-xs font-bold text-numoria-grafito hover:bg-numoria-cloud disabled:opacity-50"
                      >
                        ✏️ Renombrar
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => run(() => setUserBanned(r.id, !r.banned))}
                        className="rounded border border-numoria-dorado px-2 py-0.5 text-xs font-bold text-[#a86e08] hover:bg-numoria-dorado/10 disabled:opacity-50"
                      >
                        {r.banned ? 'Desbloquear' : 'Bloquear'}
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          run(
                            () => deleteUserAccount(r.id),
                            `¿Eliminar a "${r.name}" (${r.email})? Esto borra su cuenta permanentemente y no se puede deshacer.`,
                          )
                        }
                        className="rounded border border-numoria-red px-2 py-0.5 text-xs font-bold text-numoria-red hover:bg-numoria-red hover:text-white disabled:opacity-50"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
