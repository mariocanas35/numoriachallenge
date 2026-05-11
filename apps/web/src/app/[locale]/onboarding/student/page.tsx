import { StudentOnboardingForm } from '@/components/onboarding/StudentOnboardingForm';
import { createServerClient } from '@numoria/database/server';
import type { Tables } from '@numoria/database/types';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

type Profile = Tables<'profiles'>;

export default async function StudentOnboardingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ invite_code?: string }>;
}) {
  const { locale } = await params;
  const { invite_code: rawInviteCode } = await searchParams;
  setRequestLocale(locale);

  // Verificar que el user es realmente student (defensa en profundidad)
  const supabase = await createServerClient();
  const rpcResult = await supabase.rpc('get_my_profile');
  const profile = rpcResult.data as Profile | null;

  if (!profile) {
    redirect(`/${locale}/auth-error`);
  }
  if (profile.role !== 'student') {
    // Si por alguna razón llegó aquí sin ser student, redirigir al router
    redirect(`/${locale}/onboarding`);
  }
  if (profile.onboarding_completed) {
    redirect(`/${locale}`);
  }

  // country_code pre-existente del trigger (raw_user_meta_data) o fallback
  const defaultCountry = profile.country_code ?? 'HN';

  // Sanitizar invite_code de URL (acepta solo formato A-Z0-9 de 8 chars)
  const invite = (rawInviteCode ?? '').trim().toUpperCase();
  const defaultInviteCode = /^[A-Z0-9]{8}$/.test(invite) ? invite : '';

  return (
    <StudentOnboardingForm defaultCountry={defaultCountry} defaultInviteCode={defaultInviteCode} />
  );
}
