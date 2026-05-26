import { CreateTeamForm } from '@/components/teams/CreateTeamForm';
import { createServerClient } from '@numoria/database/server';
import type { Tables } from '@numoria/database/types';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

type Profile = Tables<'profiles'>;

/**
 * Página para crear un team nuevo.
 *
 * Requiere: user autenticado + role=teacher + onboarding_completed + tiene school_id.
 * El middleware ya garantiza onboarding_completed; aquí validamos role + school.
 */
export default async function NewTeamPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  console.log('[/teams/new] START locale:', locale);

  const supabase = await createServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error('[/teams/new] auth.getUser error:', userError);
  }

  if (!user) {
    console.log('[/teams/new] NO USER → redirect login');
    redirect(`/${locale}/login`);
  }
  console.log('[/teams/new] user.id:', user.id);

  const rpcResult = await supabase.rpc('get_my_profile');
  if (rpcResult.error) {
    console.error('[/teams/new] get_my_profile RPC error:', rpcResult.error);
  }
  const profile = rpcResult.data as Profile | null;
  console.log(
    '[/teams/new] profile:',
    profile
      ? JSON.stringify({
          id: profile.id,
          role: profile.role,
          school_id: profile.school_id,
          onboarding_completed: profile.onboarding_completed,
        })
      : 'null',
  );

  if (!profile) {
    console.log('[/teams/new] NO PROFILE → redirect auth-error');
    redirect(`/${locale}/auth-error`);
  }
  if (profile.role !== 'teacher') {
    console.log('[/teams/new] role !== teacher → redirect home');
    redirect(`/${locale}/`);
  }
  if (!profile.school_id) {
    console.log('[/teams/new] no school_id → redirect onboarding/teacher');
    // Teacher sin school — debería volver al onboarding (aunque onboarding_completed=true,
    // por defensa profunda)
    redirect(`/${locale}/onboarding/teacher`);
  }

  console.log('[/teams/new] OK → render form');
  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-8 shadow-card sm:p-10">
      <CreateTeamForm />
    </div>
  );
}
