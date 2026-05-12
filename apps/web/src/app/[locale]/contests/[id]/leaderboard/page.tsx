import { LeaderboardTable } from '@/components/contests/LeaderboardTable';
import { Link } from '@/i18n/navigation';
import { getLeaderboardData } from '@/lib/contests/leaderboard';
import { createServerClient } from '@numoria/database/server';
import type { Tables } from '@numoria/database/types';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';

type Contest = Tables<'contests'>;
type Profile = Tables<'profiles'>;

/**
 * Leaderboard de un contest — vista de teacher.
 *
 * Autorización:
 *   - Solo teachers acceden (students redirected a /results)
 *   - Solo ven students de sus propios teams (filtrado en getLeaderboardData
 *     vía coach_id = auth.uid() + RLS teachers_view_team_contest_attempts).
 *
 * Filter por team via ?team=<teamId> query param. Mantiene Server Component
 * (sin estado cliente) — el dropdown es un <select> dentro de un <form GET>.
 *
 * Export CSV via /api/contests/[id]/leaderboard/csv?team=<teamId> (route handler
 * dedicado para devolver Content-Type text/csv + Content-Disposition).
 */
export default async function ContestLeaderboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ team?: string }>;
}) {
  const { locale, id: contestId } = await params;
  const { team: teamFilter } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('contests.leaderboard');

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Role gate: solo teachers
  const rpcResult = await supabase.rpc('get_my_profile');
  const profile = rpcResult.data as Profile | null;
  if (!profile) {
    redirect(`/${locale}/auth-error`);
  }
  if (profile.role !== 'teacher') {
    // Students van a su /results; otros roles a /contests
    if (profile.role === 'student') {
      redirect(`/${locale}/contests/${contestId}/results`);
    }
    redirect(`/${locale}/contests`);
  }

  // Fetch contest meta
  const { data: contestRow } = await supabase
    .from('contests')
    .select('id, title_es, title_en, division, scheduled_at, duration_minutes')
    .eq('id', contestId)
    .single();
  if (!contestRow) {
    notFound();
  }
  const contest = contestRow as Pick<
    Contest,
    'id' | 'title_es' | 'title_en' | 'division' | 'scheduled_at' | 'duration_minutes'
  >;
  const title = locale === 'es' ? contest.title_es : contest.title_en;

  // Fetch leaderboard data
  const { entries, summary, teacherTeams } = await getLeaderboardData(supabase, {
    contestId,
    teacherId: user.id,
    teamId: teamFilter,
  });

  const rowLabels = {
    rank: t('table.rank'),
    student: t('table.student'),
    team: t('table.team'),
    score: t('table.score'),
    correct: t('table.correct'),
    time: t('table.time'),
    status: t('table.status'),
    submitted: t('table.submitted'),
    inProgress: t('table.inProgress'),
    // t.raw() devuelve el string sin validar interpolación — necesario porque
    // la sustitución del {n} ocurre en LeaderboardTable per row, no aquí.
    gradeFormat: t.raw('table.gradeFormat') as string,
    actions: t('table.actions'),
  };

  // CSV download URL incluye el filter para que el export respete el filtrado UI
  const csvHref = `/api/contests/${contestId}/leaderboard/csv${teamFilter ? `?team=${teamFilter}` : ''}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header>
        <h1 className="font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
          🏆 {t('title', { contestTitle: title ?? '' })}
        </h1>
        <p className="mt-1 text-sm text-numoria-mid">
          {t('divisionLabel')}:{' '}
          {contest.division === 'elementary' ? t('divisionElementary') : t('divisionMiddle')}
        </p>
      </header>

      {/* Teacher sin teams */}
      {teacherTeams.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-numoria-niebla/40 bg-white p-8 text-center">
          <p className="text-sm text-numoria-mid">{t('noTeams')}</p>
          <Link
            href="/teams"
            className="mt-3 inline-block text-sm font-bold text-numoria-orange hover:underline"
          >
            {t('manageTeams')} →
          </Link>
        </div>
      )}

      {/* Filter + Stats + Table */}
      {teacherTeams.length > 0 && (
        <>
          {/* Stats overview */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border-2 border-numoria-orange/30 bg-numoria-orange/5 p-3 text-center">
              <div className="font-display text-xl font-bold text-numoria-ink">
                {summary.totalAttempts}
              </div>
              <div className="text-xs text-numoria-mid">{t('stats.totalAttempts')}</div>
            </div>
            <div className="rounded-xl border-2 border-numoria-teal/30 bg-numoria-teal/5 p-3 text-center">
              <div className="font-display text-xl font-bold text-numoria-ink">
                {summary.totalSubmitted}
              </div>
              <div className="text-xs text-numoria-mid">{t('stats.submitted')}</div>
            </div>
            <div className="rounded-xl border-2 border-numoria-indigo/30 bg-white p-3 text-center">
              <div className="font-display text-xl font-bold text-numoria-ink">
                {summary.averageScore !== null ? summary.averageScore.toFixed(1) : '—'}
              </div>
              <div className="text-xs text-numoria-mid">{t('stats.avgScore')}</div>
            </div>
            <div className="rounded-xl border-2 border-numoria-niebla/30 bg-white p-3 text-center">
              <div className="font-display text-xl font-bold text-numoria-ink">
                {summary.maxPossibleScore}
              </div>
              <div className="text-xs text-numoria-mid">{t('stats.maxScore')}</div>
            </div>
          </div>

          {/* Filter + Export */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <form className="flex flex-col gap-1" method="get">
              <label
                htmlFor="team"
                className="text-xs font-bold uppercase tracking-wider text-numoria-mid"
              >
                {t('filter.byTeam')}
              </label>
              <div className="flex gap-2">
                <select
                  id="team"
                  name="team"
                  defaultValue={teamFilter ?? ''}
                  className="rounded-md border-2 border-numoria-niebla/40 bg-white px-3 py-2 text-sm text-numoria-ink focus:border-numoria-orange focus:outline-none"
                >
                  <option value="">{t('filter.allTeams')}</option>
                  {teacherTeams.map((tm) => (
                    <option key={tm.id} value={tm.id}>
                      {tm.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-md border-2 border-numoria-orange bg-white px-3 py-2 text-sm font-bold text-numoria-orange hover:bg-numoria-orange hover:text-white"
                >
                  {t('filter.apply')}
                </button>
              </div>
            </form>
            <a
              href={csvHref}
              className="inline-flex items-center gap-2 self-start rounded-md bg-numoria-orange px-4 py-2 text-sm font-bold text-white hover:bg-numoria-orange-hover sm:self-auto"
              download
            >
              📥 {t('exportCsv')}
            </a>
          </div>

          {/* Tabla — enableActions=true porque role=teacher (guard ya validado arriba) */}
          {entries.length > 0 ? (
            <LeaderboardTable entries={entries} labels={rowLabels} enableActions />
          ) : (
            <p className="rounded-xl border-2 border-dashed border-numoria-niebla/40 bg-white p-8 text-center text-sm text-numoria-mid">
              {t('noAttempts')}
            </p>
          )}
        </>
      )}

      <Link href="/contests" className="text-sm font-bold text-numoria-orange hover:underline">
        {t('backToContests')}
      </Link>
    </div>
  );
}
