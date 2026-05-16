import { Link } from '@/i18n/navigation';
import { createServerClient } from '@numoria/database/server';
import { ActionCard, Button, NumaAvatar, StatPill } from '@numoria/ui';
import { getFormatter, getTranslations } from 'next-intl/server';

interface TeacherDashboardProps {
  userId: string;
  displayName: string;
  schoolId: string;
}

interface TeamSummary {
  id: string;
  name: string;
  invite_code: string;
  max_members: number;
  member_count: number;
}

interface SchoolInfo {
  name: string;
  verified: boolean;
  city: string | null;
  logo_url: string | null;
}

interface ActiveSessionInfo {
  contestId: string;
  contestTitle: string;
  teamName: string;
  closesAt: string;
  submittedCount: number;
  totalMembers: number;
}

async function fetchTeacherData(
  userId: string,
  schoolId: string,
  locale: string,
): Promise<{
  school: SchoolInfo | null;
  teams: TeamSummary[];
  activeSessions: ActiveSessionInfo[];
  totalStudents: number;
}> {
  const supabase = await createServerClient();

  const schoolPromise = supabase
    .from('schools')
    .select('name, verified, city, logo_url')
    .eq('id', schoolId)
    .single();

  const teamsPromise = supabase
    .from('teams')
    .select('id, name, invite_code, max_members')
    .eq('coach_id', userId)
    .order('created_at', { ascending: false });

  const [schoolRes, teamsRes] = await Promise.all([schoolPromise, teamsPromise]);

  const school = schoolRes.data as SchoolInfo | null;
  const teams =
    (teamsRes.data as Array<{
      id: string;
      name: string;
      invite_code: string;
      max_members: number;
    }> | null) ?? [];

  // Conteo de miembros por team
  let teamSummaries: TeamSummary[] = [];
  let totalStudents = 0;
  if (teams.length > 0) {
    const teamIds = teams.map((t) => t.id);
    const { data: memberRows } = await supabase
      .from('team_members')
      .select('team_id, student_id')
      .in('team_id', teamIds);
    const countByTeam = new Map<string, number>();
    const uniqueStudents = new Set<string>();
    for (const row of ((memberRows ?? []) as Array<{ team_id: string; student_id: string }>) ??
      []) {
      countByTeam.set(row.team_id, (countByTeam.get(row.team_id) ?? 0) + 1);
      uniqueStudents.add(row.student_id);
    }
    totalStudents = uniqueStudents.size;
    teamSummaries = teams.map((t) => ({
      ...t,
      member_count: countByTeam.get(t.id) ?? 0,
    }));
  }

  // Active sessions (Phase 4 MOEMS) — sessions abiertas del teacher
  await supabase.rpc('expire_old_contest_sessions');
  const { data: sessionRows } = await supabase
    .from('contest_sessions')
    .select('id, contest_id, team_id, closes_at')
    .eq('opened_by', userId)
    .eq('status', 'open');
  const sessions =
    ((sessionRows ?? []) as Array<{
      id: string;
      contest_id: string;
      team_id: string;
      closes_at: string;
    }>) ?? [];

  let activeSessions: ActiveSessionInfo[] = [];
  if (sessions.length > 0) {
    const contestIds = Array.from(new Set(sessions.map((s) => s.contest_id)));
    const sessionTeamIds = Array.from(new Set(sessions.map((s) => s.team_id)));

    // Contest titles
    const { data: contestRows } = await supabase
      .from('contests')
      .select('id, title_es, title_en')
      .in('id', contestIds);
    const contestById = new Map(
      ((contestRows ?? []) as Array<{ id: string; title_es: string; title_en: string }>).map(
        (c) => [c.id, locale === 'es' ? c.title_es : c.title_en],
      ),
    );

    // Team names
    const teamNameById = new Map(teams.map((t) => [t.id, t.name]));

    // Attempts submitted/total per session's team for this contest
    const teamMemberCount = new Map<string, number>();
    if (sessionTeamIds.length > 0) {
      const { data: sessionMemberRows } = await supabase
        .from('team_members')
        .select('team_id')
        .in('team_id', sessionTeamIds);
      for (const r of ((sessionMemberRows ?? []) as Array<{ team_id: string }>) ?? []) {
        teamMemberCount.set(r.team_id, (teamMemberCount.get(r.team_id) ?? 0) + 1);
      }
    }

    // Submitted count per (contest, session.team) — get students in each team
    // who have submitted_at for this contest
    const submittedCountByKey = new Map<string, number>();
    if (contestIds.length > 0 && sessionTeamIds.length > 0) {
      const { data: teamStudentRows } = await supabase
        .from('team_members')
        .select('team_id, student_id')
        .in('team_id', sessionTeamIds);
      const studentToTeams = new Map<string, string[]>();
      for (const r of ((teamStudentRows ?? []) as Array<{
        team_id: string;
        student_id: string;
      }>) ?? []) {
        const arr = studentToTeams.get(r.student_id) ?? [];
        arr.push(r.team_id);
        studentToTeams.set(r.student_id, arr);
      }
      const allStudentIds = Array.from(studentToTeams.keys());

      if (allStudentIds.length > 0) {
        const { data: attemptRows } = await supabase
          .from('contest_attempts')
          .select('contest_id, student_id, submitted_at')
          .in('contest_id', contestIds)
          .in('student_id', allStudentIds);
        for (const a of ((attemptRows ?? []) as Array<{
          contest_id: string;
          student_id: string;
          submitted_at: string | null;
        }>) ?? []) {
          if (!a.submitted_at) continue;
          const teamIdsOfStudent = studentToTeams.get(a.student_id) ?? [];
          for (const tid of teamIdsOfStudent) {
            const key = `${a.contest_id}::${tid}`;
            submittedCountByKey.set(key, (submittedCountByKey.get(key) ?? 0) + 1);
          }
        }
      }
    }

    activeSessions = sessions.map((s) => ({
      contestId: s.contest_id,
      contestTitle: contestById.get(s.contest_id) ?? '—',
      teamName: teamNameById.get(s.team_id) ?? '—',
      closesAt: s.closes_at,
      submittedCount: submittedCountByKey.get(`${s.contest_id}::${s.team_id}`) ?? 0,
      totalMembers: teamMemberCount.get(s.team_id) ?? 0,
    }));
  }

  return { school, teams: teamSummaries, activeSessions, totalStudents };
}

