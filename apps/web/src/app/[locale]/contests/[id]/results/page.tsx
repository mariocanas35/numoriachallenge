import { type ProblemResultData, ProblemResultRow } from '@/components/contests/ProblemResultRow';
import { Link } from '@/i18n/navigation';
import { createServerClient } from '@numoria/database/server';
import type { Tables } from '@numoria/database/types';
import { NumaAvatar } from '@numoria/ui';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';

type Contest = Tables<'contests'>;
type ContestAttempt = Tables<'contest_attempts'>;
type Problem = Tables<'problems'>;

/**
 * Página de resultados post-contest (Chunk 3.4).
 *
 * Server Component que:
 * 1. Valida user autenticado y attempt existente
 * 2. Si attempt no fue submitted, muestra mensaje "continuar contest"
 * 3. Si fue submitted, muestra:
 *    - Stats grid: puntos / correctos / tiempo
 *    - Sección "Tus respuestas" con un ProblemResultRow por problema
 *      mostrando: enunciado, diagrama, tu respuesta vs correcta, explicación
 * 4. Link de vuelta a /contests
 *
 * Decisiones UX:
 * - Explicaciones SIEMPRE visibles post-submit (política spoiler-on-submit).
 *   El student aprende del error mientras está fresco. No hay penalización por
 *   ver explicación post-mortem.
 * - Problemas no respondidos se muestran en gris ("En blanco"), distinto de
 *   "Incorrecto" para no estigmatizar.
 * - El stats grid usa colores brand: naranja (puntos), teal (correctos), niebla (tiempo).
 */
