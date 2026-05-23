import type { ServerClient } from '@numoria/database/server';

export interface StudentPracticeStats {
  /** Prácticas completadas (con attempt submitted) por el estudiante */
  practicesCompleted: number;
  /** Total de prácticas activas disponibles para su división */
  totalPracticesAvailable: number;
  /** Score promedio del estudiante como % (0-100) */
  myAvgPercent: number;
  /** Suma total de puntos del estudiante */
  myTotalScore: number;
  /** Mejor score % en una sola práctica (0-100) */
  myBestPercent: number;
  /** Promedio % del team del estudiante (todas sus prácticas) */
  teamAvgPercent: number | null;
  /** Promedio % de todos los estudiantes del país del estudiante */
  nationalAvgPercent: number | null;
  /** Promedio % de todos los estudiantes en la plataforma (misma división) */
  globalAvgPercent: number | null;
}

/**
 * Calcula estadísticas agregadas de prácticas para un estudiante específico,
 * con comparaciones contra team / nacional / global.
 *
 * Definiciones:
 *   - Practice: contests con contest_type='practice' y status='active'
 *   - Completed: attempt con submitted_at IS NOT NULL
 *   - Avg %: suma(total_score) / suma(max_possible_score) * 100
 *   - Nacional: estudiantes cuya school.country_code === student.school.country_code
 *               Y división == studentDivision
 *   - Global: TODOS los estudiantes de la misma división
 */
