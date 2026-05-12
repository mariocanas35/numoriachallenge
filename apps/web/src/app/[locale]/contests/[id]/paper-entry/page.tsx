import {
  PaperEntryForm,
  type PaperEntryProblem,
  type PaperEntryStudent,
} from '@/components/contests/PaperEntryForm';
import { Link } from '@/i18n/navigation';
import { inputHintForType } from '@/lib/contests/input-hints';
import { getActiveSessionForTeam } from '@/lib/contests/sessions';
import { createServerClient } from '@numoria/database/server';
import type { Tables } from '@numoria/database/types';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';

type Contest = Tables<'contests'>;
type Profile = Tables<'profiles'>;
type Problem = Tables<'problems'>;

/**
 * Phase 4.2c — Paper-entry page para teacher.
 *
 * Flow:
 * 1. Validar user es teacher
 * 2. Validar contest existe
 * 3. Validar session activa para alguno de los teams del teacher
 *    - Si no hay session, redirige a /contests con mensaje (necesita abrir
 *      la sesión primero desde el card del contest)
 * 4. Fetch team members + problems del contest + attempts existentes
 * 5. Renderiza PaperEntryForm con tabla students × problems
 *
 * NOTA importante:
 * Si el teacher tiene múltiples teams y abrió sesión solo en uno, el form se
 * pre-llena con students de ESE team. Para abrir paper-entry de otro team,
 * primero hay que abrir sesión en ese otro team.
 */