export default async function ContestResultsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id: contestId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contests.results');

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Fetch contest title
  const { data: contestRow } = await supabase
    .from('contests')
    .select('title_es, title_en')
    .eq('id', contestId)
    .single();
  const contest = contestRow as Pick<Contest, 'title_es' | 'title_en'> | null;
  const title = locale === 'es' ? contest?.title_es : contest?.title_en;

  // Fetch attempt
  const { data: attemptRow } = await supabase
    .from('contest_attempts')
    .select('id, total_score, total_correct, max_possible_score, submitted_at, time_spent_seconds')
    .eq('contest_id', contestId)
    .eq('student_id', user.id)
    .single();

  if (!attemptRow) {
    notFound();
  }
  const attempt = attemptRow as Pick<
    ContestAttempt,
    | 'id'
    | 'total_score'
    | 'total_correct'
    | 'max_possible_score'
    | 'submitted_at'
    | 'time_spent_seconds'
  >;

  // Si no fue submitted, mostrar shortcut para continuar
  if (!attempt.submitted_at) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <NumaAvatar pose="think" size="lg" />
        <h1 className="font-display text-2xl font-bold text-numoria-ink">{t('notSubmittedYet')}</h1>
        <Link
          href={`/contests/${contestId}`}
          className="rounded-md bg-numoria-orange px-6 py-3 text-sm font-bold text-white hover:bg-numoria-orange-hover"
        >
          {t('continueAttempt')} →
        </Link>
        <Link href="/contests" className="text-sm font-bold text-numoria-orange hover:underline">
          {t('backToContests')}
        </Link>
      </div>
    );
  }

  // Fetch contest_problems + problems (DOS queries para consistencia con take page)
  const { data: cpRows } = await supabase
    .from('contest_problems')
    .select('position, problem_id')
    .eq('contest_id', contestId)
    .order('position', { ascending: true });
  const positions = (cpRows as Array<{ position: number; problem_id: string }> | null) ?? [];

  if (positions.length === 0) {
    notFound();
  }

  const problemIds = positions.map((p) => p.problem_id);
  const { data: problemsRows } = await supabase
    .from('problems')
    .select(
      'id, stars, points, title_es, title_en, body_es, body_en, expected_answer, explanation_es, explanation_en, has_diagram, diagram_svg_url, diagram_caption_es, diagram_caption_en',
    )
    .in('id', problemIds);

  type ProblemRow = Pick<
    Problem,
    | 'id'
    | 'stars'
    | 'points'
    | 'title_es'
    | 'title_en'
    | 'body_es'
    | 'body_en'
    | 'expected_answer'
    | 'explanation_es'
    | 'explanation_en'
    | 'has_diagram'
    | 'diagram_svg_url'
    | 'diagram_caption_es'
    | 'diagram_caption_en'
  >;

  const problemsMap = new Map<string, ProblemRow>();
  for (const p of (problemsRows as ProblemRow[] | null) ?? []) {
    problemsMap.set(p.id, p);
  }

  // Fetch problem_attempts
  const { data: paRows } = await supabase
    .from('problem_attempts')
    .select('problem_id, answer_submitted, is_correct, points_earned')
    .eq('contest_attempt_id', attempt.id);
  const attemptMap = new Map<
    string,
    { answer_submitted: string | null; is_correct: boolean | null; points_earned: number }
  >();
  for (const a of (paRows as Array<{
    problem_id: string;
    answer_submitted: string | null;
    is_correct: boolean | null;
    points_earned: number;
  }> | null) ?? []) {
    attemptMap.set(a.problem_id, a);
  }

  // Compose ProblemResultData ordenado por position
  const results: ProblemResultData[] = positions
    .map(({ position, problem_id }) => {
      const p = problemsMap.get(problem_id);
      if (!p) return null;
      const a = attemptMap.get(problem_id);
      return {
        problemId: p.id,
        position,
        stars: p.stars as 1 | 2 | 3,
        pointsMax: p.points,
        titleEs: p.title_es,
        titleEn: p.title_en,
        bodyEs: p.body_es,
        bodyEn: p.body_en,
        explanationEs: p.explanation_es,
        explanationEn: p.explanation_en,
        hasDiagram: p.has_diagram,
        diagramSvgUrl: p.diagram_svg_url,
        diagramCaptionEs: p.diagram_caption_es,
        diagramCaptionEn: p.diagram_caption_en,
        expectedAnswer: p.expected_answer,
        answerSubmitted: a?.answer_submitted ?? null,
        isCorrect: a?.is_correct ?? null,
        pointsEarned: a?.points_earned ?? 0,
      };
    })
    .filter((x): x is ProblemResultData => x !== null);

  // Labels traducidos para ProblemResultRow (server component requiere prop drilling)
  const rowLabels = {
    problemLabel: t('problemLabel'),
    yourAnswer: t('yourAnswer'),
    correctAnswer: t('correctAnswer'),
    unanswered: t('unanswered'),
    explanationLabel: t('explanationLabel'),
    statusCorrect: t('statusCorrect'),
    statusWrong: t('statusWrong'),
    statusUnanswered: t('statusUnanswered'),
  } as const;

  const timeMinutes =
    attempt.time_spent_seconds !== null ? Math.floor((attempt.time_spent_seconds ?? 0) / 60) : null;

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Header con Numa + título */}
      <header className="flex flex-col items-center gap-4 text-center">
        <NumaAvatar pose="celebrate" size="lg" animateIn />
        <h1 className="font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
          {t('title', { contestTitle: title ?? '' })}
        </h1>
      </header>

      {/* Stats grid 3-cards */}
      <div className="grid w-full max-w-md grid-cols-3 gap-3">
        <div className="rounded-xl border-2 border-numoria-orange/30 bg-numoria-orange/5 p-4 text-center">
          <div className="text-2xl">🏆</div>
          <div className="mt-1 font-display text-2xl font-bold text-numoria-ink">
            {attempt.total_score}
          </div>
          <div className="text-xs text-numoria-mid">
            {t('pointsStat')} / {attempt.max_possible_score}
          </div>
        </div>
        <div className="rounded-xl border-2 border-numoria-teal/30 bg-numoria-teal/5 p-4 text-center">
          <div className="text-2xl">✅</div>
          <div className="mt-1 font-display text-2xl font-bold text-numoria-ink">
            {attempt.total_correct}
          </div>
          <div className="text-xs text-numoria-mid">{t('correctStat')}</div>
        </div>
        <div className="rounded-xl border-2 border-numoria-niebla/30 bg-white p-4 text-center">
          <div className="text-2xl">⏱️</div>
          <div className="mt-1 font-display text-2xl font-bold text-numoria-ink">
            {timeMinutes !== null ? `${timeMinutes}m` : '—'}
          </div>
          <div className="text-xs text-numoria-mid">{t('timeStat')}</div>
        </div>
      </div>

      {/* Detalle por problema */}
      <section className="flex w-full flex-col gap-4">
        <h2 className="font-display text-xl font-bold text-numoria-ink">{t('yourAnswers')}</h2>
        {results.map((r) => (
          <ProblemResultRow
            key={r.problemId}
            data={r}
            locale={locale as 'es' | 'en'}
            labels={rowLabels}
          />
        ))}
      </section>

      {/* Volver */}
      <Link href="/contests" className="text-sm font-bold text-numoria-orange hover:underline">
        {t('backToContests')}
      </Link>
    </div>
  );
}
