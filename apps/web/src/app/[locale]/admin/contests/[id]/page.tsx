import { PrintButton } from '@/components/admin/PrintButton';
import { Link } from '@/i18n/navigation';
import { createAdminClient } from '@numoria/database/server';
import { notFound } from 'next/navigation';

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
  scheduled_at: string;
  status: string;
  duration_minutes: number;
};
type ContestProblem = { position: number; problem_id: string };
type Problem = {
  id: string;
  title_es: string;
  body_es: string;
  expected_answer: string;
  points: number;
  stars: number;
  format_directive_es: string | null;
  has_diagram: boolean;
  diagram_svg_url: string | null;
  diagram_caption_es: string | null;
};

/**
 * /admin/contests/[id] — vista de revisión imprimible de una competencia.
 * Muestra los problemas en orden con enunciado, diagrama y RESPUESTA (es una
 * hoja de revisión para el admin, no para entregar a estudiantes).
 */
export default async function AdminContestReviewPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: contestData } = await admin
    .from('contests')
    .select('id, contest_number, title_es, division, scheduled_at, status, duration_minutes')
    .eq('id', id)
    .maybeSingle();
  const contest = contestData as Contest | null;
  if (!contest) notFound();

  const { data: cpData } = await admin
    .from('contest_problems')
    .select('position, problem_id')
    .eq('contest_id', id)
    .order('position', { ascending: true });
  const cps = (cpData as ContestProblem[] | null) ?? [];

  const problemIds = cps.map((c) => c.problem_id);
  let problems: Problem[] = [];
  if (problemIds.length > 0) {
    const { data } = await admin
      .from('problems')
      .select(
        'id, title_es, body_es, expected_answer, points, stars, format_directive_es, has_diagram, diagram_svg_url, diagram_caption_es',
      )
      .in('id', problemIds);
    problems = (data as Problem[] | null) ?? [];
  }
  const problemMap = new Map(problems.map((p) => [p.id, p]));

  const ordered = cps
    .map((c) => ({ position: c.position, problem: problemMap.get(c.problem_id) }))
    .filter((x): x is { position: number; problem: Problem } => Boolean(x.problem));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/admin/contests"
          className="text-sm font-bold text-numoria-indigo hover:underline"
        >
          ← Volver a competencias
        </Link>
        <PrintButton />
      </div>

      <article className="rounded-xl border-2 border-numoria-gray bg-white p-8 print:border-0 print:p-0">
        <header className="mb-6 border-b-2 border-numoria-gray pb-4">
          <h1 className="font-display text-2xl font-bold text-numoria-ink">
            #{contest.contest_number} · {contest.title_es}
          </h1>
          <p className="mt-1 text-sm text-numoria-mid">
            {DIVISION_LABELS[contest.division] ?? contest.division} · {ordered.length} problemas ·{' '}
            {contest.duration_minutes} min · Estado:{' '}
            {STATUS_LABELS[contest.status] ?? contest.status}
          </p>
          <p className="text-xs text-numoria-mid">
            Fecha: {new Date(contest.scheduled_at).toLocaleString('es')}
          </p>
          <p className="mt-2 text-xs italic text-numoria-mid print:hidden">
            ⚠️ Esta hoja incluye las respuestas (para revisión). No la entregues a los estudiantes.
          </p>
        </header>

        {ordered.length === 0 ? (
          <p className="text-sm text-numoria-mid">Esta competencia no tiene problemas cargados.</p>
        ) : (
          <ol className="flex flex-col gap-6">
            {ordered.map(({ position, problem }) => (
              <li key={problem.id} className="break-inside-avoid">
                <h2 className="font-display text-lg font-bold text-numoria-ink">
                  Problema {position}{' '}
                  <span className="text-sm font-normal text-numoria-mid">
                    ({problem.points} pt · {'★'.repeat(problem.stars)})
                  </span>
                </h2>
                <p className="mt-1 font-semibold text-numoria-grafito">{problem.title_es}</p>
                <p className="mt-2 whitespace-pre-wrap text-numoria-ink">{problem.body_es}</p>
                {problem.format_directive_es && (
                  <p className="mt-1 text-sm italic text-numoria-mid">
                    {problem.format_directive_es}
                  </p>
                )}
                {problem.has_diagram && problem.diagram_svg_url && (
                  <img
                    src={problem.diagram_svg_url}
                    alt={problem.diagram_caption_es ?? 'Diagrama'}
                    className="mt-3 max-h-64"
                  />
                )}
                <p className="mt-3 inline-block rounded bg-numoria-green/10 px-3 py-1 text-sm font-bold text-numoria-green">
                  Respuesta: {problem.expected_answer}
                </p>
              </li>
            ))}
          </ol>
        )}
      </article>
    </div>
  );
}
