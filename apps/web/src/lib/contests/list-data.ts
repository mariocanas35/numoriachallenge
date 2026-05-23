import type { ContestCardData } from '@/components/contests/ContestCard';
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
import type { createServerClient } from '@numoria/database/server';
import type { Tables } from '@numoria/database/types';

type Contest = Tables<'contests'>;
type ContestAttempt = Tables<'contest_attempts'>;
type Profile = Tables<'profiles'>;
type Team = Tables<'teams'>;

/** Tipo derivado del cliente real del proyecto — evita conflictos de
 * tipos genéricos entre @supabase/supabase-js raw y el wrapper del package. */
type AppSupabaseClient = Awaited<ReturnType<typeof createServerClient>>;

export type ContestListContext = Pick<
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
> & { calendar_window_days: number; contest_type: 'practice' | 'official' };

export interface ContestsListData {
  cards: ContestCardData[];
  contests: ContestListContext[];
  practices: ContestCardData[];
  officials: ContestCardData[];
  officialActive: ContestCardData[];
  officialUpcoming: ContestCardData[];
  officialPast: ContestCardData[];
  teacherTeams: TeacherTeam[];
  /** Helper para encontrar el contest crudo de una card */
  contestById: (id: string) => ContestListContext | undefined;
}

/**
 * Helper compartido por /contests, /contests/practices y /contests/officials.
 *
 * Fetch todo lo necesario para renderizar listas de contests:
 *   - Lista cruda de contests visibles (RLS authenticated_view_non_draft)
 *   - Count de problems por contest
 *   - Attempts del student logueado (si role=student)
 *   - Stats agregados del teacher (si role=teacher)
 *   - Sessions MOEMS abiertas (teacher + student perspectives)
 *
 * Devuelve cards ya transformadas + agrupaciones (practices vs officials,
 * y officials por calendar state).
 */
export async function fetchContestsListData(
  supabase: AppSupabaseClient,
  userId: string,
  profile: Profile,
): Promise<ContestsListData> {
  // Division del student (si es teacher, da igual)
  let teamDivision: 'elementary' | 'middle' | null = null;
  if (profile.role === 'student') {
    const { data: membershipRow } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('student_id', userId)
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

  // Fetch contests
  const { data: contestsRows } = await supabase
    .from('contests')
    .select(
      'id, slug, contest_number, season_year, division, title_es, title_en, scheduled_at, duration_minutes, calendar_window_days, calculator_allowed, status, contest_type',
    )
    .neq('status', 'draft')
    .order('scheduled_at', { ascending: false });

  const allContests = (contestsRows ?? []) as ContestListContext[];

  // Filtrar contests por team_division del estudiante:
  // - Si el estudiante pertenece a un team → solo ve contests de la división de su team
  // - Si NO tiene team → ve todos (puede practicar antes de unirse a un team)
  // - Teachers ven todos para administrar sus equipos
  const contests =
    profile.role === 'student' && teamDivision
      ? allContests.filter((c) => c.division === teamDivision)
      : allContests;

  if (contests.length === 0) {
    return {
      cards: [],
      contests: [],
      practices: [],
      officials: [],
      officialActive: [],
      officialUpcoming: [],
      officialPast: [],
      teacherTeams: [],
      contestById: () => undefined,
    };
  }

  const contestIds = contests.map((c) => c.id);

  // Counts de problems
  const { data: cpRows } = await supabase
    .from('contest_problems')
    .select('contest_id')
    .in('contest_id', contestIds);
  const problemCountByContest = new Map<string, number>();
  for (const row of (cpRows as Array<{ contest_id: string }> | null) ?? []) {
    problemCountByContest.set(row.contest_id, (problemCountByContest.get(row.contest_id) ?? 0) + 1);
  }

  // Attempts del student
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

  // Teacher data (Phase 4 MOEMS)
  let teacherStatsByContest = new Map<string, ContestTeacherStats>();
  let teacherTeams: TeacherTeam[] = [];
  let openSessionsByContest = new Map<string, OpenSession>();
  if (profile.role === 'teacher') {
    [teacherStatsByContest, teacherTeams, openSessionsByContest] = await Promise.all([
      getTeacherStatsByContest(supabase, { teacherId: userId, contestIds }),
      getTeacherTeams(supabase, userId),
      getTeacherOpenSessions(supabase, { teacherId: userId, contestIds }),
    ]);
  }

  // Student sessions
  let studentSessionsByContest = new Map<
    string,
    { id: string; contestId: string; teamId: string; closesAt: string }
  >();
  if (profile.role === 'student') {
    studentSessionsByContest = await getStudentActiveSessions(supabase, {
      studentId: userId,
      contestIds,
    });
  }

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

  const contestById = (id: string) => contests.find((c) => c.id === id);

  const practices = cards.filter((c) => contestById(c.id)?.contest_type === 'practice');
  const officials = cards.filter((c) => contestById(c.id)?.contest_type === 'official');

  const officialActive = officials.filter((c) => c.state === 'active' || c.state === 'in-progress');
  const officialUpcoming = officials.filter((c) => c.state === 'upcoming');
  const officialPast = officials.filter((c) => c.state === 'expired' || c.state === 'completed');

  return {
    cards,
    contests,
    practices,
    officials,
    officialActive,
    officialUpcoming,
    officialPast,
    teacherTeams,
    contestById,
  };
}

/**
 * Agrupa practice cards por contest_number y ordena cada grupo internamente
 * (E sin-calc → M sin-calc → M con-calc). Devuelve los grupos ordenados por
 * número de práctica ascendente.
 */
export function groupContestsByNumber(
  cards: ContestCardData[],
  contestById: (id: string) => ContestListContext | undefined,
): Array<{ number: number; cards: ContestCardData[] }> {
  const byNumber = new Map<number, ContestCardData[]>();
  for (const card of cards) {
    const contest = contestById(card.id);
    if (!contest) continue;
    const list = byNumber.get(contest.contest_number) ?? [];
    list.push(card);
    byNumber.set(contest.contest_number, list);
  }

  const variantRank = (cardId: string): number => {
    const contest = contestById(cardId);
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

/**
 * Metadata visual de cada variante de un contest (E sin-calc, M sin-calc,
 * M con-calc). Usado por las cards de prácticas y oficiales para mostrar
 * íconos diferenciados.
 *
 * Recibe un `t()` helper apuntando al namespace `contests.variants` para
 * que las etiquetas se traduzcan según el locale activo.
 */
export interface VariantMeta {
  icon: string;
  label: string;
  shortLabel: string;
}

export function variantOf(
  contest: { division: string; calculator_allowed: boolean },
  t: (key: string) => string,
): VariantMeta {
  if (contest.division === 'elementary') {
    return { icon: '🧒', label: t('primaryFull'), shortLabel: t('primaryShort') };
  }
  if (contest.division === 'middle' && !contest.calculator_allowed) {
    return { icon: '🧠', label: t('middleNoCalcFull'), shortLabel: t('middleNoCalcShort') };
  }
  return { icon: '🧮', label: t('middleCalcFull'), shortLabel: t('middleCalcShort') };
}
