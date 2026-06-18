import type { ServerClient } from '@numoria/database/server';

/**
 * Resultados detallados de los estudiantes del maestro, por challenge.
 *
 * RLS-safe: el maestro (sesión normal) puede leer team_members de sus teams,
 * los perfiles de sus estudiantes y sus contest_attempts (políticas
 * coach_views_team_members / teachers_view_school_students /
 * teachers_view_team_contest_attempts). No requiere admin client.
 */

export interface StudentResult {
  studentId: string;
  name: string;
  score: number;
  correct: number;
  maxScore: number;
  /** null = aún en progreso (no entregado). */
  submittedAt: string | null;
}

export interface ChallengeResults {
  contestId: string;
  titleEs: string;
  titleEn: string;
  contestType: string;
  scheduledAt: string;
  totalMembers: number;
  /** Estudiantes del maestro que tienen intento en este challenge (orden: mayor puntaje primero). */
  students: StudentResult[];
}

export interface TeacherResults {
  totalMembers: number;
  challenges: ChallengeResults[];
}

export async function getTeacherStudentResults(
  supabase: ServerClient,
  teacherId: string,
): Promise<TeacherResults> {
  // 1. Teams del maestro
  const { data: teamsRows } = await supabase.from('teams').select('id').eq('coach_id', teacherId);
  const teamIds = ((teamsRows ?? []) as Array<{ id: string }>).map((t) => t.id);
  if (teamIds.length === 0) return { totalMembers: 0, challenges: [] };

  // 2. Estudiantes (miembros de esos teams)
  const { data: memberRows } = await supabase
    .from('team_members')
    .select('student_id')
    .in('team_id', teamIds);
  const studentIds = Array.from(
    new Set(((memberRows ?? []) as Array<{ student_id: string }>).map((m) => m.student_id)),
  );
  const totalMembers = studentIds.length;
  if (studentIds.length === 0) return { totalMembers: 0, challenges: [] };

  // 3. Nombres
  const { data: profileRows } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', studentIds);
  const nameById = new Map<string, string>();
  for (const p of (profileRows ?? []) as Array<{ id: string; display_name: string | null }>) {
    nameById.set(p.id, p.display_name ?? 'Estudiante');
  }

  // 4. Intentos de esos estudiantes (todos sus challenges)
  const { data: attemptRows } = await supabase
    .from('contest_attempts')
    .select('contest_id, student_id, total_score, total_correct, max_possible_score, submitted_at')
    .in('student_id', studentIds);
  const attempts = (attemptRows ?? []) as Array<{
    contest_id: string;
    student_id: string;
    total_score: number;
    total_correct: number;
    max_possible_score: number;
    submitted_at: string | null;
  }>;
  if (attempts.length === 0) return { totalMembers, challenges: [] };

  // 5. Datos de los challenges involucrados
  const contestIds = Array.from(new Set(attempts.map((a) => a.contest_id)));
  const { data: contestRows } = await supabase
    .from('contests')
    .select('id, title_es, title_en, contest_type, scheduled_at')
    .in('id', contestIds);
  const contestById = new Map<
    string,
    { title_es: string; title_en: string; contest_type: string; scheduled_at: string }
  >();
  for (const c of (contestRows ?? []) as Array<{
    id: string;
    title_es: string;
    title_en: string;
    contest_type: string;
    scheduled_at: string;
  }>) {
    contestById.set(c.id, c);
  }

  // 6. Agrupar por challenge
  const byContest = new Map<string, StudentResult[]>();
  for (const a of attempts) {
    const arr = byContest.get(a.contest_id) ?? [];
    arr.push({
      studentId: a.student_id,
      name: nameById.get(a.student_id) ?? 'Estudiante',
      score: a.total_score,
      correct: a.total_correct,
      maxScore: a.max_possible_score,
      submittedAt: a.submitted_at,
    });
    byContest.set(a.contest_id, arr);
  }

  const challenges: ChallengeResults[] = [];
  for (const [contestId, students] of byContest.entries()) {
    const c = contestById.get(contestId);
    if (!c) continue;
    students.sort((a, b) => b.score - a.score);
    challenges.push({
      contestId,
      titleEs: c.title_es,
      titleEn: c.title_en,
      contestType: c.contest_type,
      scheduledAt: c.scheduled_at,
      totalMembers,
      students,
    });
  }
  // Challenges más recientes primero
  challenges.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  return { totalMembers, challenges };
}
