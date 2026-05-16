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
  /** Calendar window en días — cuánto dura el periodo oficial del contest
   *  (Phase 4.4: default 30 días para modelo MOEMS). Backward compat: si
   *  undefined, usa durationMinutes como fallback (legacy Phase 3 behavior). */
  calendarWindowDays?: number;
  /** Session duration en minutos (default 35) — usado para fallback legacy
   *  cuando calendarWindowDays no está disponible. */
  durationMinutes: number;
  attempt: Pick<ContestAttempt, 'submitted_at' | 'total_score' | 'max_possible_score'> | null;
  now: Date;
}): {
  state: ContestState;
  yourScore?: number;
  yourMaxScore?: number;
} {
  const { status, scheduledAt, calendarWindowDays, durationMinutes, attempt, now } = args;
  const scheduledDate = new Date(scheduledAt);
  // Window end: prefiere calendar_window_days (Phase 4.4), fallback a duration_minutes (legacy)
  const endDate = calendarWindowDays
    ? new Date(scheduledDate.getTime() + calendarWindowDays * 24 * 60 * 60 * 1000)
    : new Date(scheduledDate.getTime() + durationMinutes * 60_000);

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
 *
 * Si `teacherStats` se pasa, la card se renderiza en modo teacher view
 * (oculta yourScore, muestra agregado del team + CTA leaderboard).
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
  > & {
    /** Phase 4.4 — opcional para backward compat con queries que no lo seleccionan */
    calendar_window_days?: number;
    /** Phase 4.5 — 'practice' siempre disponibles (no requieren sesión MOEMS) */
    contest_type?: 'practice' | 'official';
  };
  numProblems: number;
  attempt: Pick<ContestAttempt, 'submitted_at' | 'total_score' | 'max_possible_score'> | null;
  studentDivision: 'elementary' | 'middle';
  now: Date;
  /** Solo presente para teacher viewer — opt-in para teacher view. */
  teacherStats?: {
    submittedCount: number;
    totalMembers: number;
    avgScore: number | null;
  };
  /** Phase 4 — session 'open' del teacher para alguno de sus teams. */
  teacherOpenSession?: {
    sessionId: string;
    teamId: string;
    closesAt: string;
  };
  /** Phase 4 — Teams del teacher (para dropdown del modal abrir sesión). */
  teacherTeams?: Array<{ id: string; name: string; division: 'elementary' | 'middle' }>;
  /** Phase 4 — Student tiene una session 'open' en su team para este contest. */
  studentHasActiveSession?: boolean;
  /** Phase 4 — closes_at de la session activa del student (para UI countdown). */
  studentSessionClosesAt?: string;
}): ContestCardData {
  const {
    contest,
    numProblems,
    attempt,
    studentDivision,
    now,
    teacherStats,
    teacherOpenSession,
    teacherTeams,
    studentHasActiveSession,
    studentSessionClosesAt,
  } = args;
  const { state, yourScore, yourMaxScore } = deriveContestState({
    status: contest.status,
    scheduledAt: contest.scheduled_at,
    calendarWindowDays: contest.calendar_window_days,
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
    teacherStats,
    teacherOpenSession,
    teacherTeams,
    // Practices NUNCA requieren sesión MOEMS — siempre "active" para el student.
    // Officials respetan el gating por session activa del teacher.
    studentHasActiveSession: contest.contest_type === 'practice' ? true : studentHasActiveSession,
    studentSessionClosesAt,
  };
}
