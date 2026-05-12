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

/**
 * Server action: teacher otorga otro intento a un student específico.
 *
 * Use case: Student tuvo problema mid-contest (internet, distracción, etc.).
 * Teacher resetea su attempt → student puede re-tomar mientras la sesión siga
 * abierta.
 *
 * Reglas:
 * - User autenticado es teacher
 * - El attempt tiene session_id (era Phase 4 MOEMS, no legacy)
 * - La session asociada está aún 'open' (no expirada/cerrada)
 * - El student está en uno de los teams del teacher (RLS lo enforce indirecto;
 *   validamos explícito para mejor UX)
 *
 * Acción:
 * - DELETE contest_attempts (CASCADE limpia problem_attempts via FK)
 * - Append audit log a session.notes
 * - revalidatePath del leaderboard
 *
 * Returns: { ok, data: { contestId } } para que UI pueda hacer router.refresh()
 */
export async function grantContestRetry(input: {
  contestAttemptId: string;
}): Promise<ActionResult<{ contestId: string }>> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'No autenticado' };

  // Fetch del attempt para validar
  const { data: attemptRow } = await supabase
    .from('contest_attempts')
    .select('id, student_id, contest_id, session_id')
    .eq('id', input.contestAttemptId)
    .single();
  if (!attemptRow) return { ok: false, message: 'Attempt no encontrado' };

  const attempt = attemptRow as {
    id: string;
    student_id: string;
    contest_id: string;
    session_id: string | null;
  };

  if (!attempt.session_id) {
    return {
      ok: false,
      message: 'Este attempt es legacy (sin session_id) y no se puede resetear con grant retry',
    };
  }

  // Fetch session — validar que está open y el opener es el teacher actual
  const { data: sessionRow } = await supabase
    .from('contest_sessions')
    .select('id, opened_by, status, notes, team_id')
    .eq('id', attempt.session_id)
    .single();
  if (!sessionRow) return { ok: false, message: 'Session no encontrada' };

  const session = sessionRow as {
    id: string;
    opened_by: string;
    status: 'open' | 'closed' | 'expired';
    notes: string | null;
    team_id: string;
  };

  if (session.opened_by !== user.id) {
    return { ok: false, message: 'No eres el teacher que abrió esta sesión' };
  }
  if (session.status !== 'open') {
    return {
      ok: false,
      message: 'La sesión ya está cerrada/expirada — no se puede otorgar retry',
    };
  }

  // DELETE contest_attempts — CASCADE limpia problem_attempts
  const { error: deleteErr } = await supabase
    .from('contest_attempts')
    .delete()
    .eq('id', attempt.id);
  if (deleteErr) {
    return { ok: false, message: deleteErr.message };
  }

  // Audit log en session.notes (append)
  const timestamp = new Date().toISOString();
  const auditLine = `[${timestamp}] Retry otorgado a student ${attempt.student_id}`;
  const newNotes = session.notes ? `${session.notes}\n${auditLine}` : auditLine;
  await supabase.from('contest_sessions').update({ notes: newNotes }).eq('id', session.id);

  // Revalidate UI
  revalidatePath('/contests');
  revalidatePath(`/contests/${attempt.contest_id}/leaderboard`);

  return { ok: true, data: { contestId: attempt.contest_id } };
}

// ============================================================
// Phase 4.2 — Paper-entry batch submission
// ============================================================

export interface PaperEntryRow {
  studentId: string;
  /** Map de problem_id → answer. Respuestas en blanco se omiten o pasan como ''. */
  answers: Record<string, string>;
}

export interface PaperBatchResult {
  studentsProcessed: number;
  studentsSkipped: number;
  /** Detalle por student procesado (útil para mostrar feedback en UI). */
  details: Array<{
    studentId: string;
    studentName?: string;
    totalScore: number;
    totalCorrect: number;
    skipped?: boolean;
    skipReason?: string;
  }>;
}