export default async function PaperEntryPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id: contestId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contests.paperEntry');

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  // Role gate
  const rpcResult = await supabase.rpc('get_my_profile');
  const profile = rpcResult.data as Profile | null;
  if (!profile || profile.role !== 'teacher') {
    redirect(`/${locale}/contests`);
  }

  // Validar contest existe
  const { data: contestRow } = await supabase
    .from('contests')
    .select('id, title_es, title_en, division')
    .eq('id', contestId)
    .single();
  if (!contestRow) notFound();
  const contest = contestRow as Pick<Contest, 'id' | 'title_es' | 'title_en' | 'division'>;

  // Buscar teams del teacher
  const { data: teamRows } = await supabase
    .from('teams')
    .select('id, name')
    .eq('coach_id', user.id);
  const teams = (teamRows ?? []) as Array<{ id: string; name: string }>;
  if (teams.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="font-display text-2xl font-bold text-numoria-ink">{t('noTeamsTitle')}</h1>
        <p className="text-sm text-numoria-mid">{t('noTeamsBody')}</p>
        <Link
          href="/teams"
          className="rounded-md bg-numoria-orange px-6 py-3 text-sm font-bold text-white"
        >
          {t('manageTeams')} →
        </Link>
      </div>
    );
  }

  // Buscar session activa en alguno de los teams
  let activeSession: { id: string; teamId: string; teamName: string; closesAt: string } | null =
    null;
  for (const team of teams) {
    const session = await getActiveSessionForTeam(supabase, {
      contestId,
      teamId: team.id,
    });
    if (session) {
      activeSession = {
        id: session.id,
        teamId: team.id,
        teamName: team.name,
        closesAt: session.closes_at,
      };
      break;
    }
  }

  if (!activeSession) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="font-display text-2xl font-bold text-numoria-ink">{t('noSessionTitle')}</h1>
        <p className="max-w-md text-sm text-numoria-mid">{t('noSessionBody')}</p>
        <Link
          href="/contests"
          className="rounded-md bg-numoria-orange px-6 py-3 text-sm font-bold text-white"
        >
          ← {t('backToContests')}
        </Link>
      </div>
    );
  }

  // Fetch team members
  const { data: memberRows } = await supabase
    .from('team_members')
    .select('student_id')
    .eq('team_id', activeSession.teamId);
  const memberIds = ((memberRows ?? []) as Array<{ student_id: string }>).map((m) => m.student_id);

  if (memberIds.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="font-display text-2xl font-bold text-numoria-ink">{t('noMembersTitle')}</h1>
        <p className="text-sm text-numoria-mid">{t('noMembersBody')}</p>
        <Link
          href={`/teams/${activeSession.teamId}`}
          className="rounded-md bg-numoria-orange px-6 py-3 text-sm font-bold text-white"
        >
          {t('inviteStudents')} →
        </Link>
      </div>
    );
  }

  // Profile details (nombre + grade)
  const { data: profileRows } = await supabase
    .from('profiles')
    .select('id, display_name, grade')
    .in('id', memberIds);
  const profileById = new Map(
    (
      (profileRows ?? []) as Array<{
        id: string;
        display_name: string | null;
        grade: number | null;
      }>
    ).map((p) => [p.id, { name: p.display_name ?? '—', grade: p.grade }]),
  );

  // Attempts existentes — para marcar students que YA tienen attempt
  const { data: existingAttempts } = await supabase
    .from('contest_attempts')
    .select('student_id')
    .eq('contest_id', contestId)
    .in('student_id', memberIds);
  const studentsWithAttempt = new Set(
    ((existingAttempts ?? []) as Array<{ student_id: string }>).map((a) => a.student_id),
  );

  // Build students list ordenado por nombre
  const students: PaperEntryStudent[] = memberIds
    .map((id) => {
      const p = profileById.get(id) ?? { name: '—', grade: null };
      return {
        id,
        displayName: p.name,
        grade: p.grade,
        hasExistingAttempt: studentsWithAttempt.has(id),
      };
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  // Fetch problems del contest
  const { data: cpRows } = await supabase
    .from('contest_problems')
    .select('position, problem_id')
    .eq('contest_id', contestId)
    .order('position', { ascending: true });
  const positions = (cpRows ?? []) as Array<{ position: number; problem_id: string }>;

  const problemIds = positions.map((p) => p.problem_id);
  const { data: problemRows } = await supabase
    .from('problems')
    .select('id, stars, title_es, title_en, answer_type')
    .in('id', problemIds);

  const problemsMap = new Map(
    (
      (problemRows ?? []) as Array<{
        id: string;
        stars: number;
        title_es: string;
        title_en: string;
        answer_type: Problem['answer_type'];
      }>
    ).map((p) => [p.id, p]),
  );

  const problems: PaperEntryProblem[] = positions
    .map(({ position, problem_id }) => {
      const p = problemsMap.get(problem_id);
      if (!p) return null;
      return {
        id: p.id,
        position,
        stars: p.stars as 1 | 2 | 3,
        category: locale === 'es' ? p.title_es : p.title_en,
        inputHint: inputHintForType(p.answer_type, locale as 'es' | 'en'),
      };
    })
    .filter((x): x is PaperEntryProblem => x !== null);

  const title = locale === 'es' ? contest.title_es : contest.title_en;

  // Labels traducidos para client component (server component requiere prop drilling)
  const labels = {
    headerStudent: t('headerStudent'),
    headerGrade: t('headerGrade'),
    alreadySubmitted: t('alreadySubmitted'),
    submitBatch: t('submitBatch'),
    submitting: t('submitting'),
    successTitle: t('successTitle'),
    successBody: t.raw('successBody') as string,
    errorTitle: t('errorTitle'),
    skippedTitle: t('skippedTitle'),
    skipReason: {
      no_in_team: t('skipReason.no_in_team'),
      already_has_attempt: t('skipReason.already_has_attempt'),
      insert_failed: t('skipReason.insert_failed'),
      unknown: t('skipReason.unknown'),
    },
    gradeFormat: t.raw('gradeFormat') as string,
    backToContests: t('backToContests'),
    confirmTitle: t('confirmTitle'),
    confirmBody: t.raw('confirmBody') as string,
    confirmCancel: t('confirmCancel'),
    confirmSubmit: t('confirmSubmit'),
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
          📝 {t('title', { contestTitle: title ?? '' })}
        </h1>
        <p className="mt-1 text-sm text-numoria-mid">
          {t('subtitle', { teamName: activeSession.teamName })}
        </p>
        <p className="mt-2 text-xs font-bold text-numoria-teal">
          🟢{' '}
          {t('sessionOpenUntil', {
            time: new Date(activeSession.closesAt).toLocaleTimeString(locale, {
              hour: '2-digit',
              minute: '2-digit',
            }),
          })}
        </p>
      </header>

      <PaperEntryForm
        sessionId={activeSession.id}
        contestId={contestId}
        students={students}
        problems={problems}
        labels={labels}
      />

      <Link href="/contests" className="text-sm font-bold text-numoria-orange hover:underline">
        ← {t('backToContests')}
      </Link>
    </div>
  );
}
