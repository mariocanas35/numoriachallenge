import type { ServerClient } from '@numoria/database/server';

export interface LeaderboardEntry {
  rank: number;
  /** ID del contest_attempt — usado por grant retry */
  attemptId: string;
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
  /** Phase 4 MOEMS: ID de la session asociada al attempt. Null si legacy Phase 3. */
  sessionId: string | null;
  /** Phase 4 MOEMS: true si la session está aún 'open' (teacher puede grant retry). */
  canGrantRetry: boolean;
  /** Phase 4.2: true si el attempt fue creado por teacher vía paper-entry. */
  isPaperEntry: boolean;
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
  supabase: ServerClient,
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

  // Step 3: contest_attempts (incluye id + session_id + is_paper_entry para Phase 4)
  const { data: attemptRows } = await supabase
    .from('contest_attempts')
    .select(
      'id, student_id, total_score, total_correct, max_possible_score, time_spent_seconds, submitted_at, session_id, is_paper_entry',
    )
    .eq('contest_id', contestId)
    .in('student_id', studentIds);

  const attempts = (attemptRows ?? []) as Array<{
    id: string;
    student_id: string;
    total_score: number;
    total_correct: number;
    max_possible_score: number;
    time_spent_seconds: number | null;
    submitted_at: string | null;
    session_id: string | null;
    is_paper_entry: boolean;
  }>;

