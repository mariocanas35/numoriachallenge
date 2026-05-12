import type { ServerClient } from '@numoria/database/server';
import type { Tables } from '@numoria/database/types';

export type ContestSession = Tables<'contest_sessions'>;

export interface OpenSessionInput {
  contestId: string;
  teamId: string;
  /** Duración en minutos. Si omitted, usa contest.duration_minutes. */
  durationMinutes?: number;
  notes?: string;
}

export interface SessionOpResult {
  ok: boolean;
  message?: string;
  data?: { sessionId: string; closesAt: string };
}

/**
 * Abre una contest_session para un team. Validaciones:
 *
 * 1. User autenticado es teacher
 * 2. User es el coach del team (RLS lo enforce pero validamos antes para mejor UX)
 * 3. Contest existe, status='active', y dentro del outer calendar window
 * 4. No hay otra session 'open' para (contest, team) — partial unique index lo
 *    enforce pero el error genérico no es claro
 * 5. closes_at calculado = now + durationMinutes (o contest.duration_minutes)
 *    debe estar dentro del calendar window del contest (scheduled_at + duration)
 *
 * Side effect: marca sessions stale como expired primero (idempotente).
 */
export async function openContestSession(
  supabase: ServerClient,
  input: OpenSessionInput,
): Promise<SessionOpResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'No autenticado' };

  // Marca sessions expiradas (lazy GC para que el partial unique no falle si
  // hay session previa que debería haberse expirado)
  await supabase.rpc('expire_old_contest_sessions');

  // Validar contest
  const { data: contestRow } = await supabase
    .from('contests')
    .select('id, status, scheduled_at, duration_minutes')
    .eq('id', input.contestId)
    .single();
  if (!contestRow) return { ok: false, message: 'Contest no encontrado' };

  const contest = contestRow as {
    id: string;
    status: 'draft' | 'scheduled' | 'active' | 'closed';
    scheduled_at: string;
    duration_minutes: number;
  };

  if (contest.status === 'draft' || contest.status === 'closed') {
    return { ok: false, message: 'Contest no está activo' };
  }

  // Validar team ownership
  const { data: teamRow } = await supabase
    .from('teams')
    .select('id, coach_id')
    .eq('id', input.teamId)
    .single();
  if (!teamRow) return { ok: false, message: 'Team no encontrado' };
  if ((teamRow as { coach_id: string }).coach_id !== user.id) {
    return { ok: false, message: 'No eres el coach de este team' };
  }

  // Validar no hay session open ya
  const { data: existingRows } = await supabase
    .from('contest_sessions')
    .select('id, closes_at')
    .eq('contest_id', input.contestId)
    .eq('team_id', input.teamId)
    .eq('status', 'open')
    .limit(1);
  const existing = existingRows?.[0] as { id: string; closes_at: string } | undefined;
  if (existing) {
    return {
      ok: false,
      message: 'Ya hay una sesión abierta para este contest y team',
      data: { sessionId: existing.id, closesAt: existing.closes_at },
    };
  }

  // Calcular closes_at
  const durationMin = input.durationMinutes ?? contest.duration_minutes;
  const now = new Date();
  const closesAt = new Date(now.getTime() + durationMin * 60_000);

  // Outer bound: closes_at no puede pasar contest_window
  const contestStart = new Date(contest.scheduled_at);
  const contestEnd = new Date(contestStart.getTime() + contest.duration_minutes * 60_000);
  // Política: permitimos que session arranque después del contest scheduled_at
  // (teacher tiene libertad de programar dentro del calendar window).
  // closes_at debe caer dentro del calendar window oficial.
  const effectiveCloses = closesAt > contestEnd ? contestEnd : closesAt;

  if (effectiveCloses <= now) {
    return {
      ok: false,
      message: 'El calendar window del contest ya pasó — no se puede abrir sesión',
    };
  }

  // Insert
  const { data: inserted, error } = await supabase
    .from('contest_sessions')
    .insert({
      contest_id: input.contestId,
      team_id: input.teamId,
      opened_by: user.id,
      closes_at: effectiveCloses.toISOString(),
      notes: input.notes ?? null,
    })
    .select('id, closes_at')
    .single();

  if (error || !inserted) {
    return { ok: false, message: error?.message ?? 'No se pudo crear la sesión' };
  }

  return {
    ok: true,
    data: {
      sessionId: (inserted as { id: string }).id,
      closesAt: (inserted as { closes_at: string }).closes_at,
    },
  };
}

/**
 * Cierra una session manualmente. Solo el opener (o admin) puede.
 */
export async function closeContestSession(
  supabase: ServerClient,
  sessionId: string,
): Promise<SessionOpResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'No autenticado' };

  const { data: updated, error } = await supabase
    .from('contest_sessions')
    .update({ status: 'closed' })
    .eq('id', sessionId)
    .eq('opened_by', user.id)
    .eq('status', 'open')
    .select('id, closes_at')
    .single();

  if (error || !updated) {
    return {
      ok: false,
      message:
        error?.message ?? 'No se pudo cerrar la sesión (¿no eres el opener o ya está cerrada?)',
    };
  }

  return {
    ok: true,
    data: {
      sessionId: (updated as { id: string }).id,
      closesAt: (updated as { closes_at: string }).closes_at,
    },
  };
}

