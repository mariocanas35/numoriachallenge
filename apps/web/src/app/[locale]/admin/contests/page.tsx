import { type AdminContestRow, ContestsTable } from '@/components/admin/ContestsTable';
import { createAdminClient } from '@numoria/database/server';

export const dynamic = 'force-dynamic';

type ContestRow = {
  id: string;
  contest_number: number;
  title_es: string;
  division: string;
  scheduled_at: string;
  status: string;
};

/**
 * /admin/contests — gestión de competencias: editar fecha + cambiar estado.
 * Al poner una competencia "Activa", los estudiantes pueden tomarla y los
 * maestros la asignan a sus equipos con el flujo de sesiones ya existente.
 */
export default async function AdminContestsPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from('contests')
    .select('id, contest_number, title_es, division, scheduled_at, status')
    .order('scheduled_at', { ascending: true });

  const rows: AdminContestRow[] = ((data as ContestRow[] | null) ?? []).map((c) => ({
    id: c.id,
    number: c.contest_number,
    title: c.title_es,
    division: c.division,
    scheduledAt: c.scheduled_at,
    status: c.status,
  }));

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-numoria-ink">Competencias</h1>
        <p className="mt-1 max-w-2xl text-sm text-numoria-mid">
          Edita la fecha y cambia el estado. Al ponerla <strong>Activa</strong>, los estudiantes
          pueden tomarla y los maestros la asignan a sus equipos. La fecha se muestra y guarda en tu
          hora local.
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="rounded-xl border-2 border-dashed border-numoria-gray bg-white p-6 text-center text-sm text-numoria-mid">
          No hay competencias todavía.
        </p>
      ) : (
        <ContestsTable rows={rows} />
      )}
    </div>
  );
}
