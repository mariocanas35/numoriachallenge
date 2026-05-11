import { Link } from '@/i18n/navigation';
import { createServerClient } from '@numoria/database/server';
import type { Tables } from '@numoria/database/types';
import { NumaAvatar } from '@numoria/ui';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';

type Contest = Tables<'contests'>;
type ContestAttempt = Tables<'contest_attempts'>;

/**
 * Placeholder de la página de resultados (Chunk 3.4 implementará el detalle).
 *
 * Por ahora:
 * - Muestra el score total + correctos del attempt
 * - Mensaje "Detalles llegan en el próximo chunk"
 * - Link de vuelta a /contests
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

  // Fetch contest title
  const { data: contestRow } = await supabase
    .from('contests')
    .select('title_es, title_en')
    .eq('id', contestId)
    .single();
  const contest = contestRow as Pick<Contest, 'title_es' | 'title_en'> | null;
  const title = locale === 'es' ? contest?.title_es : contest?.title_en;

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <NumaAvatar pose="celebrate" size="xl" animateIn />

      <div>
        <h1 className="font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
          {t('title', { contestTitle: title ?? '' })}
        </h1>
      </div>

      {attempt.submitted_at && (
        <div className="grid w-full max-w-md grid-cols-3 gap-3">
          <div className="rounded-xl border-2 border-numoria-blue/30 bg-numoria-blue/5 p-4">
            <div className="text-2xl">🏆</div>
            <div className="mt-1 font-display text-2xl font-bold text-numoria-ink">
              {attempt.total_score}
            </div>
            <div className="text-xs text-numoria-mid">
              {locale === 'es' ? 'Puntos' : 'Points'} / {attempt.max_possible_score}
            </div>
          </div>
          <div className="rounded-xl border-2 border-numoria-green/30 bg-numoria-green/5 p-4">
            <div className="text-2xl">✅</div>
            <div className="mt-1 font-display text-2xl font-bold text-numoria-ink">
              {attempt.total_correct}
            </div>
            <div className="text-xs text-numoria-mid">
              {locale === 'es' ? 'Correctos' : 'Correct'}
            </div>
          </div>
          <div className="rounded-xl border-2 border-numoria-gray bg-white p-4">
            <div className="text-2xl">⏱️</div>
            <div className="mt-1 font-display text-2xl font-bold text-numoria-ink">
              {attempt.time_spent_seconds !== null
                ? `${Math.floor((attempt.time_spent_seconds ?? 0) / 60)}m`
                : '—'}
            </div>
            <div className="text-xs text-numoria-mid">{locale === 'es' ? 'Tiempo' : 'Time'}</div>
          </div>
        </div>
      )}

      <p className="max-w-md rounded-xl border-2 border-dashed border-numoria-gray bg-white p-5 text-sm text-numoria-mid">
        🚧 {t('comingSoon')}
      </p>

      <Link href="/contests" className="text-sm font-bold text-numoria-blue hover:underline">
        {t('backToContests')}
      </Link>
    </div>
  );
}
