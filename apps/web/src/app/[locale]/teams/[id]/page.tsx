import { TeamDetailView } from '@/components/teams/TeamDetailView';
import { createServerClient } from '@numoria/database/server';
import type { Tables } from '@numoria/database/types';
import { setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';

type Profile = Tables<'profiles'>;
type Team = Tables<'teams'>;

/**
 * Vista de un team específico. Solo el coach del team puede ver esta página
 * (RLS de teams + team_members hace cumplir esto).
 */
export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const rpcResult = await supabase.rpc('get_my_profile');
  const profile = rpcResult.data as Profile | null;

  if (!profile || profile.role !== 'teacher') {
    redirect(`/${locale}/`);
  }

  // Fetch del team (RLS: authenticated_view_teams permite a cualquier auth verlo;
  // pero queremos que sólo el coach acceda a esta vista admin → check explícito).
  const { data: teamRow, error: teamErr } = await supabase
    .from('teams')
    .select('id, name, invite_code, max_members, division, school_id, coach_id')
    .eq('id', id)
    .single();

  if (teamErr || !teamRow) {
    notFound();
  }

  const team = teamRow as Pick<
    Team,
    'id' | 'name' | 'invite_code' | 'max_members' | 'division' | 'school_id' | 'coach_id'
  >;

  if (team.coach_id !== user.id) {
    // No es el coach → 404 (no leak de existencia)
    notFound();
  }

  // Fetch school name
  const { data: schoolRow } = await supabase
    .from('schools')
    .select('name')
    .eq('id', team.school_id)
    .single();
  const schoolName = (schoolRow as { name: string } | null)?.name ?? '';

  // Fetch team_members + display_name de cada uno
  // RLS: coach_views_team_members permite al coach ver miembros de sus teams
  const { data: memberRows } = await supabase
    .from('team_members')
    .select('student_id, joined_at')
    .eq('team_id', id)
    .order('joined_at', { ascending: true });

  const memberStubs = (memberRows as Array<{ student_id: string; joined_at: string }> | null) ?? [];

  // Resolver display_name de cada miembro
  // Nota: profiles RLS limita lo que el coach puede leer, pero como tengo el student_id
  // y el coach tiene relación legítima via team_members, el join debería pasar.
  let members: Array<{ student_id: string; joined_at: string; display_name: string }> = [];
  if (memberStubs.length > 0) {
    const studentIds = memberStubs.map((m) => m.student_id);
    const { data: profileRows } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', studentIds);
    const nameMap = new Map(
      ((profileRows as Array<{ id: string; display_name: string }> | null) ?? []).map((p) => [
        p.id,
        p.display_name,
      ]),
    );
    members = memberStubs.map((m) => ({
      student_id: m.student_id,
      joined_at: m.joined_at,
      display_name: nameMap.get(m.student_id) ?? '—',
    }));
  }

  return (
    <TeamDetailView
      teamId={team.id}
      teamName={team.name}
      inviteCode={team.invite_code}
      maxMembers={team.max_members}
      schoolName={schoolName}
      division={team.division}
      members={members}
    />
  );
}
