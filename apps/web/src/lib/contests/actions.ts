'use server';

import { scoreProblemAttempt } from '@/lib/contests/scoring';
import {
  closeContestSession as closeSessionHelper,
  openContestSession as openSessionHelper,
} from '@/lib/contests/sessions';
import { createServerClient } from '@numoria/database/server';
import type { Database } from '@numoria/database/types';
import { revalidatePath } from 'next/cache';

type ContestAttemptInsert = Database['public']['Tables']['contest_attempts']['Insert'];
type ContestAttemptUpdate = Database['public']['Tables']['contest_attempts']['Update'];
type ProblemAttemptInsert = Database['public']['Tables']['problem_attempts']['Insert'];

export interface ActionResult<T = void> {
  ok: boolean;
  message?: string;
  data?: T;
}

/**
 * Inicia un contest_attempt para el current user si no existe.
 *
 * Reglas:
 * - User debe estar autenticado y ser student
 * - Contest debe estar status='active' y dentro de su ventana de tiempo
 * - Si ya existe un attempt para (user, contest), retorna ese ID
 * - Si el attempt existente ya está submitted, error (no puede re-tomar)
 */
export async function startContestAttempt(
  contestId: string,
): Promise<ActionResult<{ attemptId: string }>> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: 'No authenticated user' };
  }

  // Verificar que el contest existe y está activo
  const { data: contestRow, error: contestErr } = await supabase
    .from('contests')
    .select('id, status, scheduled_at, duration_minutes')
    .eq('id', contestId)
    .single();

  if (contestErr || !contestRow) {
    return { ok: false, message: 'Contest not found' };
  }

  const contest = contestRow as {
    id: string;
    status: 'draft' | 'scheduled' | 'active' | 'closed';
    scheduled_at: string;
    duration_minutes: number;
  };

  if (contest.status !== 'active') {
    return { ok: false, message: 'Contest is not active' };
  }

  // Verificar que estamos dentro de la ventana
  const now = new Date();
  const scheduledDate = new Date(contest.scheduled_at);
  const endDate = new Date(scheduledDate.getTime() + contest.duration_minutes * 60_000);

  if (now < scheduledDate) {
    return { ok: false, message: 'Contest has not started yet' };
  }
  if (now > endDate) {
    return { ok: false, message: 'Contest window has expired' };
  }

  // Verificar si ya hay attempt
  const { data: existingRow } = await supabase
    .from('contest_attempts')
    .select('id, submitted_at')
    .eq('contest_id', contestId)
    .eq('student_id', user.id)
    .maybeSingle();

  if (existingRow) {
    const existing = existingRow as { id: string; submitted_at: string | null };
    if (existing.submitted_at) {
      return { ok: false, message: 'You have already submitted this contest' };
    }
    // Resume — no re-validamos session (si la session cerró mid-attempt,
    // el student aún puede ver/submitear lo que tiene)
    return { ok: true, data: { attemptId: existing.id } };
  }

  // Phase 4 MOEMS: validar que existe una contest_session 'open' para alguno
  // de los teams del student. Sin session → student no puede tomar el contest.
  await supabase.rpc('expire_old_contest_sessions');

  const { data: memberRows } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('student_id', user.id);
  const teamIds = ((memberRows ?? []) as Array<{ team_id: string }>).map((m) => m.team_id);

  let sessionId: string | null = null;
  if (teamIds.length > 0) {
    const { data: sessionRows } = await supabase
      .from('contest_sessions')
      .select('id, closes_at')
      .eq('contest_id', contestId)
      .eq('status', 'open')
      .in('team_id', teamIds)
      .limit(1);
    const session = (sessionRows ?? [])[0] as { id: string; closes_at: string } | undefined;
    if (session) {
      sessionId = session.id;
    }
  }

  if (!sessionId) {
    return {
      ok: false,
      message: 'session_not_open', // i18n key for UI to localize
    };
  }

  // Calcular max_possible_score sumando points de los contest_problems
  const { data: cpRows } = await supabase
    .from('contest_problems')
    .select('problem_id')
    .eq('contest_id', contestId);

  const problemIds = ((cpRows as Array<{ problem_id: string }> | null) ?? []).map(
    (r) => r.problem_id,
  );

  let maxScore = 0;
  if (problemIds.length > 0) {
    const { data: problemPoints } = await supabase
      .from('problems')
      .select('points')
      .in('id', problemIds);
    for (const row of (problemPoints as Array<{ points: number }> | null) ?? []) {
      maxScore += row.points;
    }
  }

  // Crear el attempt — incluye session_id (Phase 4 MOEMS)
  const insertData: ContestAttemptInsert = {
    contest_id: contestId,
    student_id: user.id,
    max_possible_score: maxScore,
    session_id: sessionId,
  };
  const { data: newRow, error: insertErr } = await supabase
    .from('contest_attempts')
    .insert(insertData as never)
    .select('id')
    .single();

  if (insertErr || !newRow) {
    console.error('Failed to create contest_attempt:', insertErr);
    return { ok: false, message: insertErr?.message ?? 'Could not start contest' };
  }

  return { ok: true, data: { attemptId: (newRow as { id: string }).id } };
}

