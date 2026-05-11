import { JoinTeamCard } from '@/components/dashboard/JoinTeamCard';
import { createAdminClient, createServerClient } from '@numoria/database/server';
import { NumaAvatar } from '@numoria/ui';
import { getTranslations } from 'next-intl/server';

interface StudentDashboardProps {
  userId: string;
  displayName: string;
  level: number;
  xpTotal: number;
  currentStreak: number;
}

interface TeamWithCoachAndSchool {
  id: string;
  name: string;
  coach_display_name: string;
  school_name: string;
}

async function fetchStudentTeam(userId: string): Promise<TeamWithCoachAndSchool | null> {
  const supabase = await createServerClient();

  // Student ve sus propias memberships (RLS members_view_own_membership)
  const { data: membership } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('student_id', userId)
    .maybeSingle();

  if (!membership) return null;
  const teamId = (membership as { team_id: string }).team_id;

  // RLS authenticated_view_teams permite a cualquier auth ver teams
  const { data: teamRow } = await supabase
    .from('teams')
    .select('id, name, coach_id, school_id')
    .eq('id', teamId)
    .single();

  if (!teamRow) return null;
  const team = teamRow as { id: string; name: string; coach_id: string; school_id: string };

  // Coach name + school name en paralelo.
  //
  // El coach es otro user (teacher), las RLS de profiles NO permiten al
  // student ver perfiles arbitrarios. Como la asociación team_members ya
  // valida que el student está legítimamente en el team, usamos admin
  // client para resolver solo display_name del coach (scope mínimo).
  const admin = createAdminClient();
  const [coachRes, schoolRes] = await Promise.all([
    admin.from('profiles').select('display_name').eq('id', team.coach_id).single(),
    supabase.from('schools').select('name').eq('id', team.school_id).single(),
  ]);

  return {
    id: team.id,
    name: team.name,
    coach_display_name: (coachRes.data as { display_name: string } | null)?.display_name ?? '—',
    school_name: (schoolRes.data as { name: string } | null)?.name ?? '—',
  };
}

export async function StudentDashboard({
  userId,
  displayName,
  level,
  xpTotal,
  currentStreak,
}: StudentDashboardProps) {
  const t = await getTranslations('dashboard');
  const tStudent = await getTranslations('dashboard.student');

  const team = await fetchStudentTeam(userId);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center gap-4">
        <NumaAvatar pose="wave" size="lg" />
        <div>
          <h1 className="font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
            {t('greeting', { name: displayName })}
          </h1>
        </div>
      </header>

      {/* Team card o Join CTA */}
      {team ? (
        <section className="rounded-xl border-2 border-numoria-green/30 bg-numoria-green/5 p-6">
          <h2 className="font-display text-lg font-bold text-numoria-ink">
            👥 {tStudent('teamTitle')}
          </h2>
          <p className="mt-2 font-display text-xl font-bold text-numoria-ink">{team.name}</p>
          <p className="mt-1 text-sm text-numoria-mid">
            {tStudent('teamCoach', { name: team.coach_display_name })}
          </p>
          <p className="text-sm text-numoria-mid">
            {tStudent('teamSchool', { name: team.school_name })}
          </p>
        </section>
      ) : (
        <JoinTeamCard />
      )}

      {/* Stats */}
      <section>
        <h2 className="mb-3 font-display text-lg font-bold text-numoria-ink">
          ✨ {tStudent('myStats')}
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border-2 border-numoria-gray bg-white p-4 text-center">
            <div className="text-2xl">🏅</div>
            <div className="mt-1 font-display text-xl font-bold text-numoria-ink">{level}</div>
            <div className="text-xs text-numoria-mid">{tStudent('level', { level })}</div>
          </div>
          <div className="rounded-xl border-2 border-numoria-gray bg-white p-4 text-center">
            <div className="text-2xl">⭐</div>
            <div className="mt-1 font-display text-xl font-bold text-numoria-ink">{xpTotal}</div>
            <div className="text-xs text-numoria-mid">{tStudent('xpTotal', { xp: xpTotal })}</div>
          </div>
          <div className="rounded-xl border-2 border-numoria-gray bg-white p-4 text-center">
            <div className="text-2xl">🔥</div>
            <div className="mt-1 font-display text-xl font-bold text-numoria-ink">
              {currentStreak}
            </div>
            <div className="text-xs text-numoria-mid">
              {tStudent('streak', { days: currentStreak })}
            </div>
          </div>
        </div>
      </section>

      {/* Próximamente */}
      <section className="rounded-xl border-2 border-dashed border-numoria-gray bg-white p-6 text-center">
        <h2 className="font-display text-base font-bold text-numoria-ink">
          🚧 {tStudent('nextSection')}
        </h2>
        <p className="mt-2 text-sm text-numoria-mid">{tStudent('comingSoon')}</p>
      </section>
    </div>
  );
}
