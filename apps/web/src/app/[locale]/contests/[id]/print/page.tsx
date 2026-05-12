import { MathContent } from '@/components/contests/MathContent';
import { PrintButton } from '@/components/contests/PrintButton';
import { Link } from '@/i18n/navigation';
import { createServerClient } from '@numoria/database/server';
import type { Tables } from '@numoria/database/types';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';

type Contest = Tables<'contests'>;
type Problem = Tables<'problems'>;
type Profile = Tables<'profiles'>;

/**
 * Phase 4.3 — Printable contest sheet for teachers.
 *
 * Genera una página HTML optimizada para `window.print()` que el teacher
 * puede convertir en PDF (Save as PDF en el print dialog) o imprimir
 * directamente para distribuir a students en modalidad paper.
 *
 * URL query param:
 *   ?answers=1 → muestra answer key (uso del teacher)
 *   sin param  → versión limpia para students
 *
 * Print stylesheet (`@media print` en globals.css) oculta:
 *   - Headers/footers del layout
 *   - Botón "Imprimir"
 *   - Cualquier UI chrome no relevante
 *
 * Layout impreso:
 *   - Cover header con campos blancos (Nombre, Grado, Equipo, Fecha)
 *   - Instrucciones (# problemas, duración, calculadora)
 *   - Problems 1-7 con cuerpo + diagrama opcional + espacio respuesta
 *   - Footer mínimo con nombre del contest
 *
 * Solo accesible a teachers (role gate).
 */