/**
 * Guarda (upsert) la respuesta del student a un problema específico.
 * Llamado en autosave (on blur) y en submit.
 *
 * Calcula is_correct + points_earned server-side comparando con expected_answer.
 */
export async function saveProblemAnswer(args: {
  contestAttemptId: string;
  problemId: string;
  answer: string;
}): Promise<ActionResult> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: 'No authenticated user' };
  }

  // Validar que el attempt pertenece al user y no está submitted
  const { data: attemptRow } = await supabase
    .from('contest_attempts')
    .select('id, student_id, submitted_at, contest_id')
    .eq('id', args.contestAttemptId)
    .single();

  if (!attemptRow) {
    return { ok: false, message: 'Attempt not found' };
  }
  const attempt = attemptRow as {
    id: string;
    student_id: string;
    submitted_at: string | null;
    contest_id: string;
  };

  if (attempt.student_id !== user.id) {
    return { ok: false, message: 'Not your attempt' };
  }
  if (attempt.submitted_at) {
    return { ok: false, message: 'Contest already submitted' };
  }

  // Verificar que el problema pertenece a este contest
  const { data: cpRow } = await supabase
    .from('contest_problems')
    .select('contest_id')
    .eq('contest_id', attempt.contest_id)
    .eq('problem_id', args.problemId)
    .maybeSingle();

  if (!cpRow) {
    return { ok: false, message: 'Problem does not belong to this contest' };
  }

  // Fetch problem para scoring
  const { data: problemRow } = await supabase
    .from('problems')
    .select('id, expected_answer, answer_type, points')
    .eq('id', args.problemId)
    .single();

  if (!problemRow) {
    return { ok: false, message: 'Problem not found' };
  }
  const problem = problemRow as {
    id: string;
    expected_answer: string;
    answer_type: Database['public']['Enums']['answer_type'];
    points: number;
  };

  const { isCorrect, pointsEarned } = scoreProblemAttempt({
    submitted: args.answer,
    expected: problem.expected_answer,
    type: problem.answer_type,
    problemPoints: problem.points,
  });

  // Upsert problem_attempt
  // Primero buscar si existe
  const { data: existingPA } = await supabase
    .from('problem_attempts')
    .select('id')
    .eq('contest_attempt_id', args.contestAttemptId)
    .eq('problem_id', args.problemId)
    .maybeSingle();

  if (existingPA) {
    // Update
    const updateData = {
      answer_submitted: args.answer,
      is_correct: isCorrect,
      points_earned: pointsEarned,
      answered_at: new Date().toISOString(),
    };
    const { error: updateErr } = await supabase
      .from('problem_attempts')
      .update(updateData as never)
      .eq('id', (existingPA as { id: string }).id);
    if (updateErr) {
      return { ok: false, message: updateErr.message };
    }
  } else {
    // Insert
    const insertData: ProblemAttemptInsert = {
      contest_attempt_id: args.contestAttemptId,
      problem_id: args.problemId,
      answer_submitted: args.answer,
      is_correct: isCorrect,
      points_earned: pointsEarned,
      answered_at: new Date().toISOString(),
    };
    const { error: insertErr } = await supabase
      .from('problem_attempts')
      .insert(insertData as never);
    if (insertErr) {
      return { ok: false, message: insertErr.message };
    }
  }

  return { ok: true };
}

