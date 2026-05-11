import { ContestCard, type ContestCardData } from '@/components/contests/ContestCard';
import { deriveStudentDivision, toContestCardData } from '@/lib/contests/state';
import {
  type ContestTeacherStats,
  getTeacherStatsByContest,
} from '@/lib/contests/teacher-aggregates';
import { createServerClient } from '@numoria/database/server';
import type { Tables } from '@numoria/database/types';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

type Contest = Tables<'contests'>;
type ContestAttempt = Tables<'contest_attempts'>;
type Team = Tables<'teams'>;
type Profile = Tables<'profiles'>;

/**
 * Página /contests — listado de todos los contests visibles para el user actual,
 * agrupados en 3 secciones: activos / próximos / pasados.
 *
 * Visible solo para students y teachers autenticados onboarded.
 */
export default async function ContestsListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contests');

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Profile del user (para division derivation)
  const rpcResult = await supabase.rpc('get_my_profile');
  const profile = rpcResult.data as Profile | null;
  if (!profile) {
    redirect(`/${locale}/auth-error`);
  }

  // Determinar división del student (si tiene team, usa team.division; else por grade)
  let teamDivision: 'elementary' | 'middle' | null = null;
  if (profile.role === 'student') {
    const { data: membershipRow } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('student_id', user.id)
      .maybeSingle();
    if (membershipRow) {
      const teamId = (membershipRow as { team_id: string }).team_id;
      const { data: teamRow } = await supabase
        .from('teams')
        .select('division')
        .eq('id', teamId)
        .single();
      teamDivision = (teamRow as Pick<Team, 'division'> | null)?.division ?? null;
    }
  }

  const studentDivision = deriveStudentDivision({
    teamDivision,
    grade: profile.grade,
  });

  // Fetch todos los contests visibles (RLS authenticated_view_non_draft_contests)
  const { data: contestsRows } = await supabase
    .from('contests')
    .select(
      'id, slug, contest_number, season_year, division, title_es, title_en, scheduled_at, duration_minutes, calculator_allowed, status',
    )
    .neq('status', 'draft')
    .order('scheduled_at', { ascending: false });

  const contests = (contestsRows ?? []) as Array<
    Pick<
      Contest,
      | 'id'
      | 'slug'
      | 'contest_number'
      | 'season_year'
      | 'division'
      | 'title_es'
      | 'title_en'
      | 'scheduled_at'
      | 'duration_minutes'
      | 'calculator_allowed'
      | 'status'
    >
  >;

  if (contests.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
            🏆 {t('listTitle')}
          </h1>
          <p className="mt-2 text-sm text-numoria-mid">{t('listSubtitle')}</p>
        </header>
        <p className="rounded-xl border-2 border-dashed border-numoria-gray bg-white p-8 text-center text-sm text-numoria-mid">
          {t('sections.empty')}
        </p>
      </div>
    );
  }

  // Fetch contest_problems para contar # problemas por contest
  const contestIds = contests.map((c) => c.id);
  const { data: cpRows } = await supabase
    .from('contest_problems')
    .select('contest_id')
    .in('contest_id', contestIds);
  const problemCountByContest = new Map<string, number>();
  for (const row of (cpRows as Array<{ contest_id: string }> | null) ?? []) {
    problemCountByContest.set(row.contest_id, (problemCountByContest.get(row.contest_id) ?? 0) + 1);
  }

  // Fetch attempts del user actual (solo students tienen attempts)
  let attemptByContest = new Map<
    string,
    Pick<ContestAttempt, 'submitted_at' | 'total_score' | 'max_possible_score'>
  >();
  if (profile.role === 'student') {
    const { data: attemptRows } = await supabase
      .from('contest_attempts')
      .select('contest_id, submitted_at, total_score, max_possible_score')
      .in('contest_id', contestIds);
    attemptByContest = new Map(
      (
        (attemptRows as Array<
          Pick<ContestAttempt, 'submitted_at' | 'total_score' | 'max_possible_score'> & {
            contest_id: string;
          }
        > | null) ?? []
      ).map((a) => [a.contest_id, a]),
    );
  }

  // Fetch teacher stats por contest (solo si role=teacher)
  let teacherStatsByContest = new Map<string, ContestTeacherStats>();
  if (profile.role === 'teacher') {
    teacherStatsByContest = await getTeacherStatsByContest(supabase, {
      teacherId: user.id,
      contestIds,
    });
  }

  // Construir ContestCardData por contest
  const now = new Date();
  const cards: ContestCardData[] = contests.map((c) => {
    const stats = teacherStatsByContest.get(c.id);
    return toContestCardData({
      contest: c,
      numProblems: problemCountByContest.get(c.id) ?? 0,
      attempt: attemptByContest.get(c.id) ?? null,
      studentDivision,
      now,
      teacherStats: stats
        ? {
            submittedCount: stats.submittedCount,
            totalMembers: stats.totalMembers,
            avgScore: stats.avgScore,
          }
        : undefined,
    });
  });

  // Agrupar por sección
  const active = cards.filter((c) => c.state === 'active' || c.state === 'in-progress');
  const upcoming = cards.filter((c) => c.state === 'upcoming');
  const past = cards.filter((c) => c.state === 'expired' || c.state === 'completed');

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
          🏆 {t('listTitle')}
        </h1>
        <p className="mt-2 text-sm text-numoria-mid">{t('listSubtitle')}</p>
      </header>

      <ContestSection title={t('sections.active')} cards={active} empty={t('sections.empty')} />
      <ContestSection title={t('sections.upcoming')} cards={upcoming} empty={t('sections.empty')} />
      <ContestSection title={t('sections.past')} cards={past} empty={t('sections.empty')} />
    </div>
  );
}

function ContestSection({
  title,
  cards,
  empty,
}: {
  title: string;
  cards: ContestCardData[];
  empty: string;
}) {
  return (
    <section>
      <h2 className="mb-3 font-display text-lg font-bold text-numoria-ink">{title}</h2>
      {cards.length === 0 ? (
        <p className="rounded-md border-2 border-dashed border-numoria-gray bg-white/50 p-4 text-center text-sm text-numoria-mid">
          {empty}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {cards.map((card) => (
            <ContestCard key={card.id} data={card} />
          ))}
        </div>
      )}
    </section>
  );
}
