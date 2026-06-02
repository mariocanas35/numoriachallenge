import { type AdminLeadRow, LeadsTable } from '@/components/admin/LeadsTable';
import { createAdminClient } from '@numoria/database/server';

export const dynamic = 'force-dynamic';

type LeadRow = {
  email: string;
  source: string;
  metadata: Record<string, unknown> | null;
  captured_at: string;
};

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v : null;
}

/**
 * /admin/leads — correos capturados (posibles clientes) con búsqueda y export
 * a CSV para la campaña. Extrae nombre/escuela/país del metadata jsonb.
 */
export default async function AdminLeadsPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from('email_captures' as never)
    .select('email, source, metadata, captured_at')
    .order('captured_at', { ascending: false });

  const raw = (data as LeadRow[] | null) ?? [];
  const rows: AdminLeadRow[] = raw.map((r) => {
    const m = (r.metadata ?? {}) as Record<string, unknown>;
    return {
      email: r.email,
      source: r.source,
      name: str(m.name) ?? str(m.display_name),
      school: str(m.school) ?? str(m.school_name),
      country: str(m.country) ?? str(m.country_code),
      capturedAt: r.captured_at,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-numoria-ink">Leads</h1>
        <p className="mt-1 text-sm text-numoria-mid">
          {rows.length} correos capturados (posibles clientes). Búscalos y expórtalos a CSV para tu
          campaña.
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="rounded-xl border-2 border-dashed border-numoria-gray bg-white p-6 text-center text-sm text-numoria-mid">
          No hay leads capturados todavía.
        </p>
      ) : (
        <LeadsTable rows={rows} />
      )}
    </div>
  );
}
