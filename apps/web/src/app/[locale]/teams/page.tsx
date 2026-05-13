import { TeamShareButtons } from '@/components/teams/TeamShareButtons';
import { Link } from '@/i18n/navigation';
import { createServerClient } from '@numoria/database/server';
import type { Tables } from '@numoria/database/types';
import { Button } from '@numoria/ui';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

type Profile = Tables<'profiles'>;
type Team = Tables<'teams'>;

/**
 * Página /teams — lista de equipos del teacher.
 *
 * Solo teachers acceden. Muestra cards con:
 *   - Nombre del team
 *   - Código de invitación (copyable)
 *   - Capacity (X / Y miembros)
 *   - CTA "Ver detalles" → /teams/[id]
 *
 * Si no tiene teams aún, muestra empty state + CTA crear.
 */
export default async function TeamsListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('teams.list');

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  // Role gate: solo teachers
  const rpcResult = await supabase.rpc('get_my_profile');
  const profile = rpcResult.data as Profile | null;
  if (!profile || profile.role !== 'teacher') {
    redirect(`/${locale}/`);
  }

  // Fetch teams del teacher
  const { data: teamRows } = await supabase
    .from('teams')
    .select('id, name, invite_code, max_members, division, created_at')
    .eq('coach_id', user.id)
    .order('created_at', { ascending: false });

  const teams =
    ((teamRows ?? []) as Array<
      Pick<Team, 'id' | 'name' | 'invite_code' | 'max_members' | 'division' | 'created_at'>
    >) ?? [];

  // Fetch member counts
  const memberCountByTeam = new Map<string, number>();
  if (teams.length > 0) {
    const teamIds = teams.map((t) => t.id);
    const { data: memberRows } = await supabase
      .from('team_members')
      .select('team_id')
      .in('team_id', teamIds);
    for (const row of ((memberRows ?? []) as Array<{ team_id: string }>) ?? []) {
      memberCountByTeam.set(row.team_id, (memberCountByTeam.get(row.team_id) ?? 0) + 1);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
            👥 {t('title')}
          </h1>
          <p className="mt-1 text-sm text-numoria-mid">{t('subtitle')}</p>
        </div>
        <Button variant="primary" size="md" asChild>
          <Link href="/teams/new">➕ {t('createNewTeam')}</Link>
        </Button>
      </header>

      {teams.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-numoria-niebla/40 bg-white p-12 text-center">
          <p className="text-4xl">👥</p>
          <p className="font-display text-lg font-bold text-numoria-ink">{t('emptyTitle')}</p>
          <p className="max-w-md text-sm text-numoria-mid">{t('emptyBody')}</p>
          <Button variant="primary" size="lg" asChild>
            <Link href="/teams/new">🚀 {t('createFirstTeam')}</Link>
          </Button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {teams.map((team) => {
            const memberCount = memberCountByTeam.get(team.id) ?? 0;
            const divisionLabel = team.division === 'elementary' ? t('divisionE') : t('divisionM');
            return (
              <li key={team.id}>
                <Link
                  href={`/teams/${team.id}`}
                  className="group flex h-full flex-col gap-3 rounded-xl border-2 border-numoria-niebla/30 bg-white p-5 transition hover:border-numoria-orange hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h2 className="font-display text-lg font-bold text-numoria-ink group-hover:text-numoria-orange">
                        {team.name}
                      </h2>
                      <p className="mt-1 text-xs uppercase tracking-wider text-numoria-mid">
                        {divisionLabel}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        memberCount >= team.max_members
                          ? 'bg-numoria-coral/15 text-numoria-coral'
                          : 'bg-numoria-cloud text-numoria-mid'
                      }`}
                    >
                      {memberCount} / {team.max_members}
                    </span>
                  </div>

                  <div className="rounded-md bg-numoria-cloud px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-numoria-mid">
                      {t('inviteCode')}
                    </p>
                    <p className="font-mono text-sm font-bold tracking-wider text-numoria-ink">
                      {team.invite_code}
                    </p>
                  </div>

                  {/* Share buttons — copy URL + WhatsApp */}
                  <TeamShareButtons
                    inviteCode={team.invite_code}
                    teamName={team.name}
                    labels={{
                      copyUrl: t('share.copyUrl'),
                      copied: t('share.copied'),
                      shareWhatsApp: t('share.whatsApp'),
                      inviteMessage: t.raw('share.message') as string,
                    }}
                  />

                  <span className="mt-auto text-sm font-bold text-numoria-orange opacity-0 transition group-hover:opacity-100">
                    {t('viewDetails')} →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-4 text-center">
        <Link href="/" className="text-sm font-bold text-numoria-orange hover:underline">
          ← {t('backToHome')}
        </Link>
      </div>
    </div>
  );
}