export default async function ContestPrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ answers?: string }>;
}) {
  const { locale, id: contestId } = await params;
  const { answers: answersParam } = await searchParams;
  const showAnswers = answersParam === '1' || answersParam === 'true';
  setRequestLocale(locale);
  const t = await getTranslations('contests.print');

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  // Role gate
  const rpcResult = await supabase.rpc('get_my_profile');
  const profile = rpcResult.data as Profile | null;
  if (!profile || profile.role !== 'teacher') {
    redirect(`/${locale}/contests`);
  }

  // Fetch contest
  const { data: contestRow } = await supabase
    .from('contests')
    .select(
      'id, contest_number, season_year, title_es, title_en, division, duration_minutes, calculator_allowed',
    )
    .eq('id', contestId)
    .single();
  if (!contestRow) notFound();
  const contest = contestRow as Pick<
    Contest,
    | 'id'
    | 'contest_number'
    | 'season_year'
    | 'title_es'
    | 'title_en'
    | 'division'
    | 'duration_minutes'
    | 'calculator_allowed'
  >;

  // Fetch problems ordenados por position
  const { data: cpRows } = await supabase
    .from('contest_problems')
    .select('position, problem_id')
    .eq('contest_id', contestId)
    .order('position', { ascending: true });
  const positions = (cpRows ?? []) as Array<{ position: number; problem_id: string }>;

  const problemIds = positions.map((p) => p.problem_id);
  const { data: problemRows } = await supabase
    .from('problems')
    .select(
      'id, stars, title_es, title_en, body_es, body_en, expected_answer, explanation_es, explanation_en, has_diagram, diagram_svg_url, diagram_caption_es, diagram_caption_en, answer_type',
    )
    .in('id', problemIds);

  const problemsMap = new Map(
    (
      (problemRows ?? []) as Array<{
        id: string;
        stars: number;
        title_es: string;
        title_en: string;
        body_es: string;
        body_en: string;
        expected_answer: string;
        explanation_es: string;
        explanation_en: string;
        has_diagram: boolean;
        diagram_svg_url: string | null;
        diagram_caption_es: string | null;
        diagram_caption_en: string | null;
        answer_type: Problem['answer_type'];
      }>
    ).map((p) => [p.id, p]),
  );

  const problems = positions
    .map(({ position, problem_id }) => {
      const p = problemsMap.get(problem_id);
      if (!p) return null;
      return {
        position,
        ...p,
      };
    })
    .filter(<T,>(x: T | null): x is T => x !== null);

  const title = locale === 'es' ? contest.title_es : contest.title_en;
  const divisionLabel = contest.division === 'elementary' ? t('divisionE') : t('divisionM');

  return (
    <div className="print-contest">
      {/* Controls bar — oculto al imprimir */}
      <div className="mb-6 flex items-center justify-between gap-3 print:hidden">
        <Link href="/contests" className="text-sm font-bold text-numoria-orange hover:underline">
          ← {t('backToContests')}
        </Link>
        <div className="flex items-center gap-3">
          {/* Toggle answers via URL query */}
          {showAnswers ? (
            <Link
              href={`/contests/${contestId}/print` as never}
              className="rounded-md border-2 border-numoria-niebla/40 bg-white px-3 py-2 text-xs font-bold text-numoria-mid hover:bg-numoria-cloud"
            >
              {t('hideAnswers')}
            </Link>
          ) : (
            <Link
              href={`/contests/${contestId}/print?answers=1` as never}
              className="rounded-md border-2 border-numoria-niebla/40 bg-white px-3 py-2 text-xs font-bold text-numoria-mid hover:bg-numoria-cloud"
            >
              {t('showAnswers')}
            </Link>
          )}
          <PrintButton />
        </div>
      </div>

      {/* Document — printable area */}
      <article className="mx-auto max-w-3xl bg-white p-8 text-numoria-ink print:max-w-none print:p-0">
        {/* Cover header */}
        <header className="mb-6 border-b-2 border-numoria-ink pb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-numoria-mid">
            {t('contestNumber', { number: contest.contest_number })} ·{' '}
            {t('season', { year: contest.season_year })} · {divisionLabel}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold">{title}</h1>
          {showAnswers && (
            <p className="mt-2 inline-block rounded-full bg-numoria-orange/15 px-3 py-1 text-xs font-bold uppercase text-numoria-orange">
              🔑 {t('answerKey')}
            </p>
          )}
        </header>

        {/* Student fields (solo en versión normal, no en answer key) */}
        {!showAnswers && (
          <section className="mb-6 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <span className="text-numoria-mid">{t('studentName')}:</span>
              <div className="mt-1 border-b border-numoria-mid pb-0.5">&nbsp;</div>
            </div>
            <div>
              <span className="text-numoria-mid">{t('grade')}:</span>
              <div className="mt-1 border-b border-numoria-mid pb-0.5">&nbsp;</div>
            </div>
            <div>
              <span className="text-numoria-mid">{t('team')}:</span>
              <div className="mt-1 border-b border-numoria-mid pb-0.5">&nbsp;</div>
            </div>
            <div>
              <span className="text-numoria-mid">{t('date')}:</span>
              <div className="mt-1 border-b border-numoria-mid pb-0.5">&nbsp;</div>
            </div>
          </section>
        )}

        {/* Instructions box */}
        <section className="mb-6 rounded-md border-2 border-numoria-niebla bg-numoria-cloud p-4 text-sm">
          <p className="font-bold">{t('instructionsTitle')}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-numoria-mid">
            <li>{t('instructionProblems', { count: problems.length })}</li>
            <li>{t('instructionDuration', { min: contest.duration_minutes })}</li>
            <li>
              {contest.calculator_allowed ? t('instructionWithCalc') : t('instructionNoCalc')}
            </li>
            <li>{t('instructionAnswers')}</li>
          </ul>
        </section>

        {/* Problems */}
        <section className="flex flex-col gap-6">
          {problems.map((p) => {
            const body = locale === 'es' ? p.body_es : p.body_en;
            const category = locale === 'es' ? p.title_es : p.title_en;
            const explanation = locale === 'es' ? p.explanation_es : p.explanation_en;
            const diagramCaption = locale === 'es' ? p.diagram_caption_es : p.diagram_caption_en;
            return (
              <article
                key={p.id}
                className="break-inside-avoid border-l-4 border-numoria-orange pl-4 print:break-inside-avoid"
              >
                <header className="mb-2 flex items-baseline justify-between">
                  <p className="font-bold">
                    {t('problemLabel', { number: p.position })} {'⭐'.repeat(p.stars)}
                  </p>
                  <p className="text-xs uppercase tracking-wider text-numoria-mid">{category}</p>
                </header>

                <div className="text-sm leading-relaxed">
                  <MathContent text={body} />
                </div>

                {p.has_diagram && p.diagram_svg_url && (
                  <div className="mt-3 flex flex-col items-center gap-1">
                    <img
                      src={p.diagram_svg_url}
                      alt={diagramCaption ?? ''}
                      className="max-h-48 object-contain"
                    />
                    {diagramCaption && (
                      <p className="text-xs italic text-numoria-mid">{diagramCaption}</p>
                    )}
                  </div>
                )}

                {/* Answer block */}
                <div className="mt-3">
                  {showAnswers ? (
                    <>
                      <p className="text-xs font-bold uppercase tracking-wider text-numoria-mid">
                        {t('correctAnswer')}:
                      </p>
                      <p className="mt-1 font-mono text-base font-bold text-numoria-teal">
                        {p.expected_answer}
                      </p>
                      {explanation && (
                        <div className="mt-2 rounded-md border-2 border-numoria-orange/30 bg-numoria-orange/5 p-3 text-xs">
                          <p className="font-bold text-numoria-orange">
                            💡 {t('explanationLabel')}
                          </p>
                          <div className="mt-1 leading-relaxed text-numoria-ink">
                            <MathContent text={explanation} />
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-numoria-mid">
                        {t('answer')}:
                      </span>
                      <div className="mt-1 border-b-2 border-numoria-ink pb-1">&nbsp;</div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </section>

        {/* Footer */}
        <footer className="mt-8 border-t border-numoria-niebla pt-3 text-center text-xs text-numoria-mid">
          {t('footerBrand')} — {title}
        </footer>
      </article>
    </div>
  );
}
