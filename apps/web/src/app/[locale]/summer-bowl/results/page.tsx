import { MathContent } from '@/components/contests/MathContent';
import { Footer } from '@/components/landing/Footer';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { type ProblemResult, getSummerBowlResults } from '@/lib/contests/summer-bowl-results';
import { NumaAvatar } from '@numoria/ui';
import type { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

/**
 * /summer-bowl/results — Resultados oficiales públicos del Summer Bowl #1.
 *
 * Cuadro de honor (nombre + inicial del apellido, colegio, país), estadísticas
 * agregadas y los problemas con su solución. Los datos salen de
 * getSummerBowlResults(), que solo publica cuando la ventana del bowl cerró.
 * Se regenera cada hora: si un admin corrige un nombre, aparece en ≤ 1 h.
 */
export const revalidate = 3600;

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contests.summerBowlResults' });
  return { title: t('metaTitle'), description: t('metaDescription') };
}

const MEDALS = ['🥇', '🥈', '🥉'];

export default async function SummerBowlResultsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contests.summerBowlResults');
  const format = await getFormatter();

  const results = await getSummerBowlResults();
  if (!results) notFound();

  const isEn = locale === 'en';
  const regionNames = new Intl.DisplayNames([locale], { type: 'region' });
  const countryName = (code: string | null) => (code ? (regionNames.of(code) ?? code) : '—');
  const oneDecimal = (n: number) => format.number(n, { maximumFractionDigits: 1 });
  const longDate = (iso: string) =>
    format.dateTime(new Date(iso), { day: 'numeric', month: 'long', year: 'numeric' });

  const formatLine = [
    results.division === 'middle' ? t('divisionMiddle') : t('divisionElementary'),
    results.calculatorAllowed ? t('calculatorYes') : t('calculatorNo'),
    t('problemsCount', { count: results.problems.length }),
    t('minutesCount', { count: results.durationMinutes }),
  ].join(' · ');

  const stats: Array<{ label: string; value: string; detail?: string }> = [
    { label: t('statParticipants'), value: String(results.participants) },
    {
      label: t('statAverage'),
      value: oneDecimal(results.averageScore),
      detail: t('outOf', { max: results.maxScore }),
    },
    {
      label: t('statBest'),
      value: String(results.bestScore),
      detail: t('outOf', { max: results.maxScore }),
    },
    ...(results.averageMinutes !== null
      ? [
          {
            label: t('statTime'),
            value: t('minutesShort', { count: Math.round(results.averageMinutes) }),
            detail: t('outOf', { max: results.durationMinutes }),
          },
        ]
      : []),
    {
      label: t('statCountries'),
      value: String(results.countryCodes.length),
      detail: results.countryCodes.map(countryName).join(' · '),
    },
  ];

  return (
    <>
      <LandingHeader />
      <main className="min-h-dvh bg-gradient-to-b from-numoria-crema via-white to-numoria-crema">
        {/* === HERO === */}
        <section className="px-4 pt-28 pb-10 sm:px-10 sm:pt-32">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-3xl bg-gradient-to-br from-numoria-orange via-numoria-coral to-numoria-indigo p-7 shadow-xl sm:p-12">
              <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                <div className="shrink-0">
                  <NumaAvatar pose="celebrate" size="lg" animateIn />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-numoria-ink/80">
                    {t('edition')}
                  </p>
                  <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-numoria-ink sm:text-5xl">
                    {t('title')}
                  </h1>
                  <p className="mt-4 text-base font-semibold text-numoria-ink sm:text-lg">
                    {t('dates', {
                      start: longDate(results.startsAt),
                      end: longDate(results.endsAt),
                    })}
                  </p>
                  <p className="mt-1 text-sm font-medium text-numoria-ink/90 sm:text-base">
                    {formatLine}
                  </p>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {stats.map((s, index) => (
                <div
                  key={s.label}
                  className={`rounded-2xl border-2 border-numoria-orange/20 bg-white p-4 text-center shadow-sm ${
                    stats.length % 2 === 1 && index === stats.length - 1
                      ? 'col-span-2 sm:col-span-1'
                      : ''
                  }`}
                >
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-numoria-mid">
                    {s.label}
                  </dt>
                  <dd className="mt-1 font-mono text-3xl font-bold text-numoria-ink tabular-nums">
                    {s.value}
                  </dd>
                  {s.detail && <dd className="text-xs text-numoria-mid">{s.detail}</dd>}
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* === CUADRO DE HONOR === */}
        <section className="px-4 pb-12 sm:px-10">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
              🏆 {t('honorRollTitle')}
            </h2>
            <p className="mt-1 text-sm text-numoria-mid">{t('honorRollNote')}</p>
            <div className="mt-5 overflow-hidden rounded-2xl border-2 border-numoria-niebla/30 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-numoria-cloud text-[11px] font-bold uppercase tracking-wider text-numoria-mid">
                  <tr>
                    <th scope="col" className="px-3 py-3 text-center sm:px-4">
                      {t('colRank')}
                    </th>
                    <th scope="col" className="px-3 py-3 sm:px-4">
                      {t('colStudent')}
                    </th>
                    <th scope="col" className="hidden px-4 py-3 md:table-cell">
                      {t('colSchool')}
                    </th>
                    <th scope="col" className="hidden px-4 py-3 sm:table-cell">
                      {t('colCountry')}
                    </th>
                    <th scope="col" className="px-3 py-3 text-right sm:px-4">
                      {t('colScore')}
                    </th>
                    <th scope="col" className="hidden px-4 py-3 text-right sm:table-cell">
                      {t('colCorrect')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-numoria-niebla/20">
                  {results.honorRoll.map((row) => (
                    <tr
                      key={`${row.rank}-${row.name}-${row.score}-${row.school ?? ''}`}
                      className={row.rank <= 3 ? 'bg-numoria-dorado/10' : undefined}
                    >
                      <td className="px-3 py-3 text-center font-mono text-base font-bold sm:px-4">
                        {MEDALS[row.rank - 1] ?? row.rank}
                      </td>
                      <td className="px-3 py-3 sm:px-4">
                        <span className="font-semibold text-numoria-ink">{row.name}</span>
                        <span className="block text-xs text-numoria-mid md:hidden">
                          {row.school ?? t('individualEntry')}
                          <span className="sm:hidden">
                            {' · '}
                            {countryName(row.countryCode)}
                          </span>
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-numoria-mid md:table-cell">
                        {row.school ?? t('individualEntry')}
                      </td>
                      <td className="hidden px-4 py-3 text-numoria-mid sm:table-cell">
                        {countryName(row.countryCode)}
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-numoria-ink tabular-nums sm:px-4">
                        {row.score}
                        <span className="font-normal text-numoria-mid">/{results.maxScore}</span>
                      </td>
                      <td className="hidden px-4 py-3 text-right font-mono text-numoria-mid tabular-nums sm:table-cell">
                        {row.correct}/{results.problems.length}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* === PROBLEMAS === */}
        <section className="bg-white px-4 py-14 sm:px-10">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
              {t('problemsTitle')}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-numoria-mid">{t('problemsIntro')}</p>
            <div className="mt-6 space-y-3">
              {results.problems.map((problem) => (
                <ProblemCard
                  key={problem.position}
                  problem={problem}
                  isEn={isEn}
                  labels={{
                    problem: t('problemLabel', { number: problem.position }),
                    category: t(`categories.${problem.category}`),
                    points: t('pointsLabel', { count: problem.points }),
                    rate: t('correctRate', {
                      percent: format.number(problem.correctRate, { style: 'percent' }),
                    }),
                    show: t('showSolution'),
                    answer: t('answerLabel'),
                    explanation: t('explanationLabel'),
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* === CTA === */}
        <section className="px-4 pt-12 pb-20 text-center sm:px-10">
          <div className="mx-auto max-w-2xl">
            <NumaAvatar pose="wave" size="xl" />
            <h2 className="mt-4 font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
              {t('ctaTitle')}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-numoria-mid sm:text-base">
              {t('ctaBody')}
            </p>
            <Link
              href={`/${locale}`}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-numoria-orange px-6 py-3 text-base font-bold text-white shadow-sm transition hover:bg-numoria-orange-hover"
            >
              {t('ctaButton')}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function ProblemCard({
  problem,
  isEn,
  labels,
}: {
  problem: ProblemResult;
  isEn: boolean;
  labels: {
    problem: string;
    category: string;
    points: string;
    rate: string;
    show: string;
    answer: string;
    explanation: string;
  };
}) {
  const percent = Math.round(problem.correctRate * 100);
  const barColor =
    percent >= 70 ? 'bg-numoria-teal' : percent >= 40 ? 'bg-numoria-orange' : 'bg-numoria-coral';
  const title = isEn ? problem.titleEn : problem.titleEs;
  const body = isEn ? problem.bodyEn : problem.bodyEs;
  const explanation = isEn ? problem.explanationEn : problem.explanationEs;
  const caption = isEn ? problem.diagramCaptionEn : problem.diagramCaptionEs;

  return (
    <details className="group rounded-2xl border-2 border-numoria-niebla/30 bg-white p-4 shadow-sm sm:p-5 [&_summary::-webkit-details-marker]:hidden">
      <summary className="cursor-pointer list-none">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="font-display text-base font-bold text-numoria-ink sm:text-lg">
            {labels.problem} · {labels.category}
          </p>
          <p className="text-xs font-semibold text-numoria-mid">
            {labels.points} · {labels.rate}
          </p>
        </div>
        <div
          className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-numoria-niebla/20"
          aria-hidden
        >
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-3 text-sm font-bold text-numoria-orange">
          <span className="inline-block transition-transform group-open:rotate-90" aria-hidden>
            ▶
          </span>{' '}
          {labels.show}
        </p>
      </summary>

      <div className="mt-4 space-y-4 border-t border-numoria-niebla/20 pt-4">
        <p className="font-semibold text-numoria-ink">{title}</p>
        <div className="whitespace-pre-line text-sm leading-relaxed text-numoria-mid">
          <MathContent text={body} />
        </div>
        {problem.diagramUrl && (
          <div className="flex flex-col items-center gap-1 rounded-md border-2 border-dashed border-numoria-niebla/40 bg-white p-3">
            <img
              src={problem.diagramUrl}
              alt={caption ?? title}
              className="max-h-48 object-contain"
            />
            {caption && <p className="text-xs italic text-numoria-mid">{caption}</p>}
          </div>
        )}
        <div className="rounded-xl bg-numoria-teal/10 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-numoria-mid">
            {labels.answer}
          </p>
          <p className="mt-1 font-mono text-lg font-bold text-numoria-ink">
            <MathContent text={problem.expectedAnswer} />
          </p>
        </div>
        {explanation && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-numoria-mid">
              {labels.explanation}
            </p>
            <div className="mt-1 whitespace-pre-line text-sm leading-relaxed text-numoria-ink">
              <MathContent text={explanation} />
            </div>
          </div>
        )}
      </div>
    </details>
  );
}