export async function getStudentPracticeStats(
  supabase: ServerClient,
  opts: {
    studentId: string;
    studentTeamId: string | null;
    studentDivision: 'elementary' | 'middle';
    studentCountryCode: string | null;
  },
): Promise<StudentPracticeStats> {
  const { studentId, studentTeamId, studentDivision, studentCountryCode } = opts;

  // 1. Lista de prácticas activas de la división del estudiante
  const { data: practicesRows } = await supabase
    .from('contests')
    .select('id, max_score:contest_problems(problem:problems(points))')
    .eq('contest_type', 'practice')
    .eq('status', 'active')
    .eq('division', studentDivision);

  const practices = ((practicesRows ?? []) as Array<{ id: string }>) ?? [];
  const totalPracticesAvailable = practices.length;
  const practiceIds = practices.map((p) => p.id);

  if (practiceIds.length === 0) {
    return {
      practicesCompleted: 0,
      totalPracticesAvailable: 0,
      myAvgPercent: 0,
      myTotalScore: 0,
      myBestPercent: 0,
      teamAvgPercent: null,
      nationalAvgPercent: null,
      globalAvgPercent: null,
    };
  }

  // 2. Stats del estudiante
  const { data: myAttemptsRows } = await supabase
    .from('contest_attempts')
    .select('total_score, max_possible_score, submitted_at, contest_id')
    .eq('student_id', studentId)
    .in('contest_id', practiceIds)
    .not('submitted_at', 'is', null);

  const myAttempts =
    (myAttemptsRows as Array<{
      total_score: number;
      max_possible_score: number;
      submitted_at: string;
      contest_id: string;
    }> | null) ?? [];

  const myTotalScore = myAttempts.reduce((sum, a) => sum + a.total_score, 0);
  const myTotalMax = myAttempts.reduce((sum, a) => sum + a.max_possible_score, 0);
  const myAvgPercent = myTotalMax > 0 ? Math.round((myTotalScore / myTotalMax) * 100) : 0;
  const myBestPercent = myAttempts.reduce((best, a) => {
    if (a.max_possible_score <= 0) return best;
    const pct = (a.total_score / a.max_possible_score) * 100;
    return pct > best ? pct : best;
  }, 0);
  const practicesCompleted = myAttempts.length;

  // 3. Team average — solo si el estudiante tiene team
  let teamAvgPercent: number | null = null;
  if (studentTeamId) {
    const { data: teamMembersRows } = await supabase
      .from('team_members')
      .select('student_id')
      .eq('team_id', studentTeamId);
    const teamStudentIds =
      ((teamMembersRows as Array<{ student_id: string }> | null) ?? []).map((m) => m.student_id) ??
      [];

    if (teamStudentIds.length > 0) {
      const { data: teamAttemptsRows } = await supabase
        .from('contest_attempts')
        .select('total_score, max_possible_score')
        .in('student_id', teamStudentIds)
        .in('contest_id', practiceIds)
        .not('submitted_at', 'is', null);
      const teamAttempts =
        (teamAttemptsRows as Array<{
          total_score: number;
          max_possible_score: number;
        }> | null) ?? [];
      const teamTotalScore = teamAttempts.reduce((sum, a) => sum + a.total_score, 0);
      const teamTotalMax = teamAttempts.reduce((sum, a) => sum + a.max_possible_score, 0);
      teamAvgPercent = teamTotalMax > 0 ? Math.round((teamTotalScore / teamTotalMax) * 100) : null;
    }
  }

  // 4. National average — estudiantes en escuelas del mismo país, misma división
  let nationalAvgPercent: number | null = null;
  if (studentCountryCode) {
    // Schools en ese país
    const { data: schoolsRows } = await supabase
      .from('schools')
      .select('id')
      .eq('country_code', studentCountryCode);
    const schoolIds = ((schoolsRows as Array<{ id: string }> | null) ?? []).map((s) => s.id);

    if (schoolIds.length > 0) {
      // Teams de esas escuelas, misma división
      const { data: teamsRows } = await supabase
        .from('teams')
        .select('id')
        .in('school_id', schoolIds)
        .eq('division', studentDivision);
      const nationalTeamIds = ((teamsRows as Array<{ id: string }> | null) ?? []).map((t) => t.id);

      if (nationalTeamIds.length > 0) {
        // Students en esos teams
        const { data: membersRows } = await supabase
          .from('team_members')
          .select('student_id')
          .in('team_id', nationalTeamIds);
        const nationalStudentIds = Array.from(
          new Set(
            ((membersRows as Array<{ student_id: string }> | null) ?? []).map((m) => m.student_id),
          ),
        );

        if (nationalStudentIds.length > 0) {
          const { data: nationalAttemptsRows } = await supabase
            .from('contest_attempts')
            .select('total_score, max_possible_score')
            .in('student_id', nationalStudentIds)
            .in('contest_id', practiceIds)
            .not('submitted_at', 'is', null);
          const nationalAttempts =
            (nationalAttemptsRows as Array<{
              total_score: number;
              max_possible_score: number;
            }> | null) ?? [];
          const nTotalScore = nationalAttempts.reduce((sum, a) => sum + a.total_score, 0);
          const nTotalMax = nationalAttempts.reduce((sum, a) => sum + a.max_possible_score, 0);
          nationalAvgPercent = nTotalMax > 0 ? Math.round((nTotalScore / nTotalMax) * 100) : null;
        }
      }
    }
  }

  // 5. Global average — todos los attempts de prácticas de esa división
  const { data: globalAttemptsRows } = await supabase
    .from('contest_attempts')
    .select('total_score, max_possible_score')
    .in('contest_id', practiceIds)
    .not('submitted_at', 'is', null);
  const globalAttempts =
    (globalAttemptsRows as Array<{
      total_score: number;
      max_possible_score: number;
    }> | null) ?? [];
  const gTotalScore = globalAttempts.reduce((sum, a) => sum + a.total_score, 0);
  const gTotalMax = globalAttempts.reduce((sum, a) => sum + a.max_possible_score, 0);
  const globalAvgPercent = gTotalMax > 0 ? Math.round((gTotalScore / gTotalMax) * 100) : null;

  return {
    practicesCompleted,
    totalPracticesAvailable,
    myAvgPercent,
    myTotalScore,
    myBestPercent: Math.round(myBestPercent),
    teamAvgPercent,
    nationalAvgPercent,
    globalAvgPercent,
  };
}