/**
 * Server action: teacher submitea un batch de respuestas de paper-entry.
 *
 * Use case: Teacher administró el contest en papel, ahora transcribe las
 * respuestas de cada student a la plataforma. Una sola acción crea
 * contest_attempt + problem_attempts para múltiples students.
 *
 * Validaciones:
 *  1. User es teacher autenticado
 *  2. Session existe, está 'open', user es el opener
 *  3. Todos los students del batch están en el team de la session
 *  4. Si un student YA tiene attempt para este contest:
 *     - Lo skipea (no sobrescribe attempts online accidentalmente)
 *     - Retorna en details[] con skipped=true + skipReason
 *
 * Scoring server-side per cada respuesta, reusando scoreProblemAttempt.
 *
 * Atomicidad limitada: Supabase JS client no soporta transactions multi-statement
 * directamente. Estrategia: si falla un INSERT mid-batch, el contest_attempt ya
 * creado queda pero sus problem_attempts no se crean. Mitigación: filtrar bien
 * input (omitir entries inválidas) antes de comenzar.
 */
export async function submitPaperBatch(input: {
  sessionId: string;
  contestId: string;
  entries: PaperEntryRow[];
}): Promise<ActionResult<PaperBatchResult>> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'No autenticado' };

  // Validar session
  const { data: sessionRow } = await supabase
    .from('contest_sessions')
    .select('id, contest_id, team_id, opened_by, status')
    .eq('id', input.sessionId)
    .single();
  if (!sessionRow) return { ok: false, message: 'Session no encontrada' };
  const session = sessionRow as {
    id: string;
    contest_id: string;
    team_id: string;
    opened_by: string;
    status: 'open' | 'closed' | 'expired';
  };
  if (session.opened_by !== user.id) {
    return { ok: false, message: 'No eres el teacher que abrió esta sesión' };
  }
  if (session.status !== 'open') {
    return { ok: false, message: 'La sesión ya está cerrada/expirada' };
  }
  if (session.contest_id !== input.contestId) {
    return { ok: false, message: 'La sesión no corresponde a este contest' };
  }

  // Validar que students están en el team de la session
  const studentIds = input.entries.map((e) => e.studentId);
  const { data: memberRows } = await supabase
    .from('team_members')
    .select('student_id')
    .eq('team_id', session.team_id)
    .in('student_id', studentIds);
  const teamStudentIds = new Set(
    ((memberRows ?? []) as Array<{ student_id: string }>).map((m) => m.student_id),
  );

  // Fetch contest_problems + points para scoring
  const { data: cpRows } = await supabase
    .from('contest_problems')
    .select('problem_id')
    .eq('contest_id', input.contestId);
  const problemIds = ((cpRows ?? []) as Array<{ problem_id: string }>).map((r) => r.problem_id);
  if (problemIds.length === 0) {
    return { ok: false, message: 'Contest sin problems configurados' };
  }

  const { data: problemRows } = await supabase
    .from('problems')
    .select('id, expected_answer, answer_type, points')
    .in('id', problemIds);
  const problems = new Map<
    string,
    {
      id: string;
      expected_answer: string;
      answer_type: Database['public']['Enums']['answer_type'];
      points: number;
    }
  >();
  let maxScore = 0;
  for (const p of (problemRows as Array<{
    id: string;
    expected_answer: string;
    answer_type: Database['public']['Enums']['answer_type'];
    points: number;
  }> | null) ?? []) {
    problems.set(p.id, p);
    maxScore += p.points;
  }

  // Check attempts existentes — para no sobrescribir
  const { data: existingAttempts } = await supabase
    .from('contest_attempts')
    .select('student_id, id')
    .eq('contest_id', input.contestId)
    .in('student_id', studentIds);
  const existingByStudent = new Map(
    ((existingAttempts ?? []) as Array<{ student_id: string; id: string }>).map((a) => [
      a.student_id,
      a.id,
    ]),
  );

  // Procesar cada entry
  const details: PaperBatchResult['details'] = [];
  let processed = 0;
  let skipped = 0;

  for (const entry of input.entries) {
    if (!teamStudentIds.has(entry.studentId)) {
      skipped += 1;
      details.push({
        studentId: entry.studentId,
        totalScore: 0,
        totalCorrect: 0,
        skipped: true,
        skipReason: 'no_in_team',
      });
      continue;
    }
    if (existingByStudent.has(entry.studentId)) {
      skipped += 1;
      details.push({
        studentId: entry.studentId,
        totalScore: 0,
        totalCorrect: 0,
        skipped: true,
        skipReason: 'already_has_attempt',
      });
      continue;
    }

    const nowISO = new Date().toISOString();

    // Insert contest_attempt
    const attemptInsert: ContestAttemptInsert = {
      contest_id: input.contestId,
      student_id: entry.studentId,
      session_id: session.id,
      max_possible_score: maxScore,
      is_paper_entry: true,
      started_at: nowISO,
      submitted_at: nowISO,
      time_spent_seconds: null,
      total_score: 0,
      total_correct: 0,
    };
    const { data: attemptRow, error: insertErr } = await supabase
      .from('contest_attempts')
      .insert(attemptInsert as never)
      .select('id')
      .single();
    if (insertErr || !attemptRow) {
      skipped += 1;
      details.push({
        studentId: entry.studentId,
        totalScore: 0,
        totalCorrect: 0,
        skipped: true,
        skipReason: insertErr?.message ?? 'insert_failed',
      });
      continue;
    }
    const attemptId = (attemptRow as { id: string }).id;

    // Score per problem + insert problem_attempts
    let totalScore = 0;
    let totalCorrect = 0;
    const problemAttempts: ProblemAttemptInsert[] = [];

    for (const [problemId, answerRaw] of Object.entries(entry.answers)) {
      const problem = problems.get(problemId);
      if (!problem) continue; // problema no es de este contest

      const trimmed = (answerRaw ?? '').trim();
      const submitted = trimmed.length > 0 ? trimmed : null;

      const scoring =
        submitted !== null
          ? scoreProblemAttempt({
              submitted,
              expected: problem.expected_answer,
              type: problem.answer_type,
              problemPoints: problem.points,
            })
          : { isCorrect: false, pointsEarned: 0 };

      problemAttempts.push({
        contest_attempt_id: attemptId,
        problem_id: problem.id,
        answer_submitted: submitted,
        is_correct: scoring.isCorrect,
        points_earned: scoring.pointsEarned,
      });

      totalScore += scoring.pointsEarned;
      if (scoring.isCorrect) totalCorrect += 1;
    }

    if (problemAttempts.length > 0) {
      const { error: paErr } = await supabase
        .from('problem_attempts')
        .insert(problemAttempts as never);
      if (paErr) {
        // Note: el contest_attempt ya quedó; problem_attempts fallaron
        // Para fix manual queda el attempt con score 0 — teacher puede usar
        // grant retry para resetear y re-intentar.
        skipped += 1;
        details.push({
          studentId: entry.studentId,
          totalScore: 0,
          totalCorrect: 0,
          skipped: true,
          skipReason: `problem_attempts_failed: ${paErr.message}`,
        });
        continue;
      }
    }

    // Update contest_attempt con scores finales
    const updateData: ContestAttemptUpdate = {
      total_score: totalScore,
      total_correct: totalCorrect,
    };
    await supabase
      .from('contest_attempts')
      .update(updateData as never)
      .eq('id', attemptId);

    processed += 1;
    details.push({
      studentId: entry.studentId,
      totalScore,
      totalCorrect,
    });
  }

  // Audit log en session.notes
  const ts = new Date().toISOString();
  const auditLine = `[${ts}] Paper batch: ${processed} procesados, ${skipped} skipped por ${user.id}`;
  const { data: sessionNotes } = await supabase
    .from('contest_sessions')
    .select('notes')
    .eq('id', session.id)
    .single();
  const existingNotes = (sessionNotes as { notes: string | null } | null)?.notes;
  await supabase
    .from('contest_sessions')
    .update({ notes: existingNotes ? `${existingNotes}\n${auditLine}` : auditLine })
    .eq('id', session.id);

  // Revalidate UI
  revalidatePath('/contests');
  revalidatePath(`/contests/${input.contestId}/leaderboard`);

  return {
    ok: true,
    data: {
      studentsProcessed: processed,
      studentsSkipped: skipped,
      details,
    },
  };
}
