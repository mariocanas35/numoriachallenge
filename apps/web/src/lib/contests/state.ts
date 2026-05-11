import type { ContestCardData, ContestState } from '@/components/contests/ContestCard';
import type { Tables } from '@numoria/database/types';

type Contest = Tables<'contests'>;
type ContestAttempt = Tables<'contest_attempts'>;

/**
 * Deriva el estado UI de un contest basado en su status DB + tiempo actual +
 * attempt existente del student.
 *
 * Lógica:
 * - status='closed' o (status='active' AND now > scheduled_at + duration) → expired
 * - status='scheduled' o (status='active' AND now < scheduled_at) → upcoming
 * - attempt.submitted_at NOT NULL → completed
 * - attempt sin submit → in-progress
 * - sin attempt y window activo → active
 */
export function deriveContestState(args: {
  status: Contest['status'];
  scheduledAt: string;
  durationMinutes: number;
  attempt: Pick<ContestAttempt, 'submitted_at' | 'total_score' | 'max_possible_score'> | null;
  now: Date;
}): {
  state: ContestState;
  yourScore?: number;
  yourMaxScore?: number;
} {
  const { status, scheduledAt, durationMinutes, attempt, now } = args;
  const scheduledDate = new Date(scheduledAt);
  const endDate = new Date(scheduledDate.getTime() + durationMinutes * 60_000);

  // Attempt submitted → completed (overrides cualquier otro state)
  if (attempt?.submitted_at) {
    return {
      state: 'completed',
      yourScore: attempt.total_score,
      yourMaxScore: attempt.max_possible_score,
    };
  }

  // Contest closed o window expired
  if (status === 'closed' || now > endDate) {
    return { state: 'expired' };
  }

  // Antes del scheduled time
  if (status === 'scheduled' || now < scheduledDate) {
    return { state: 'upcoming' };
  }

  // Window activo
  if (attempt && !attempt.submitted_at) {
    return { state: 'in-progress' };
  }

  return { state: 'active' };
}

/**
 * Para un student dado, determina su división "natural":
 * - team.division si tiene team
 * - else: derivar de grade (4-6 = E, 7-8 = M, 6 default = E)
 */
export function deriveStudentDivision(args: {
  teamDivision: 'elementary' | 'middle' | null;
  grade: number | null;
}): 'elementary' | 'middle' {
  if (args.teamDivision) return args.teamDivision;
  if (args.grade && args.grade >= 7) return 'middle';
  return 'elementary'; // default incluye grado 6 si no hay team
}

/**
 * Convierte contest row + datos extras a ContestCardData listo para render.
 */
export function toContestCardData(args: {
  contest: Pick<
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
  >;
  numProblems: number;
  attempt: Pick<ContestAttempt, 'submitted_at' | 'total_score' | 'max_possible_score'> | null;
  studentDivision: 'elementary' | 'middle';
  now: Date;
}): ContestCardData {
  const { contest, numProblems, attempt, studentDivision, now } = args;
  const { state, yourScore, yourMaxScore } = deriveContestState({
    status: contest.status,
    scheduledAt: contest.scheduled_at,
    durationMinutes: contest.duration_minutes,
    attempt,
    now,
  });

  return {
    id: contest.id,
    slug: contest.slug,
    contestNumber: contest.contest_number,
    seasonYear: contest.season_year,
    division: contest.division,
    titleEs: contest.title_es,
    titleEn: contest.title_en,
    scheduledAt: contest.scheduled_at,
    durationMinutes: contest.duration_minutes,
    calculatorAllowed: contest.calculator_allowed,
    numProblems,
    state,
    yourScore,
    yourMaxScore,
    isYourDivision: contest.division === studentDivision,
  };
}
