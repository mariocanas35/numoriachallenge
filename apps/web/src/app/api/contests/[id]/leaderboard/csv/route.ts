import { toCSV } from '@/lib/contests/csv';
import { getLeaderboardData } from '@/lib/contests/leaderboard';
import { createServerClient } from '@numoria/database/server';
import type { Tables } from '@numoria/database/types';
import type { NextRequest } from 'next/server';

type Profile = Tables<'profiles'>;

/**
 * GET /api/contests/[id]/leaderboard/csv?team=<teamId>
 *
 * Devuelve un CSV con el leaderboard del contest, restringido a students en
 * los teams del teacher autenticado. Responde 401 si no auth, 403 si no
 * teacher, 200 con text/csv si OK.
 *
 * El CSV incluye BOM UTF-8 + CRLF para compatibilidad Excel (tildes en
 * nombres se ven correctas al abrir en español).
 *
 * Columnas:
 *   rank, student_name, team, score, max_score, correct, time_seconds,
 *   submitted_at (ISO 8601)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id: contestId } = await params;
  const teamFilter = request.nextUrl.searchParams.get('team') ?? undefined;

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const rpcResult = await supabase.rpc('get_my_profile');
  const profile = rpcResult.data as Profile | null;
  if (!profile || profile.role !== 'teacher') {
    return new Response('Forbidden', { status: 403 });
  }

  const { entries } = await getLeaderboardData(supabase, {
    contestId,
    teacherId: user.id,
    teamId: teamFilter,
  });

  const rows = entries.map((e) => ({
    rank: e.rank,
    student_name: e.studentName,
    grade: e.studentGrade ?? '',
    team: e.teamName,
    score: e.totalScore,
    max_score: e.maxPossibleScore,
    correct: e.totalCorrect,
    time_seconds: e.timeSpentSeconds ?? '',
    submitted_at: e.submittedAt ?? '',
  }));

  const csv = toCSV(rows);

  // Filename: leaderboard-<contestId>-<timestamp>.csv
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `leaderboard-${contestId.slice(0, 8)}-${timestamp}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
