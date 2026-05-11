import { ParentOnboardingForm } from '@/components/onboarding/ParentOnboardingForm';
import { createServerClient } from '@numoria/database/server';
import type { Tables } from '@numoria/database/types';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

type Profile = Tables<'profiles'>;

export default async function ParentOnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createServerClient();
  const rpcResult = await supabase.rpc('get_my_profile');
  const profile = rpcResult.data as Profile | null;

  if (!profile) {
    redirect(`/${locale}/auth-error`);
  }
  if (profile.role !== 'parent') {
    redirect(`/${locale}/onboarding`);
  }
  if (profile.onboarding_completed) {
    redirect(`/${locale}`);
  }

  const defaultCountry = profile.country_code ?? 'HN';

  return <ParentOnboardingForm defaultCountry={defaultCountry} />;
}