export async function TeacherDashboard({ userId, displayName, schoolId }: TeacherDashboardProps) {
  const t = await getTranslations('dashboard');
  const tTeacher = await getTranslations('dashboard.teacher');
  const format = await getFormatter();
  // Detectar locale via getTranslations puede ser tricky; usamos el del Server
  // Component padre indirectamente via los strings retornados. Para sessions
  // necesitamos el locale para los titles bilingues — lo derivamos del format.
  const locale = (format as unknown as { locale?: string }).locale ?? 'es';

  const { school, teams, activeSessions, totalStudents } = await fetchTeacherData(
    userId,
    schoolId,
    locale,
  );

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <NumaAvatar pose="celebrate" size="lg" />
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
            {t('greeting', { name: displayName })}
          </h1>
          {teams.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              <StatPill icon="👥" variant="indigo">
                {teams.length} {teams.length === 1 ? 'equipo' : 'equipos'}
              </StatPill>
              <StatPill icon="⭐" variant="teal">
                {totalStudents} {totalStudents === 1 ? 'estudiante' : 'estudiantes'}
              </StatPill>
              {activeSessions.length > 0 && (
                <StatPill icon="🟢" variant="dorado">
                  {activeSessions.length}{' '}
                  {activeSessions.length === 1 ? 'sesión activa' : 'sesiones activas'}
                </StatPill>
              )}
            </div>
          )}
        </div>
        {/* Botón ⚙️ Configuración — lleva a /settings (escuela + perfil + suscripción) */}
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 self-start rounded-full border-2 border-numoria-gray bg-white px-4 py-2 text-sm font-bold text-numoria-grafito transition hover:border-numoria-indigo hover:text-numoria-indigo sm:self-auto"
        >
          <span aria-hidden>⚙️</span>
          {tTeacher('settings')}
        </Link>
      </header>

      {/* === ACTIVE SESSIONS BANNER (Phase 4 MOEMS) === */}
      {activeSessions.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-numoria-ink">
            ⚡ {tTeacher('activeSessionsTitle')}
          </h2>
          <div className="flex flex-col gap-3">
            {activeSessions.map((session) => (
              <article
                key={`${session.contestId}-${session.teamName}`}
                className="rounded-xl border-2 border-numoria-teal bg-numoria-teal/5 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-display text-base font-bold text-numoria-ink">
                      🟢 {session.contestTitle}
                    </p>
                    <p className="mt-1 text-sm text-numoria-mid">
                      {tTeacher('sessionTeam')}: <strong>{session.teamName}</strong> ·{' '}
                      {tTeacher('sessionSubmitted', {
                        submitted: session.submittedCount,
                        total: session.totalMembers,
                      })}
                    </p>
                  </div>
                  <span className="rounded-full bg-numoria-teal/15 px-3 py-1 text-xs font-bold text-numoria-teal">
                    {tTeacher('sessionUntil', {
                      time: format.dateTime(new Date(session.closesAt), {
                        hour: 'numeric',
                        minute: 'numeric',
                      }),
                    })}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="primary" size="sm" asChild>
                    <Link href={`/contests/${session.contestId}/leaderboard`}>
                      📊 {tTeacher('viewLeaderboard')}
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/contests/${session.contestId}/paper-entry`}>
                      📝 {tTeacher('paperEntry')}
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* === QUICK ACTIONS (siempre visible) === */}
      <section>
        <h2 className="mb-3 font-display text-lg font-bold text-numoria-ink">
          🚀 {tTeacher('quickActionsTitle')}
        </h2>
        {/* 4 cards no redundantes — cada una con destino único.
            La card "➕ Crear equipo" se elimina (ya hay CTA dentro de /teams). */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
          <Link href="/contests/practices" className="block">
            <ActionCard
              variant="teal"
              icon="📚"
              title={tTeacher('actionPractices')}
              description={tTeacher('actionPracticesDesc')}
            />
          </Link>

          <Link href="/contests/officials" className="block">
            <ActionCard
              variant="orange"
              icon="🏆"
              title={tTeacher('actionContests')}
              description={tTeacher('actionContestsDesc')}
            />
          </Link>

          <Link href="/contests/paper-entry" className="block">
            <ActionCard
              variant="coral"
              icon="📝"
              title={tTeacher('actionPaperEntry')}
              description={tTeacher('actionPaperEntryDesc')}
            />
          </Link>

          <Link href="/teams" className="block">
            <ActionCard
              variant="indigo"
              icon="👥"
              title={tTeacher('actionTeams')}
              description={tTeacher('actionTeamsDesc')}
            />
          </Link>
        </div>
      </section>

      {/* === SCHOOL + TEAMS (informativo, secundario) === */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* School */}
        {school && (
          <div className="rounded-xl border-2 border-numoria-niebla/30 bg-white p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-numoria-mid">
              🏫 {tTeacher('schoolTitle')}
            </h3>
            <div className="mt-3 flex items-center gap-3">
              {school.logo_url ? (
                <img
                  src={school.logo_url}
                  alt={school.name}
                  className="h-12 w-12 rounded-md border-2 border-numoria-gray object-contain"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-md border-2 border-numoria-gray bg-numoria-cloud text-xl">
                  🏫
                </div>
              )}
              <div className="flex-1">
                <p className="font-display text-sm font-bold text-numoria-ink">{school.name}</p>
                {school.city && <p className="text-xs text-numoria-mid">{school.city}</p>}
                <span
                  className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    school.verified
                      ? 'bg-numoria-teal/15 text-numoria-teal'
                      : 'bg-numoria-yellow/20 text-numoria-ink'
                  }`}
                >
                  {school.verified ? tTeacher('schoolVerified') : tTeacher('schoolUnverified')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Teams summary */}
        <div className="rounded-xl border-2 border-numoria-niebla/30 bg-white p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-numoria-mid">
            👥 {tTeacher('teamsTitle')}
          </h3>
          {teams.length === 0 ? (
            <p className="mt-3 text-sm text-numoria-mid">{tTeacher('noTeamsYet')}</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {teams.slice(0, 3).map((team) => (
                <li key={team.id} className="flex items-center justify-between gap-2 text-sm">
                  <Link
                    href={`/teams/${team.id}`}
                    className="font-medium text-numoria-ink hover:text-numoria-orange hover:underline"
                  >
                    {team.name}
                  </Link>
                  <span className="rounded-full bg-numoria-cloud px-2 py-0.5 text-xs text-numoria-mid">
                    {tTeacher('teamMembersCount', {
                      count: team.member_count,
                      max: team.max_members,
                    })}
                  </span>
                </li>
              ))}
              {teams.length > 3 && (
                <li className="mt-1 text-xs italic text-numoria-mid">
                  +{teams.length - 3} {tTeacher('moreTeams')}
                </li>
              )}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