/**
 * Devuelve la session activa (status='open' AND closes_at > now) para
 * un (contest, team). Null si no hay.
 *
 * Side effect: si encuentra una session expirada (closes_at < now), la
 * marca como 'expired' lazily.
 */
export async function getActiveSessionForTeam(
  supabase: ServerClient,
  opts: { contestId: string; teamId: string },
): Promise<ContestSession | null> {
  await supabase.rpc('expire_old_contest_sessions');

  const { data: rows } = await supabase
    .from('contest_sessions')
    .select(
      'id, contest_id, team_id, opened_by, opened_at, closes_at, status, notes, created_at, updated_at',
    )
    .eq('contest_id', opts.contestId)
    .eq('team_id', opts.teamId)
    .eq('status', 'open')
    .limit(1);

  return ((rows ?? [])[0] as ContestSession) ?? null;
}

/**
 * Para un student dado, encuentra la session activa de su team para este
 * contest. Si el student no está en ningún team, o ningún team tiene sesión
 * abierta, retorna null.
 *
 * Usado por startContestAttempt (Chunk 4.1c) para validar que el teacher
 * abrió la sesión antes de permitir tomar el contest.
 */
export async function getActiveSessionForStudent(
  supabase: ServerClient,
  opts: { contestId: string; studentId: string },
): Promise<ContestSession | null> {
  await supabase.rpc('expire_old_contest_sessions');

  // Teams del student
  const { data: memberRows } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('student_id', opts.studentId);
  const teamIds = ((memberRows ?? []) as Array<{ team_id: string }>).map((m) => m.team_id);
  if (teamIds.length === 0) return null;

  // Session activa en cualquiera de esos teams
  const { data: sessionRows } = await supabase
    .from('contest_sessions')
    .select(
      'id, contest_id, team_id, opened_by, opened_at, closes_at, status, notes, created_at, updated_at',
    )
    .eq('contest_id', opts.contestId)
    .eq('status', 'open')
    .in('team_id', teamIds)
    .limit(1);

  return ((sessionRows ?? [])[0] as ContestSession) ?? null;
}

/**
 * Para un student, devuelve un Map<contestId, sessionInfo> con todas las
 * sessions activas en sus teams para una lista de contests dada.
 *
 * Usado por /contests page (student view) para mostrar "Esperando maestro"
 * cuando state=active pero no hay session abierta.
 *
 * RLS-friendly: el policy "students_view_team_sessions" filtra automáticamente
 * a sessions de teams donde student está miembro. Solo pedimos status='open'.
 */
export async function getStudentActiveSessions(
  supabase: ServerClient,
  opts: { studentId: string; contestIds: string[] },
): Promise<Map<string, { id: string; contestId: string; teamId: string; closesAt: string }>> {
  const result = new Map<
    string,
    { id: string; contestId: string; teamId: string; closesAt: string }
  >();
  if (opts.contestIds.length === 0) return result;

  await supabase.rpc('expire_old_contest_sessions');

  // Teams del student
  const { data: memberRows } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('student_id', opts.studentId);
  const teamIds = ((memberRows ?? []) as Array<{ team_id: string }>).map((m) => m.team_id);
  if (teamIds.length === 0) return result;

  // Sessions activas en cualquiera de esos teams para esos contests
  const { data: sessionRows } = await supabase
    .from('contest_sessions')
    .select('id, contest_id, team_id, closes_at')
    .in('contest_id', opts.contestIds)
    .in('team_id', teamIds)
    .eq('status', 'open');

  for (const row of ((sessionRows ?? []) as Array<{
    id: string;
    contest_id: string;
    team_id: string;
    closes_at: string;
  }>) ?? []) {
    result.set(row.contest_id, {
      id: row.id,
      contestId: row.contest_id,
      teamId: row.team_id,
      closesAt: row.closes_at,
    });
  }

  return result;
}

/**
 * Lista todas las sessions del teacher (para vista admin de todas sus
 * sessions abiertas across sus teams).
 */
export async function getTeacherSessions(
  supabase: ServerClient,
  opts: { teacherId: string; contestId?: string; onlyOpen?: boolean },
): Promise<ContestSession[]> {
  let query = supabase
    .from('contest_sessions')
    .select(
      'id, contest_id, team_id, opened_by, opened_at, closes_at, status, notes, created_at, updated_at',
    )
    .eq('opened_by', opts.teacherId)
    .order('opened_at', { ascending: false });

  if (opts.contestId) query = query.eq('contest_id', opts.contestId);
  if (opts.onlyOpen) query = query.eq('status', 'open');

  const { data } = await query;
  return (data ?? []) as ContestSession[];
}
