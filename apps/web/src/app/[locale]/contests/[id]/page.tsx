import { ContestTakeView } from '@/components/contests/ContestTakeView';
import type { ProblemCardData } from '@/components/contests/ProblemCard';
import { startContestAttempt } from '@/lib/contests/actions';
import { inputHintForType } from '@/lib/contests/input-hints';
import { createServerClient } from '@numoria/database/server';
import type { Tables } from '@numoria/database/types';
import { setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';

type Contest = Tables<'contests'>;
type Problem = Tables<'problems'>;
type ContestAttempt = Tables<'contest_attempts'>;

/**
 * Página /contests/[id] — el student toma el contest.
 *
 * Server Component:
 * 1. Valida user + role=student + contest existe + dentro de window
 * 2. Crea o recupera contest_attempt
 * 3. Si ya está submitted → redirect a /results
 * 4. Fetch los 7 problems (joined via contest_problems, ordenados por position)
 * 5. Fetch problem_attempts pre-existentes para pre-llenar (resume)
 * 6. Renderiza ContestTakeView (client component)
 */
export default async function ContestTakePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id: contestId } = await params;
  setRequestLocale(locale);

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Fetch contest
  const { data: contestRow, error: contestErr } = await supabase
    .from('contests')
    .select(
      'id, slug, status, scheduled_at, duration_minutes, calculator_allowed, title_es, title_en, division',
    )
    .eq('id', contestId)
    .single();

  if (contestErr || !contestRow) {
    notFound();
  }

  const contest = contestRow as Pick<
    Contest,
    | 'id'
    | 'slug'
    | 'status'
    | 'scheduled_at'
    | 'duration_minutes'
    | 'calculator_allowed'
    | 'title_es'
    | 'title_en'
    | 'division'
  >;

  // Validar status + window
  if (contest.status === 'draft') {
    notFound();
  }

  const now = new Date();
  const scheduledDate = new Date(contest.scheduled_at);
  const endDate = new Date(scheduledDate.getTime() + contest.duration_minutes * 60_000);

  if (now > endDate || contest.status === 'closed') {
    // Contest expirado — redirigir a results (que se construirá en Chunk 3.4)
    // Por ahora, redirect a /contests con un mensaje
    redirect(`/${locale}/contests`);
  }

  // Verificar profile (debe ser student)
  const rpcResult = await supabase.rpc('get_my_profile');
  const profile = rpcResult.data as Tables<'profiles'> | null;
  if (!profile) {
    redirect(`/${locale}/auth-error`);
  }
  if (profile.role !== 'student') {
    // Teachers ven los contests pero no los toman
    redirect(`/${locale}/contests`);
  }

  // Crear/recuperar attempt
  const startResult = await startContestAttempt(contestId);
  if (!startResult.ok || !startResult.data) {
    if (startResult.message?.includes('already submitted')) {
      redirect(`/${locale}/contests/${contestId}/results`);
    }
    // Antes hacíamos redirect silencioso a /contests, lo que dejaba al
    // student sin entender por qué "no abre nada". Ahora pasamos la razón
    // como query param para que /contests la muestre como banner.
    const reason = startResult.message ?? 'unknown';
    redirect(`/${locale}/contests?startError=${encodeURIComponent(reason)}`);
  }

  const attemptId = startResult.data.attemptId;

  // Fetch problems del contest (joined con contest_problems para tener position)
  const { data: cpRows } = await supabase
    .from('contest_problems')
    .select('position, problem_id')
    .eq('contest_id', contestId)
    .order('position', { ascending: true });

  const positions = (cpRows as Array<{ position: number; problem_id: string }> | null) ?? [];

  if (positions.length === 0) {
    notFound();
  }

  const problemIds = positions.map((p) => p.problem_id);
  const { data: problemsRows } = await supabase
    .from('problems')
    .select(
      'id, stars, body_es, body_en, format_directive_es, format_directive_en, has_diagram, diagram_svg_url, diagram_caption_es, diagram_caption_en, answer_type, category, title_es, title_en',
    )
    .in('id', problemIds);

  const problemsMap = new Map<
    string,
    Pick<
      Problem,
      | 'id'
      | 'stars'
      | 'body_es'
      | 'body_en'
      | 'format_directive_es'
      | 'format_directive_en'
      | 'has_diagram'
      | 'diagram_svg_url'
      | 'diagram_caption_es'
      | 'diagram_caption_en'
      | 'answer_type'
      | 'category'
      | 'title_es'
      | 'title_en'
    >
  >();
  for (const p of (problemsRows as Array<{
    id: string;
    stars: number;
    body_es: string;
    body_en: string;
    format_directive_es: string | null;
    format_directive_en: string | null;
    has_diagram: boolean;
    diagram_svg_url: string | null;
    diagram_caption_es: string | null;
    diagram_caption_en: string | null;
    answer_type: Problem['answer_type'];
    category: Problem['category'];
    title_es: string;
    title_en: string;
  }> | null) ?? []) {
    problemsMap.set(p.id, p);
  }

  // Construir ordered list de ProblemCardData
  const problems: ProblemCardData[] = positions
    .map(({ position, problem_id }) => {
      const p = problemsMap.get(problem_id);
      if (!p) return null;
      const stars = p.stars as 1 | 2 | 3;
      return {
        problemId: p.id,
        position,
        stars,
        categoryEs: p.title_es,
        categoryEn: p.title_en,
        bodyEs: p.body_es,
        bodyEn: p.body_en,
        formatDirectiveEs: p.format_directive_es,
        formatDirectiveEn: p.format_directive_en,
        hasDiagram: p.has_diagram,
        diagramSvgUrl: p.diagram_svg_url,
        diagramCaptionEs: p.diagram_caption_es,
        diagramCaptionEn: p.diagram_caption_en,
        answerType: p.answer_type,
        inputHint: inputHintForType(p.answer_type, locale as 'es' | 'en'),
      };
    })
    .filter((x): x is ProblemCardData => x !== null);

  // Fetch problem_attempts existentes para pre-llenar (resume)
  const { data: paRows } = await supabase
    .from('problem_attempts')
    .select('problem_id, answer_submitted')
    .eq('contest_attempt_id', attemptId);

  const initialAnswers: Record<string, string> = {};
  for (const row of (paRows as Array<{
    problem_id: string;
    answer_submitted: string | null;
  }> | null) ?? []) {
    if (row.answer_submitted) {
      initialAnswers[row.problem_id] = row.answer_submitted;
    }
  }

  // Fetch started_at + session_id del attempt para calcular endsAt
  const { data: attemptRow } = await supabase
    .from('contest_attempts')
    .select('started_at, session_id')
    .eq('id', attemptId)
    .single();

  const attemptData = attemptRow as Pick<ContestAttempt, 'started_at' | 'session_id'> | null;
  const startedAt = attemptData?.started_at;
  if (!startedAt) {
    redirect(`/${locale}/contests`);
  }

  // Phase 4 MOEMS: si el attempt tiene session_id, el bound es session.closes_at.
  // Si no (legacy Phase 3 attempts), usar min(contest_window_end, started+duration).
  let actualEnd: Date;
  if (attemptData?.session_id) {
    const { data: sessionRow } = await supabase
      .from('contest_sessions')
      .select('closes_at')
      .eq('id', attemptData.session_id)
      .single();
    const sessionClosesAt = (sessionRow as { closes_at: string } | null)?.closes_at;
    if (sessionClosesAt) {
      actualEnd = new Date(sessionClosesAt);
    } else {
      // Fallback defensivo: usa el calendar window
      actualEnd = endDate;
    }
  } else {
    // Legacy attempt (Phase 3) — comportamiento previo
    const startedDate = new Date(startedAt);
    const attemptEnd = new Date(startedDate.getTime() + contest.duration_minutes * 60_000);
    actualEnd = attemptEnd < endDate ? attemptEnd : endDate;
  }

  return (
    <ContestTakeView
      attemptId={attemptId}
      contestId={contestId}
      contestTitleEs={contest.title_es}
      contestTitleEn={contest.title_en}
      endsAt={actualEnd.toISOString()}
      calculatorAllowed={contest.calculator_allowed}
      problems={problems}
      initialAnswers={initialAnswers}
    />
  );
}
