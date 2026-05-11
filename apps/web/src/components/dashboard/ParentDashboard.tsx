import { createAdminClient, createServerClient } from '@numoria/database/server';
import { NumaAvatar } from '@numoria/ui';
import { getTranslations } from 'next-intl/server';

interface ParentDashboardProps {
  userId: string;
  displayName: string;
}

interface ChildSummary {
  id: string;
  display_name: string;
  grade: number | null;
  email: string;
  onboarding_completed: boolean;
  team_name: string | null;
}

const MAX_CHILDREN = 4;

async function fetchChildren(parentId: string): Promise<ChildSummary[]> {
  // Necesitamos email (auth.users) y team (team_members + teams). Las RLS
  // de profiles permiten al parent ver perfiles donde parent_id = auth.uid().
  // Para auth.users el parent NO tiene acceso normal; usamos admin client
  // limitando manualmente al scope (children del parent).
  const supabase = await createServerClient();
  const admin = createAdminClient();

  const { data: childRows } = await supabase
    .from('profiles')
    .select('id, display_name, grade, onboarding_completed')
    .eq('parent_id', parentId)
    .order('created_at', { ascending: true });

  const children = (childRows ?? []) as Array<{
    id: string;
    display_name: string;
    grade: number | null;
    onboarding_completed: boolean;
  }>;

  if (children.length === 0) return [];

  const childIds = children.map((c) => c.id);

  // Fetch emails + teams en paralelo
  const [emailsRes, membershipsRes] = await Promise.all([
    admin.auth.admin
      .listUsers({ page: 1, perPage: 1000 })
      .then((r) => r.data.users.filter((u) => childIds.includes(u.id))),
    supabase.from('team_members').select('student_id, team_id').in('student_id', childIds),
  ]);

  const emailById = new Map(emailsRes.map((u) => [u.id, u.email ?? '']));

  const memberships =
    (membershipsRes.data as Array<{ student_id: string; team_id: string }> | null) ?? [];
  const teamIdByChild = new Map(memberships.map((m) => [m.student_id, m.team_id]));
  const uniqueTeamIds = Array.from(new Set(memberships.map((m) => m.team_id)));

  let teamNames: Map<string, string> = new Map();
  if (uniqueTeamIds.length > 0) {
    const { data: teamRows } = await supabase
      .from('teams')
      .select('id, name')
      .in('id', uniqueTeamIds);
    teamNames = new Map(
      ((teamRows as Array<{ id: string; name: string }> | null) ?? []).map((t) => [t.id, t.name]),
    );
  }

  return children.map((c) => {
    const teamId = teamIdByChild.get(c.id);
    return {
      id: c.id,
      display_name: c.display_name,
      grade: c.grade,
      email: emailById.get(c.id) ?? '—',
      onboarding_completed: c.onboarding_completed,
      team_name: teamId ? (teamNames.get(teamId) ?? null) : null,
    };
  });
}

export async function ParentDashboard({ userId, displayName }: ParentDashboardProps) {
  const t = await getTranslations('dashboard');
  const tParent = await getTranslations('dashboard.parent');

  const children = await fetchChildren(userId);

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

      <section>
        <h2 className="mb-3 font-display text-lg font-bold text-numoria-ink">
          👨‍👩‍👧 {tParent('childrenTitle')}
        </h2>

        {children.length === 0 ? (
          <p className="rounded-xl border-2 border-dashed border-numoria-gray bg-white p-6 text-center text-sm text-numoria-mid">
            {tParent('noChildrenYet')}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {children.map((child) => (
              <li key={child.id} className="rounded-xl border-2 border-numoria-gray bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-base font-bold text-numoria-ink">
                      🎓 {child.display_name}
                    </p>
                    <p className="mt-0.5 text-xs text-numoria-mid">{child.email}</p>
                    {child.grade && (
                      <p className="mt-0.5 text-xs text-numoria-mid">
                        {tParent('childGrade', { grade: child.grade })}
                      </p>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                      child.onboarding_completed
                        ? 'bg-numoria-green/15 text-numoria-green'
                        : 'bg-numoria-yellow/20 text-numoria-ink'
                    }`}
                  >
                    {child.onboarding_completed
                      ? `✓ ${tParent('childActive')}`
                      : `⏳ ${tParent('childPending')}`}
                  </span>
                </div>
                <p className="mt-3 text-sm text-numoria-mid">
                  {child.team_name
                    ? tParent('childTeam', { team: child.team_name })
                    : tParent('childNoTeam')}
                </p>
              </li>
            ))}
          </ul>
        )}

        {children.length > 0 && children.length < MAX_CHILDREN && (
          <p className="mt-4 text-center text-sm text-numoria-mid">
            {/* Por ahora sin link funcional — Phase 3 implementa el flow */}
            {tParent('addChildCta')}
          </p>
        )}
        {children.length >= MAX_CHILDREN && (
          <p className="mt-4 text-center text-xs text-numoria-mid">
            {tParent('maxChildrenReached')}
          </p>
        )}
      </section>
    </div>
  );
}
