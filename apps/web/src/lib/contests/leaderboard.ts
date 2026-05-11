import type { Database } from '@numoria/database/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  /** Grado escolar del student (1-12). Null si no completó onboarding. */
  studentGrade: number | null;
  teamId: string;
  teamName: string;
  totalScore: number;
  totalCorrect: number;
  maxPossibleScore: number;
  timeSpentSeconds: number | null;
  submittedAt: string | null;
}

export interface LeaderboardSummary {
  totalAttempts: number;
  totalSubmitted: number;
  averageScore: number | null;
  maxPossibleScore: number;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  summary: LeaderboardSummary;
  /** Teams accesibles para el teacher actual (para el filter dropdown). */
  teacherTeams: Array<{ id: string; name: string; division: 'elementary' | 'middle' }>;
}

/**
 * Carga el leaderboard de un contest para un teacher.
 *
 * Flujo:
 * 1. Obtiene los teams donde coach_id = teacherId (RLS-friendly explicit filter).
 * 2. Obtiene los students miembros de esos teams.
 * 3. Fetch contest_attempts de esos students para el contest dado.
 *    RLS `teachers_view_team_contest_attempts` permite esto automáticamente,
 *    pero filtramos explícito para defense-in-depth.
 * 4. Resuelve display_name + team_name vía maps.
 * 5. Ordena: submitted DESC por score, time ASC (tiebreaker — más rápido gana).
 *    Non-submitted al fondo, sin rank de "ganador".
 *
 * @returns LeaderboardData con entries rankeados + summary stats + lista de teams.
 */
export async function getLeaderboardData(
  supabase: SupabaseClient<Database>,
  opts: {
    contestId: string;
    teacherId: string;
    /** Si se provee, filtra solo a students de ese team. */
    teamId?: string;
  },
): Promise<LeaderboardData> {
  const { contestId, teacherId, teamId } = opts;

  // Step 1: TODOS los teams del teacher (necesario para el filter dropdown,
  // independientemente del teamId aplicado).
  const { data: allTeamsRows } = await supabase
    .from('teams')
    .select('id, name, division')
    .eq('coach_id', teacherId);

  const teacherTeams = (allTeamsRows ?? []) as Array<{
    id: string;
    name: string;
    division: 'elementary' | 'middle';
  }>;

  // Subset filtrado: si teamId se especifica, solo ese; sino todos.
  const teams = teamId ? teacherTeams.filter((t) => t.id === teamId) : teacherTeams;

  if (teams.length === 0) {
    return {
      entries: [],
      summary: { totalAttempts: 0, totalSubmitted: 0, averageScore: null, maxPossibleScore: 0 },
      teacherTeams,
    };
  }

  const teamIds = teams.map((t) => t.id);
  const teamNameById = new Map(teams.map((t) => [t.id, t.name]));

  // Step 2: Students miembros
  const { data: memberRows } = await supabase
    .from('team_members')
    .select('student_id, team_id')
    .in('team_id', teamIds);
  const members = (memberRows ?? []) as Array<{ student_id: string; team_id: string }>;

  if (members.length === 0) {
    return {
      entries: [],
      summary: { totalAttempts: 0, totalSubmitted: 0, averageScore: null, maxPossibleScore: 0 },
      teacherTeams,
    };
  }

  const teamByStudent = new Map<string, string>();
  for (const m of members) teamByStudent.set(m.student_id, m.team_id);
  const studentIds = Array.from(new Set(members.map((m) => m.student_id)));

  // Step 3: contest_attempts
  const { data: attemptRows } = await supabase
    .from('contest_attempts')
    .select(
      'student_id, total_score, total_correct, max_possible_score, time_spent_seconds, submitted_at',
    )
    .eq('contest_id', contestId)
    .in('student_id', studentIds);

  const attempts = (attemptRows ?? []) as Array<{
    student_id: string;
    total_score: number;
    total_correct: number;
    max_possible_score: number;
    time_spent_seconds: number | null;
    submitted_at: string | null;
  }>;

  if (attempts.length === 0) {
    return {
      entries: [],
      summary: { totalAttempts: 0, totalSubmitted: 0, averageScore: null, maxPossibleScore: 0 },
      teacherTeams,
    };
  }

  // Step 4: Names + grades
  const { data: profileRows } = await supabase
    .from('profiles')
    .select('id, display_name, grade')
    .in('id', studentIds);
  const profileById = new Map<string, { name: string; grade: number | null }>(
    (
      (profileRows as Array<{
        id: string;
        display_name: string | null;
        grade: number | null;
      }> | null) ?? []
    ).map((p) => [p.id, { name: p.display_name ?? '—', grade: p.grade }]),
  );

  // Step 5: Build + rank
  // Política de ordenamiento:
  //   - Submitted con score > 0 → primero, ordenados por score DESC
  //   - Tiebreaker: time_spent_seconds ASC (más rápido = mejor)
  //   - Submitted con score 0 → después
  //   - Non-submitted → al final, sin rank competitivo (pero con rank numérico igual
  //     para que el teacher pueda ver TODOS sus students)
  const unranked = attempts.map((a) => {
    const prof = profileById.get(a.student_id);
    return {
      studentId: a.student_id,
      studentName: prof?.name ?? '—',
      studentGrade: prof?.grade ?? null,
      teamId: teamByStudent.get(a.student_id) ?? '',
      teamName: teamNameById.get(teamByStudent.get(a.student_id) ?? '') ?? '—',
      totalScore: a.total_score,
      totalCorrect: a.total_correct,
      maxPossibleScore: a.max_possible_score,
      timeSpentSeconds: a.time_spent_seconds,
      submittedAt: a.submitted_at,
    };
  });

  unranked.sort((a, b) => {
    // 1. Submitted antes que not-submitted
    if (a.submittedAt && !b.submittedAt) return -1;
    if (!a.submittedAt && b.submittedAt) return 1;
    // 2. Score DESC
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    // 3. Time ASC (más rápido = mejor)
    const aTime = a.timeSpentSeconds ?? Number.POSITIVE_INFINITY;
    const bTime = b.timeSpentSeconds ?? Number.POSITIVE_INFINITY;
    if (aTime !== bTime) return aTime - bTime;
    // 4. Estable por studentName
    return a.studentName.localeCompare(b.studentName);
  });

  const entries: LeaderboardEntry[] = unranked.map((e, idx) => ({ rank: idx + 1, ...e }));

  // Summary stats: solo cuenta submitted para average
  const submittedAttempts = attempts.filter((a) => a.submitted_at !== null);
  const summary: LeaderboardSummary = {
    totalAttempts: attempts.length,
    totalSubmitted: submittedAttempts.length,
    averageScore:
      submittedAttempts.length > 0
        ? submittedAttempts.reduce((sum, a) => sum + a.total_score, 0) / submittedAttempts.length
        : null,
    maxPossibleScore: attempts[0]?.max_possible_score ?? 0,
  };

  return { entries, summary, teacherTeams };
}
