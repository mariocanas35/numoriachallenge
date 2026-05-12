import type { ServerClient } from '@numoria/database/server';

export interface ContestTeacherStats {
  contestId: string;
  /** Estudiantes del teacher que entregaron este contest. */
  submittedCount: number;
  /** Total de students en los teams del teacher. */
  totalMembers: number;
  /** Promedio de scores entre los entregados; null si nadie entregó. */
  avgScore: number | null;
}

/**
 * Calcula stats agregados por contest para todos los students del teacher.
 *
 * Se usa en el listado /contests cuando el viewer es teacher: cada ContestCard
 * muestra "X/Y entregaron · Promedio: Z" en vez del student-only "Tu puntaje".
 *
 * Flujo:
 * 1. Teams del teacher (coach_id = teacherId)
 * 2. Members totales (denominador "X/Y")
 * 3. Attempts para esos members en los contests dados
 * 4. Group by contest_id, count submitted + avg score
 *
 * @returns Map<contest_id, stats> — solo contiene entries para contests con datos.
 *          La page que la consume itera con `?? null` para contests sin entry.
 */
export async function getTeacherStatsByContest(
  supabase: ServerClient,
  opts: { teacherId: string; contestIds: string[] },
): Promise<Map<string, ContestTeacherStats>> {
  const { teacherId, contestIds } = opts;
  const result = new Map<string, ContestTeacherStats>();

  if (contestIds.length === 0) return result;

  // 1. Teams
  const { data: teamsRows } = await supabase.from('teams').select('id').eq('coach_id', teacherId);
  const teamIds = ((teamsRows ?? []) as Array<{ id: string }>).map((t) => t.id);
  if (teamIds.length === 0) {
    // Teacher sin teams → marcar todos con 0/0
    for (const cid of contestIds) {
      result.set(cid, { contestId: cid, submittedCount: 0, totalMembers: 0, avgScore: null });
    }
    return result;
  }

  // 2. Members
  const { data: memberRows } = await supabase
    .from('team_members')
    .select('student_id')
    .in('team_id', teamIds);
  const studentIds = Array.from(
    new Set(((memberRows ?? []) as Array<{ student_id: string }>).map((m) => m.student_id)),
  );
  const totalMembers = studentIds.length;

  // Pre-poblar todos los contests con 0/totalMembers
  for (const cid of contestIds) {
    result.set(cid, { contestId: cid, submittedCount: 0, totalMembers, avgScore: null });
  }

  if (studentIds.length === 0) return result;

  // 3. Attempts
  const { data: attemptRows } = await supabase
    .from('contest_attempts')
    .select('contest_id, total_score, submitted_at')
    .in('contest_id', contestIds)
    .in('student_id', studentIds);
  const attempts = (attemptRows ?? []) as Array<{
    contest_id: string;
    total_score: number;
    submitted_at: string | null;
  }>;

  // 4. Aggregate por contest
  const submittedByContest = new Map<string, number[]>();
  for (const a of attempts) {
    if (a.submitted_at) {
      const arr = submittedByContest.get(a.contest_id) ?? [];
      arr.push(a.total_score);
      submittedByContest.set(a.contest_id, arr);
    }
  }

  for (const [contestId, scores] of submittedByContest.entries()) {
    const existing = result.get(contestId);
    if (existing) {
      result.set(contestId, {
        ...existing,
        submittedCount: scores.length,
        avgScore: scores.reduce((s, v) => s + v, 0) / scores.length,
      });
    }
  }

  return result;
}