/**
 * Finaliza el contest_attempt:
 * - Marca submitted_at = now()
 * - Calcula total_score sumando points_earned de problem_attempts
 * - Calcula total_correct contando is_correct=true
 * - time_spent_seconds = submitted_at - started_at
 */
export async function submitContest(
  contestAttemptId: string,
): Promise<ActionResult<{ totalScore: number; maxScore: number }>> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: 'No authenticated user' };
  }

  // Fetch + validar attempt
  const { data: attemptRow } = await supabase
    .from('contest_attempts')
    .select('id, student_id, submitted_at, started_at, max_possible_score, contest_id')
    .eq('id', contestAttemptId)
    .single();

  if (!attemptRow) {
    return { ok: false, message: 'Attempt not found' };
  }
  const attempt = attemptRow as {
    id: string;
    student_id: string;
    submitted_at: string | null;
    started_at: string;
    max_possible_score: number;
    contest_id: string;
  };

  if (attempt.student_id !== user.id) {
    return { ok: false, message: 'Not your attempt' };
  }
  if (attempt.submitted_at) {
    return { ok: false, message: 'Already submitted' };
  }

  // Aggregar scores de problem_attempts
  const { data: paRows } = await supabase
    .from('problem_attempts')
    .select('points_earned, is_correct')
    .eq('contest_attempt_id', contestAttemptId);

  const problemAttempts =
    (paRows as Array<{ points_earned: number; is_correct: boolean | null }> | null) ?? [];
  const totalScore = problemAttempts.reduce((sum, pa) => sum + pa.points_earned, 0);
  const totalCorrect = problemAttempts.filter((pa) => pa.is_correct === true).length;

  const submittedAt = new Date();
  const timeSpentSeconds = Math.round(
    (submittedAt.getTime() - new Date(attempt.started_at).getTime()) / 1000,
  );

  const updateData: ContestAttemptUpdate = {
    submitted_at: submittedAt.toISOString(),
    total_score: totalScore,
    total_correct: totalCorrect,
    time_spent_seconds: timeSpentSeconds,
  };

  const { error: updateErr } = await supabase
    .from('contest_attempts')
    .update(updateData as never)
    .eq('id', contestAttemptId);

  if (updateErr) {
    return { ok: false, message: updateErr.message };
  }

  // Revalidar cache de /contests para que el state cambie a "completed"
  revalidatePath('/contests');
  revalidatePath(`/contests/${attempt.contest_id}`);

  return { ok: true, data: { totalScore, maxScore: attempt.max_possible_score } };
}

// ============================================================
// Phase 4 — MOEMS contest sessions
// ============================================================

/**
 * Server action: teacher abre una sesión de contest para su team.
 *
 * Reglas (ver lib/contests/sessions.ts:openContestSession):
 * - User es teacher y coach del team
 * - Contest status = 'active', dentro del calendar window
 * - No hay otra session 'open' para (contest, team)
 *
 * Invalidates: /contests (list page) + /contests/[id]/leaderboard
 */
export async function openContestSession(input: {
  contestId: string;
  teamId: string;
  durationMinutes?: number;
  notes?: string;
}): Promise<ActionResult<{ sessionId: string; closesAt: string }>> {
  const supabase = await createServerClient();
  const result = await openSessionHelper(supabase, input);
  if (result.ok) {
    revalidatePath('/contests');
    revalidatePath(`/contests/${input.contestId}/leaderboard`);
  }
  return result;
}

/**
 * Server action: teacher cierra manualmente una sesión.
 * Solo el opener (o admin) puede cerrarla.
 */
export async function closeContestSession(
  sessionId: string,
): Promise<ActionResult<{ sessionId: string; closesAt: string }>> {
  const supabase = await createServerClient();
  const result = await closeSessionHelper(supabase, sessionId);
  if (result.ok) {
    revalidatePath('/contests');
  }
  return result;
}