  // Fetch sessions status para validar canGrantRetry (Phase 4)
  const sessionIds = Array.from(
    new Set(attempts.map((a) => a.session_id).filter((s): s is string => s !== null)),
  );
  const sessionStatusById = new Map<string, 'open' | 'closed' | 'expired'>();
  if (sessionIds.length > 0) {
    const { data: sessionRows } = await supabase
      .from('contest_sessions')
      .select('id, status')
      .in('id', sessionIds);
    for (const row of ((sessionRows ?? []) as Array<{
      id: string;
      status: 'open' | 'closed' | 'expired';
    }>) ?? []) {
      sessionStatusById.set(row.id, row.status);
    }
  }

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
    const sessionStatus = a.session_id ? sessionStatusById.get(a.session_id) : null;
    return {
      attemptId: a.id,
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
      sessionId: a.session_id,
      // canGrantRetry = attempt tiene session AND la session sigue open
      canGrantRetry: a.session_id !== null && sessionStatus === 'open',
      isPaperEntry: a.is_paper_entry,
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

// ============================================================
// Aggregated Practices Leaderboard
// ============================================================

export interface AggregatedLeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  studentGrade: number | null;
  teamId: string;
  teamName: string;
  /** Suma de scores en todas las prácticas completadas */
  totalScore: number;
  /** Suma de máximos posibles (para calcular %) */
  totalMaxPossible: number;
  /** Número de prácticas en las que participó (con attempt submitted) */
  practicesCompleted: number;
  /** Última actividad — fecha más reciente de submitted_at */
  lastActivityAt: string | null;
  /** True si esta entry es del usuario logueado (para highlight UI) */
  isCurrentUser: boolean;
}

export interface AggregatedLeaderboardData {
  entries: AggregatedLeaderboardEntry[];
  /** Cantidad total de prácticas activas en este scope (denominador para "X de Y") */
  totalPractices: number;
  /** División de los entries (elementary o middle) */
  division: 'elementary' | 'middle' | 'mixed';
  /** Si filtró por teamId, nombre del team. Sino, null. */
  teamName: string | null;
  /** Rank del usuario actual en el leaderboard (1-indexed). Null si no aparece. */
  currentUserRank: number | null;
}

/**
 * Leaderboard AGREGADO de todas las prácticas — suma scores acumulados.
 *
 * Cobertura:
 *   - Solo contests con contest_type='practice'
 *   - Solo attempts con submitted_at IS NOT NULL
 *
 * Scope:
 *   - Si teamId se especifica → solo estudiantes de ese team
 *   - Si no → todos los estudiantes de la división (vista pública/global)
 *
 * Métrica:
 *   - totalScore = SUM(contest_attempts.total_score)
 *   - practicesCompleted = COUNT(DISTINCT contest_id)
 *   - Ranking: ORDER BY totalScore DESC, practicesCompleted DESC, lastActivity ASC
 */
export async function getPracticesAggregatedLeaderboard(
  supabase: ServerClient,
  opts: {
    /** ID del usuario actual — para detectar isCurrentUser */
    currentUserId: string;
    /** Si se especifica, filtra a estudiantes de ese team */
    teamId?: string;
    /** Si se especifica (y teamId no), filtra a estudiantes de esa división */
    division?: 'elementary' | 'middle';
  },
): Promise<AggregatedLeaderboardData> {
  const { currentUserId, teamId, division } = opts;

  // Step 1: Identificar contests de tipo 'practice' activas
  const { data: practiceContestsRows } = await supabase
    .from('contests')
    .select('id, division')
    .eq('contest_type', 'practice')
    .neq('status', 'draft');

  const practiceContests =
    (practiceContestsRows as Array<{ id: string; division: 'elementary' | 'middle' }> | null) ?? [];
  const practiceIds = practiceContests.map((c) => c.id);

  if (practiceIds.length === 0) {
    return {
      entries: [],
      totalPractices: 0,
      division: division ?? 'mixed',
      teamName: null,
      currentUserRank: null,
    };
  }

  // Step 2: Identificar los students target (filtro por team o division)
  let teamName: string | null = null;
  let targetStudentIds: string[] = [];
  const studentTeamMap = new Map<string, { teamId: string; teamName: string }>();

  if (teamId) {
    // Filtro por team específico
    const { data: teamRow } = await supabase
      .from('teams')
      .select('id, name, division')
      .eq('id', teamId)
      .single();
    const team = teamRow as { id: string; name: string; division: 'elementary' | 'middle' } | null;
    if (!team) {
      return {
        entries: [],
        totalPractices: 0,
        division: 'mixed',
        teamName: null,
        currentUserRank: null,
      };
    }
    teamName = team.name;

    const { data: membersRows } = await supabase
      .from('team_members')
      .select('student_id')
      .eq('team_id', teamId);
    const members = (membersRows as Array<{ student_id: string }> | null) ?? [];
    targetStudentIds = members.map((m) => m.student_id);
    for (const m of members) {
      studentTeamMap.set(m.student_id, { teamId: team.id, teamName: team.name });
    }
  } else {
    // Filtro por division (todos los teams de esa division)
    const targetDivision = division ?? 'elementary';
    const { data: teamsRows } = await supabase
      .from('teams')
      .select('id, name, division')
      .eq('division', targetDivision);
    const teams =
      (teamsRows as Array<{
        id: string;
        name: string;
        division: 'elementary' | 'middle';
      }> | null) ?? [];
    const teamIds = teams.map((t) => t.id);

    if (teamIds.length > 0) {
      const { data: membersRows } = await supabase
        .from('team_members')
        .select('student_id, team_id')
        .in('team_id', teamIds);
      const members = (membersRows as Array<{ student_id: string; team_id: string }> | null) ?? [];
      targetStudentIds = members.map((m) => m.student_id);
      const teamById = new Map(teams.map((t) => [t.id, t]));
      for (const m of members) {
        const t = teamById.get(m.team_id);
        if (t) studentTeamMap.set(m.student_id, { teamId: t.id, teamName: t.name });
      }
    }
  }

  if (targetStudentIds.length === 0) {
    return {
      entries: [],
      totalPractices: practiceIds.length,
      division: division ?? 'mixed',
      teamName,
      currentUserRank: null,
    };
  }

  // Step 3: Fetch attempts submitted por los target students en esas prácticas
  const { data: attemptsRows } = await supabase
    .from('contest_attempts')
    .select('id, student_id, contest_id, total_score, max_possible_score, submitted_at')
    .in('student_id', targetStudentIds)
    .in('contest_id', practiceIds)
    .not('submitted_at', 'is', null);

  const attempts =
    (attemptsRows as Array<{
      id: string;
      student_id: string;
      contest_id: string;
      total_score: number;
      max_possible_score: number;
      submitted_at: string;
    }> | null) ?? [];

  // Step 4: Resolve student names + grades
  const { data: profilesRows } = await supabase
    .from('profiles')
    .select('id, display_name, grade')
    .in('id', targetStudentIds);
  const profilesMap = new Map(
    (
      (profilesRows as Array<{ id: string; display_name: string; grade: number | null }> | null) ??
      []
    ).map((p) => [p.id, p]),
  );

  // Step 5: Aggregate por student
  const aggregateByStudent = new Map<
    string,
    {
      totalScore: number;
      totalMaxPossible: number;
      practiceIds: Set<string>;
      lastActivityAt: string | null;
    }
  >();

  for (const a of attempts) {
    const existing = aggregateByStudent.get(a.student_id) ?? {
      totalScore: 0,
      totalMaxPossible: 0,
      practiceIds: new Set<string>(),
      lastActivityAt: null as string | null,
    };
    existing.totalScore += a.total_score;
    existing.totalMaxPossible += a.max_possible_score;
    existing.practiceIds.add(a.contest_id);
    if (!existing.lastActivityAt || a.submitted_at > existing.lastActivityAt) {
      existing.lastActivityAt = a.submitted_at;
    }
    aggregateByStudent.set(a.student_id, existing);
  }

  // Step 6: Build entries (incluir TODOS los target students, incluso los que no han hecho nada)
  const rawEntries: Array<Omit<AggregatedLeaderboardEntry, 'rank'>> = targetStudentIds.map(
    (studentId) => {
      const profile = profilesMap.get(studentId);
      const teamInfo = studentTeamMap.get(studentId);
      const agg = aggregateByStudent.get(studentId);
      return {
        studentId,
        studentName: profile?.display_name ?? 'Estudiante',
        studentGrade: profile?.grade ?? null,
        teamId: teamInfo?.teamId ?? '',
        teamName: teamInfo?.teamName ?? '—',
        totalScore: agg?.totalScore ?? 0,
        totalMaxPossible: agg?.totalMaxPossible ?? 0,
        practicesCompleted: agg?.practiceIds.size ?? 0,
        lastActivityAt: agg?.lastActivityAt ?? null,
        isCurrentUser: studentId === currentUserId,
      };
    },
  );

  // Step 7: Sort + rank
  rawEntries.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    if (b.practicesCompleted !== a.practicesCompleted)
      return b.practicesCompleted - a.practicesCompleted;
    // Tiebreaker: quien envió antes (lastActivity más temprana) gana
    if (a.lastActivityAt && b.lastActivityAt) {
      return a.lastActivityAt < b.lastActivityAt ? -1 : 1;
    }
    return 0;
  });

  const entries: AggregatedLeaderboardEntry[] = rawEntries.map((e, idx) => ({
    ...e,
    rank: idx + 1,
  }));

  const currentUserEntry = entries.find((e) => e.isCurrentUser);
  const currentUserRank = currentUserEntry?.rank ?? null;

  // Determinar division mostrada (si el filtro fue por team, usar la division de ese team)
  let displayDivision: 'elementary' | 'middle' | 'mixed' = division ?? 'mixed';
  if (teamId) {
    const { data: teamDivRow } = await supabase
      .from('teams')
      .select('division')
      .eq('id', teamId)
      .single();
    const td = (teamDivRow as { division: 'elementary' | 'middle' } | null)?.division;
    if (td) displayDivision = td;
  }

  return {
    entries,
    totalPractices: practiceIds.length,
    division: displayDivision,
    teamName,
    currentUserRank,
  };
}
