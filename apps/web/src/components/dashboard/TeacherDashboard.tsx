import { SummerBowlBanner } from '@/components/dashboard/SummerBowlBanner';
import { TeacherGettingStarted } from '@/components/dashboard/TeacherGettingStarted';
import { Link } from '@/i18n/navigation';
import { createServerClient } from '@numoria/database/server';
import { Button, NumaAvatar } from '@numoria/ui';
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

  const greetingLabel = greetingByHour(new Date());

  return (
    <div className="relative flex flex-col gap-7">
      {/* Backdrop matemático decorativo */}
      <MathBackdrop />

      {/* === HERO UNIFICADO === */}
      <section className="relative grid items-center gap-5 rounded-[18px] bg-white p-6 shadow-[0_1px_0_rgba(30,27,75,0.02),0_10px_28px_-20px_rgba(30,27,75,0.18)] sm:grid-cols-[88px_1fr_auto] sm:gap-6 sm:p-7">
        <div className="flex justify-center sm:block">
          <NumaAvatar pose="wave" size="lg" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-numoria-orange">
            {greetingLabel}
          </p>
          <h1 className="mt-1 font-display text-[26px] font-bold leading-tight tracking-tight text-numoria-indigo sm:text-[28px]">
            {tTeacher('helloName', { name: displayName })}
          </h1>

          {/* Pills */}
          <div className="mt-3 flex flex-wrap gap-2">
            {teams.length > 0 && (
              <span className="whitespace-nowrap rounded-full bg-numoria-indigo/10 px-3 py-1 text-xs font-bold text-numoria-indigo">
                {tTeacher('pillTeams', { count: teams.length })}
              </span>
            )}
            {totalStudents > 0 && (
              <span className="whitespace-nowrap rounded-full bg-numoria-orange/10 px-3 py-1 text-xs font-bold text-numoria-orange">
                {tTeacher('pillStudents', { count: totalStudents })}
              </span>
            )}
            {school && (
              <span
                className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${
                  school.verified
                    ? 'bg-numoria-teal/15 text-[#0d8278]'
                    : 'bg-[#fce6cf] text-[#b76b1a]'
                }`}
              >
                {school.verified ? tTeacher('schoolVerified') : tTeacher('schoolUnverified')}
              </span>
            )}
            {activeSessions.length > 0 && (
              <span className="whitespace-nowrap rounded-full bg-numoria-dorado/15 px-3 py-1 text-xs font-bold text-[#a86e08]">
                {tTeacher('pillActiveSessions', { count: activeSessions.length })}
              </span>
            )}
          </div>

          {/* Logo escuela + nombre + ciudad */}
          {school && (
            <div className="mt-3 flex items-center gap-2">
              {school.logo_url ? (
                <img
                  src={school.logo_url}
                  alt={school.name}
                  className="h-6 w-6 rounded-[7px] border border-numoria-gray bg-white object-contain"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-[7px] border border-numoria-gray bg-white text-xs">
                  🏫
                </div>
              )}
              <span className="text-sm font-semibold text-numoria-grafito">{school.name}</span>
              {school.city && (
                <>
                  <span className="text-xs text-numoria-mid">·</span>
                  <span className="text-sm text-numoria-mid">{school.city}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* CTA principal */}
        <div className="sm:justify-self-end">
          <Link
            href="/contests/practices"
            className="inline-flex items-center gap-2 rounded-[12px] bg-numoria-orange px-5 py-3 text-sm font-bold text-white shadow-[0_4px_12px_rgba(249,115,22,0.25)] transition hover:brightness-105 active:translate-y-[1px]"
          >
            {tTeacher('ctaOpenPractice')}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* === SUMMER BOWL CTA === */}
      <SummerBowlBanner />

      {/* === PRIMEROS PASOS (solo para profes sin equipos aún) === */}
      {teams.length === 0 && <TeacherGettingStarted />}

      {/* === ACTIVE SESSIONS BANNER (solo si hay sesiones abiertas) === */}
      {activeSessions.length > 0 && (
        <section className="relative">
          <h2 className="mb-3 font-display text-lg font-bold text-numoria-indigo">
            ⚡ {tTeacher('activeSessionsTitle')}
          </h2>
          <div className="flex flex-col gap-3">
            {activeSessions.map((session) => (
              <article
                key={`${session.contestId}-${session.teamName}`}
                className="rounded-[18px] border-2 border-numoria-teal/30 bg-numoria-teal/5 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-display text-base font-bold text-numoria-indigo">
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

      {/* === ACCIONES RÁPIDAS === */}
      <section className="relative">
        <h2 className="mb-4 font-display text-lg font-bold text-numoria-indigo">
          {tTeacher('quickActionsTitle')}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionTile
            href="/contests/practices"
            title={tTeacher('actionPractices')}
            description={tTeacher('actionPracticesDesc')}
            kbd="P"
            tone="orange"
            icon={<IconBook />}
          />
          <QuickActionTile
            href="/contests/officials"
            title={tTeacher('actionContests')}
            description={tTeacher('actionContestsDesc')}
            kbd="C"
            tone="indigo"
            icon={<IconTrophy />}
          />
          <QuickActionTile
            href="/contests/paper-entry"
            title={tTeacher('actionPaperEntry')}
            description={tTeacher('actionPaperEntryDesc')}
            kbd="E"
            tone="green"
            icon={<IconPencil />}
          />
          <QuickActionTile
            href="/teams"
            title={tTeacher('actionTeams')}
            description={tTeacher('actionTeamsDesc')}
            kbd="G"
            tone="pink"
            icon={<IconUsers />}
          />
        </div>
      </section>

      {/* === TUS EQUIPOS (tabla) === */}
      <section className="relative">
        <header className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-bold text-numoria-indigo">
            {tTeacher('teamsTitle')}
          </h2>
          {teams.length > 0 && (
            <Link
              href="/teams"
              className="text-[13px] font-bold text-numoria-orange hover:underline"
            >
              {tTeacher('viewAll')}
            </Link>
          )}
        </header>

        {teams.length === 0 ? (
          <div className="rounded-[18px] border-2 border-dashed border-numoria-gray bg-white p-8 text-center text-sm text-numoria-mid">
            {tTeacher('noTeamsYet')}
          </div>
        ) : (
          <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_1px_0_rgba(30,27,75,0.02),0_10px_28px_-20px_rgba(30,27,75,0.18)]">
            {/* Header row */}
            <div className="grid grid-cols-[1.5fr_1fr_1fr_auto] gap-3 bg-numoria-indigo/5 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-numoria-indigo/70 sm:px-6">
              <span>{tTeacher('tableTeam')}</span>
              <span>{tTeacher('tableMembers')}</span>
              <span>{tTeacher('tableLastActivity')}</span>
              <span />
            </div>
            {/* Rows */}
            <ul className="divide-y divide-numoria-gray/60">
              {teams.map((team) => (
                <li
                  key={team.id}
                  className="grid grid-cols-[1.5fr_1fr_1fr_auto] items-center gap-3 px-5 py-4 sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-numoria-indigo font-display text-[13px] font-bold text-white">
                      {teamInitials(team.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-numoria-grafito">{team.name}</p>
                      <p className="text-xs text-numoria-mid">
                        {tTeacher('tableTeamCode', { code: team.invite_code })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-[90px] overflow-hidden rounded-full bg-numoria-gray">
                      <div
                        className="h-full rounded-full bg-numoria-orange"
                        style={{
                          width: `${Math.min(100, (team.member_count / team.max_members) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-[13px] text-numoria-mid">
                      {team.member_count} / {team.max_members}
                    </span>
                  </div>

                  <span className="text-[13px] text-numoria-mid">
                    {tTeacher('tableNoActivity')}
                  </span>

                  <Link
                    href={`/teams/${team.id}`}
                    className="rounded-[9px] border border-numoria-gray px-3 py-1.5 text-[13px] font-semibold text-numoria-grafito transition hover:border-numoria-orange hover:text-numoria-orange"
                  >
                    {tTeacher('tableOpen')}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

// ============================================================
// Helpers + componentes locales del nuevo layout
// ============================================================

function greetingByHour(now: Date): string {
  const h = now.getHours();
  if (h < 12) return '¡BUENOS DÍAS!';
  if (h < 19) return '¡BUENAS TARDES!';
  return '¡BUENAS NOCHES!';
}

function teamInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return (
    parts
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 2) || '?'
  );
}

/**
 * Backdrop decorativo de símbolos matemáticos. Capa absolute aria-hidden
 * sobre los primeros ~220px del viewport, no captura clicks.
 */
function MathBackdrop() {
  const symbols: Array<{
    char: string;
    left: string;
    top: string;
    size: number;
    rot: number;
    color: 'orange' | 'indigo';
  }> = [
    { char: 'π', left: '4%', top: '8px', size: 92, rot: -8, color: 'indigo' },
    { char: '∑', left: '22%', top: '20px', size: 68, rot: 6, color: 'orange' },
    { char: '√', left: '38%', top: '0px', size: 78, rot: -4, color: 'indigo' },
    { char: '∞', left: '55%', top: '30px', size: 58, rot: 8, color: 'orange' },
    { char: '÷', left: '70%', top: '8px', size: 70, rot: -10, color: 'indigo' },
    { char: '≈', left: '84%', top: '24px', size: 60, rot: 4, color: 'orange' },
    { char: '²', left: '93%', top: '0px', size: 50, rot: -6, color: 'indigo' },
  ];
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[220px] overflow-hidden"
    >
      {symbols.map((s) => (
        <span
          key={s.char + s.left}
          className={`absolute select-none font-display font-bold ${
            s.color === 'orange' ? 'text-numoria-orange' : 'text-numoria-indigo'
          }`}
          style={{
            left: s.left,
            top: s.top,
            fontSize: `${s.size}px`,
            opacity: 0.06,
            transform: `rotate(${s.rot}deg)`,
          }}
        >
          {s.char}
        </span>
      ))}
    </div>
  );
}

// ----- Quick action tile -----

type ActionTone = 'orange' | 'indigo' | 'green' | 'pink';

function QuickActionTile({
  href,
  title,
  description,
  kbd,
  tone,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  kbd: string;
  tone: ActionTone;
  icon: React.ReactNode;
}) {
  const toneTile: Record<ActionTone, string> = {
    orange: 'bg-numoria-orange/15 text-numoria-orange',
    indigo: 'bg-numoria-indigo/10 text-numoria-indigo',
    green: 'bg-[#d4ebe1] text-[#15967a]',
    pink: 'bg-[#f8dbe4] text-[#d04a78]',
  };
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-[18px] bg-white p-5 shadow-[0_1px_0_rgba(30,27,75,0.02),0_10px_28px_-20px_rgba(30,27,75,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_2px_0_rgba(30,27,75,0.02),0_18px_36px_-20px_rgba(30,27,75,0.28)]"
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-[12px] ${toneTile[tone]}`}
        >
          {icon}
        </div>
        <kbd className="rounded-md border border-numoria-gray bg-numoria-crema px-2 py-0.5 text-[11px] font-semibold text-numoria-mid">
          {kbd}
        </kbd>
      </div>
      <div>
        <p className="font-display text-[17px] font-bold leading-tight text-numoria-indigo">
          {title}
        </p>
        <p className="mt-1 text-[13px] leading-snug text-numoria-mid">{description}</p>
      </div>
    </Link>
  );
}

// ----- Iconos SVG inline (estilo Lucide) -----

function IconBook() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <title>Book icon</title>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function IconTrophy() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <title>Trophy icon</title>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function IconPencil() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <title>Pencil icon</title>
      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <title>Users icon</title>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
