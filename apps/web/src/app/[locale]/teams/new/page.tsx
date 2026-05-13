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

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const rpcResult = await supabase.rpc('get_my_profile');
  const profile = rpcResult.data as Profile | null;

  if (!profile) {
    redirect(`/${locale}/auth-error`);
  }
  if (profile.role !== 'teacher') {
    redirect(`/${locale}/`);
  }
  if (!profile.school_id) {
    // Teacher sin school — debería volver al onboarding (aunque onboarding_completed=true,
    // por defensa profunda)
    redirect(`/${locale}/onboarding/teacher`);
  }

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-8 shadow-card sm:p-10">
      <CreateTeamForm />
    </div>
  );
}
