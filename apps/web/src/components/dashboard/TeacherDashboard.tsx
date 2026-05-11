import { Link } from '@/i18n/navigation';
import { createServerClient } from '@numoria/database/server';
import { Button, NumaAvatar } from '@numoria/ui';
import { getTranslations } from 'next-intl/server';

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

async function fetchTeacherData(
  userId: string,
  schoolId: string,
): Promise<{ school: SchoolInfo | null; teams: TeamSummary[] }> {
  const supabase = await createServerClient();

  // School (RLS: teachers ven la suya — created_by = auth.uid())
  const schoolPromise = supabase
    .from('schools')
    .select('name, verified, city, logo_url')
    .eq('id', schoolId)
    .single();

  // Teams (RLS authenticated_view_teams permite a auth ver todos los teams;
  // filtramos por coach_id)
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

  // Conteo de miembros por team (RLS coach_views_team_members)
  let teamSummaries: TeamSummary[] = [];
  if (teams.length > 0) {
    const teamIds = teams.map((t) => t.id);
    const { data: memberRows } = await supabase
      .from('team_members')
      .select('team_id')
      .in('team_id', teamIds);
    const countByTeam = new Map<string, number>();
    for (const row of (memberRows as Array<{ team_id: string }> | null) ?? []) {
      countByTeam.set(row.team_id, (countByTeam.get(row.team_id) ?? 0) + 1);
    }
    teamSummaries = teams.map((t) => ({
      ...t,
      member_count: countByTeam.get(t.id) ?? 0,
    }));
  }

  return { school, teams: teamSummaries };
}

export async function TeacherDashboard({ userId, displayName, schoolId }: TeacherDashboardProps) {
  const t = await getTranslations('dashboard');
  const tTeacher = await getTranslations('dashboard.teacher');

  const { school, teams } = await fetchTeacherData(userId, schoolId);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center gap-4">
        <NumaAvatar pose="celebrate" size="lg" />
        <div>
          <h1 className="font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
            {t('greeting', { name: displayName })}
          </h1>
        </div>
      </header>

      {/* SCHOOL CARD */}
      {school && (
        <section className="rounded-xl border-2 border-numoria-blue/30 bg-numoria-blue/5 p-6">
          <h2 className="font-display text-lg font-bold text-numoria-ink">
            🏫 {tTeacher('schoolTitle')}
          </h2>
          <div className="mt-3 flex items-center gap-4">
            {school.logo_url ? (
              <img
                src={school.logo_url}
                alt={school.name}
                className="h-16 w-16 rounded-md border-2 border-numoria-gray object-contain"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-md border-2 border-numoria-gray bg-white text-2xl">
                🏫
              </div>
            )}
            <div className="flex-1">
              <p className="font-display text-lg font-bold text-numoria-ink">{school.name}</p>
              {school.city && <p className="text-sm text-numoria-mid">{school.city}</p>}
              <span
                className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                  school.verified
                    ? 'bg-numoria-green/15 text-numoria-green'
                    : 'bg-numoria-yellow/20 text-numoria-ink'
                }`}
              >
                {school.verified ? tTeacher('schoolVerified') : tTeacher('schoolUnverified')}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* TEAMS */}
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-bold text-numoria-ink">
            👥 {tTeacher('teamsTitle')}
          </h2>
        </div>

        {teams.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-numoria-gray bg-white p-8 text-center">
            <p className="text-sm text-numoria-mid">{tTeacher('noTeamsYet')}</p>
            <Button variant="primary" size="lg" asChild>
              <Link href="/teams/new">🚀 {tTeacher('createFirstTeam')}</Link>
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {teams.map((team) => (
              <li
                key={team.id}
                className="rounded-xl border-2 border-numoria-gray bg-white p-5 transition hover:border-numoria-blue"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-base font-bold text-numoria-ink">{team.name}</p>
                    <p className="mt-1 font-mono text-xs tracking-wider text-numoria-mid">
                      {tTeacher('teamCode', { code: team.invite_code })}
                    </p>
                  </div>
                  <span className="rounded-full bg-numoria-cloud px-3 py-1 text-xs font-bold text-numoria-ink">
                    {tTeacher('teamMembersCount', {
                      count: team.member_count,
                      max: team.max_members,
                    })}
                  </span>
                </div>
                <Link
                  href={`/teams/${team.id}`}
                  className="mt-3 inline-block text-sm font-bold text-numoria-blue hover:underline"
                >
                  {tTeacher('viewTeam')}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {teams.length > 0 && (
          <div className="mt-4 text-center">
            <Link href="/teams/new" className="text-sm font-bold text-numoria-blue hover:underline">
              {tTeacher('createAnotherTeam')}
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
