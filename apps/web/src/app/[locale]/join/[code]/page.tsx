import { JoinTeamView } from '@/components/teams/JoinTeamView';
import { Link } from '@/i18n/navigation';
import { createAdminClient, createServerClient } from '@numoria/database/server';
import type { Tables } from '@numoria/database/types';
import { BRAND_NAME } from '@numoria/i18n';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type Profile = Tables<'profiles'>;
type Team = Tables<'teams'>;

const INVITE_CODE_REGEX = /^[A-Z0-9]{8}$/;

/**
 * Landing pública de un invite_code de team.
 *
 * 5 escenarios según estado del usuario:
 * 1. Anonymous → CTA login/register
 * 2. Student onboarded → botón "Unirme"
 * 3. Student no-onboarded → CTA a /onboarding/student?invite_code=...
 * 4. Parent/Teacher onboarded → error wrongRole
 * 5. Ya miembro de este team → success state
 */
export default async function JoinTeamPage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code: rawCode } = await params;
  setRequestLocale(locale);

  // Normalizar y validar formato del código
  const code = rawCode.trim().toUpperCase();
  if (!INVITE_CODE_REGEX.test(code)) {
    return <JoinError titleKey="errorInvalidCode" />;
  }

  // Lookup del team — usamos admin client porque queremos resolver el código
  // incluso para usuarios anónimos (RLS authenticated_view_teams requiere
  // estar autenticado). El admin client bypassa RLS y solo expone
  // datos públicos (name, school_id, division, invite_enabled).
  const admin = createAdminClient();
  const { data: teamRow } = await admin
    .from('teams')
    .select('id, name, school_id, division, invite_enabled, max_members')
    .eq('invite_code', code)
    .single();

  const team = teamRow as Pick<
    Team,
    'id' | 'name' | 'school_id' | 'division' | 'invite_enabled' | 'max_members'
  > | null;

  if (!team || !team.invite_enabled) {
    return <JoinError titleKey="errorInvalidCode" />;
  }

  const { data: schoolRow } = await admin
    .from('schools')
    .select('name')
    .eq('id', team.school_id)
    .single();
  const schoolName = (schoolRow as { name: string } | null)?.name ?? '';

  // Check del usuario actual
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <JoinTeamView
        inviteCode={code}
        teamName={team.name}
        schoolName={schoolName}
        division={team.division}
        mode="anonymous"
      />
    );
  }

  const rpcResult = await supabase.rpc('get_my_profile');
  const profile = rpcResult.data as Profile | null;

  if (!profile) {
    return <JoinError titleKey="errorGeneric" />;
  }

  // Ya miembro del team — mostrar success
  const { data: membership } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('team_id', team.id)
    .eq('student_id', user.id)
    .maybeSingle();
  if (membership) {
    return (
      <JoinTeamView
        inviteCode={code}
        teamName={team.name}
        schoolName={schoolName}
        division={team.division}
        mode="already-member"
      />
    );
  }

  // Role check
  if (profile.role !== 'student') {
    return (
      <JoinTeamView
        inviteCode={code}
        teamName={team.name}
        schoolName={schoolName}
        division={team.division}
        mode="wrong-role"
        userRole={profile.role as 'parent' | 'teacher' | 'admin'}
      />
    );
  }

  // Student — chequear onboarding
  if (!profile.onboarding_completed) {
    return (
      <JoinTeamView
        inviteCode={code}
        teamName={team.name}
        schoolName={schoolName}
        division={team.division}
        mode="student-onboarding"
      />
    );
  }

  // Student onboarded — listo para unirse
  return (
    <JoinTeamView
      inviteCode={code}
      teamName={team.name}
      schoolName={schoolName}
      division={team.division}
      mode="student-ready"
    />
  );
}

/**
 * Componente de error para casos donde el código es inválido o hay un fallo
 * que no requiere el flow completo de JoinTeamView.
 */
async function JoinError({ titleKey }: { titleKey: 'errorInvalidCode' | 'errorGeneric' }) {
  const t = await getTranslations('teams.join');
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="rounded-full bg-numoria-red/10 p-4 text-4xl">⚠️</div>
      <h1 className="font-display text-xl font-bold text-numoria-ink">{t(titleKey)}</h1>
      <Link href="/" className="text-sm font-bold text-numoria-blue hover:underline">
        ← {BRAND_NAME}
      </Link>
    </div>
  );
}
