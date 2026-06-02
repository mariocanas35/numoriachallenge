import { createAdminClient } from '@numoria/database/server';

export const dynamic = 'force-dynamic';

const DIVISION_LABELS: Record<string, string> = { elementary: 'Primaria', middle: 'Secundaria' };
const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  scheduled: 'Programada',
  active: 'Activa',
  closed: 'Cerrada',
};

type Contest = {
  id: string;
  contest_number: number;
  title_es: string;
  division: string;
  status: string;
  scheduled_at: string;
};
type Attempt = { contest_id: string; student_id: string; submitted_at: string | null };
type Session = { contest_id: string; team_id: string; opened_by: string };

type Agg = { students: number; submitted: number; teachers: Set<string>; teams: Set<string> };

/**
 * /admin/activity — estudiantes y maestros activos por cada competencia.
 * Estudiantes = intentos (contest_attempts). Maestros = quién abrió la sesión
 * (contest_sessions.opened_by). Equipos = sesiones distintas.
 */
export default async function AdminActivityPage() {
  const admin = createAdminClient();

  const { data: contestsData } = await admin
    .from('contests')
    .select('id, contest_number, title_es, division, status, scheduled_at')
    .order('scheduled_at', { ascending: true });
  const contests = (contestsData as Contest[] | null) ?? [];

  const { data: attemptsData } = await admin
    .from('contest_attempts')
    .select('contest_id, student_id, submitted_at');
  const attempts = (attemptsData as Attempt[] | null) ?? [];

  const { data: sessionsData } = await admin
    .from('contest_sessions')
    .select('contest_id, team_id, opened_by');
  const sessions = (sessionsData as Session[] | null) ?? [];

  const agg = new Map<string, Agg>();
  const bucket = (id: string): Agg => {
    let a = agg.get(id);
    if (!a) {
      a = { students: 0, submitted: 0, teachers: new Set(), teams: new Set() };
      agg.set(id, a);
    }
    return a;
  };
  for (const at of attempts) {
    const a = bucket(at.contest_id);
    a.students += 1;
    if (at.submitted_at) a.submitted += 1;
  }
  for (const s of sessions) {
    const a = bucket(s.contest_id);
    a.teachers.add(s.opened_by);
    a.teams.add(s.team_id);
  }

  const rows = contests.map((c) => {
    const a = agg.get(c.id);
    return {
      id: c.id,
      number: c.contest_number,
      title: c.title_es,
      division: c.division,
      status: c.status,
      students: a?.students ?? 0,
      submitted: a?.submitted ?? 0,
      teachers: a?.teachers.size ?? 0,
      teams: a?.teams.size ?? 0,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-numoria-ink">
          Actividad por competencia
        </h1>
        <p className="mt-1 text-sm text-numoria-mid">
          Cuántos estudiantes y maestros participaron en cada competencia.
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="rounded-xl border-2 border-dashed border-numoria-gray bg-white p-6 text-center text-sm text-numoria-mid">
          No hay competencias todavía.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border-2 border-numoria-gray bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-numoria-cloud text-[11px] font-bold uppercase tracking-wider text-numoria-mid">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Título</th>
                <th className="px-3 py-2">División</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">🎓 Estudiantes</th>
                <th className="px-3 py-2">✅ Entregaron</th>
                <th className="px-3 py-2">👩‍🏫 Maestros</th>
                <th className="px-3 py-2">👥 Equipos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-numoria-gray/60">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-2 font-bold text-numoria-orange">#{r.number}</td>
                  <td className="px-3 py-2 font-semibold text-numoria-ink">{r.title}</td>
                  <td className="px-3 py-2">{DIVISION_LABELS[r.division] ?? r.division}</td>
                  <td className="px-3 py-2 text-numoria-mid">
                    {STATUS_LABELS[r.status] ?? r.status}
                  </td>
                  <td className="px-3 py-2 font-bold text-numoria-ink">{r.students}</td>
                  <td className="px-3 py-2">{r.submitted}</td>
                  <td className="px-3 py-2 font-bold text-numoria-ink">{r.teachers}</td>
                  <td className="px-3 py-2">{r.teams}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
