import { ContestCard, type ContestCardData } from '@/components/contests/ContestCard';
import { getStudentActiveSessions } from '@/lib/contests/sessions';
import { deriveStudentDivision, toContestCardData } from '@/lib/contests/state';
import {
  type ContestTeacherStats,
  type OpenSession,
  type TeacherTeam,
  getTeacherOpenSessions,
  getTeacherStatsByContest,
  getTeacherTeams,
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
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ startError?: string }>;
}) {
  const { locale } = await params;
  const { startError } = await searchParams;
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
      'id, slug, contest_number, season_year, division, title_es, title_en, scheduled_at, duration_minutes, calendar_window_days, calculator_allowed, status, contest_type',
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
    > & { calendar_window_days: number; contest_type: 'practice' | 'official' }
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

  // Fetch teacher data (solo si role=teacher):
  //   - stats agregados por contest
  //   - teams del teacher (para dropdown OpenSessionButton)
  //   - sessions abiertas por contest
  let teacherStatsByContest = new Map<string, ContestTeacherStats>();
  let teacherTeams: TeacherTeam[] = [];
  let openSessionsByContest = new Map<string, OpenSession>();
  if (profile.role === 'teacher') {
    [teacherStatsByContest, teacherTeams, openSessionsByContest] = await Promise.all([
      getTeacherStatsByContest(supabase, { teacherId: user.id, contestIds }),
      getTeacherTeams(supabase, user.id),
      getTeacherOpenSessions(supabase, { teacherId: user.id, contestIds }),
    ]);
  }

  // Fetch student sessions (Phase 4 MOEMS) — para saber si su team tiene sesión
  // abierta. Si no hay sesión, la card muestra "Esperando maestro" en vez de
  // "Empezar contest".
  let studentSessionsByContest = new Map<
    string,
    { id: string; contestId: string; teamId: string; closesAt: string }
  >();
  if (profile.role === 'student') {
    studentSessionsByContest = await getStudentActiveSessions(supabase, {
      studentId: user.id,
      contestIds,
    });
  }

  // Construir ContestCardData por contest
  const now = new Date();
  const cards: ContestCardData[] = contests.map((c) => {
    const stats = teacherStatsByContest.get(c.id);
    const openSession = openSessionsByContest.get(c.id);
    const studentSession = studentSessionsByContest.get(c.id);
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
      teacherOpenSession: openSession
        ? {
            sessionId: openSession.id,
            teamId: openSession.teamId,
            closesAt: openSession.closesAt,
          }
        : undefined,
      teacherTeams: profile.role === 'teacher' ? teacherTeams : undefined,
      studentHasActiveSession: studentSession !== undefined,
      studentSessionClosesAt: studentSession?.closesAt,
    });
  });

  // Separar practices vs officials (Phase 4.5a)
  // El cards array tiene contestType derivado del contest.contest_type
  // Practices: siempre disponibles, no se agrupan por calendar state
  // Officials: agrupados por activos/próximos/pasados según calendar
  const practices = cards.filter((c) => {
    const contest = contests.find((ct) => ct.id === c.id);
    return contest?.contest_type === 'practice';
  });
  const officials = cards.filter((c) => {
    const contest = contests.find((ct) => ct.id === c.id);
    return contest?.contest_type === 'official';
  });

  const officialActive = officials.filter((c) => c.state === 'active' || c.state === 'in-progress');
  const officialUpcoming = officials.filter((c) => c.state === 'upcoming');
  const officialPast = officials.filter((c) => c.state === 'expired' || c.state === 'completed');

  return (
    <div className="flex flex-col gap-8">
      {startError && (
        <div className="rounded-xl border-2 border-numoria-coral/40 bg-numoria-coral/5 p-4">
          <p className="text-sm font-bold text-numoria-coral">
            ⚠️{' '}
            {startError === 'session_not_open'
              ? 'No hay una sesión abierta de este contest para tu equipo.'
              : startError === 'Contest is not active'
                ? 'Este contest no está activo en este momento.'
                : startError === 'Contest has not started yet'
                  ? 'Este contest aún no ha empezado.'
                  : startError === 'Contest window has expired'
                    ? 'La ventana de este contest ya expiró.'
                    : `No se pudo empezar el contest: ${startError}`}
          </p>
          <p className="mt-1 text-xs text-numoria-mid">
            Tu maestro debe abrir una sesión para tu equipo desde su dashboard. La sesión dura 35
            minutos y permite que todos los students del equipo entren al contest.
          </p>
        </div>
      )}

      <header>
        <h1 className="font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
          🏆 {t('listTitle')}
        </h1>
        <p className="mt-2 text-sm text-numoria-mid">{t('listSubtitle')}</p>
      </header>

      {/* Phase 4.5a — Sección PRÁCTICAS arriba (siempre disponibles, no expiran).
          Agrupadas en "carpetas" por contest_number — cada práctica tiene 3
          versiones (E sin-calc, M sin-calc, M con-calc) que se muestran lado
          a lado en desktop, apiladas en móvil.

          id="practices" → target del redirect /contests/practices (Tarea 1). */}
      {practices.length > 0 && (
        <section id="practices" className="scroll-mt-6">
          <h2 className="mb-3 font-display text-lg font-bold text-numoria-ink">
            📚 {t('sections.practices')}
          </h2>
          <p className="mb-5 text-sm text-numoria-mid">{t('sections.practicesSubtitle')}</p>
          <div className="flex flex-col gap-6">
            {groupPracticesByNumber(practices, contests).map(({ number, cards }) => (
              <div
                key={number}
                className="rounded-2xl border-2 border-numoria-teal/20 bg-numoria-teal/5 p-4"
              >
                <h3 className="mb-3 font-display text-base font-bold text-numoria-ink">
                  {t('sections.practiceGroupHeader', { number })}
                </h3>
                <div className="grid gap-3 md:grid-cols-3">
                  {cards.map((card) => (
                    <ContestCard key={card.id} data={card} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CONTESTS OFICIALES — agrupados por calendar state.
          id="officials" → target del redirect /contests/officials (Tarea 1). */}
      <section id="officials" className="scroll-mt-6">
        <h2 className="mb-3 font-display text-xl font-bold text-numoria-ink">
          🏆 {t('sections.officials')}
        </h2>
        <p className="mb-4 text-sm text-numoria-mid">{t('sections.officialsSubtitle')}</p>
        <div className="flex flex-col gap-6">
          <ContestSection
            title={t('sections.active')}
            cards={officialActive}
            empty={t('sections.empty')}
          />
          <ContestSection
            title={t('sections.upcoming')}
            cards={officialUpcoming}
            empty={t('sections.empty')}
          />
          <ContestSection
            title={t('sections.past')}
            cards={officialPast}
            empty={t('sections.empty')}
          />
        </div>
      </section>
    </div>
  );
}

/**
 * Agrupa practice cards por contest_number y ordena cada grupo internamente
 * (E sin-calc → M sin-calc → M con-calc). Devuelve los grupos ordenados por
 * número de práctica ascendente.
 */
function groupPracticesByNumber(
  cards: ContestCardData[],
  contests: Array<{
    id: string;
    contest_number: number;
    division: string;
    calculator_allowed: boolean;
  }>,
): Array<{ number: number; cards: ContestCardData[] }> {
  const byNumber = new Map<number, ContestCardData[]>();
  for (const card of cards) {
    const contest = contests.find((c) => c.id === card.id);
    if (!contest) continue;
    const list = byNumber.get(contest.contest_number) ?? [];
    list.push(card);
    byNumber.set(contest.contest_number, list);
  }

  // Orden interno: elementary-noCalc → middle-noCalc → middle-calc
  const variantRank = (cardId: string): number => {
    const contest = contests.find((c) => c.id === cardId);
    if (!contest) return 99;
    if (contest.division === 'elementary') return 0;
    if (contest.division === 'middle' && !contest.calculator_allowed) return 1;
    return 2;
  };

  return Array.from(byNumber.entries())
    .sort(([a], [b]) => a - b)
    .map(([number, list]) => ({
      number,
      cards: [...list].sort((a, b) => variantRank(a.id) - variantRank(b.id)),
    }));
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
