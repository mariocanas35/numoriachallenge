import { RoleChoiceForm } from '@/components/onboarding/RoleChoiceForm';
import { NumaAvatar } from '@numoria/ui';
import { getTranslations, setRequestLocale } from 'next-intl/server';

/**
 * /onboarding/role — el usuario elige su rol.
 *
 * El router de onboarding manda aquí a los sign-ups con Google (que entran
 * como 'student' por defecto) para que confirmen su rol real antes de seguir.
 */
export default async function OnboardingRolePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('auth');

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <NumaAvatar pose="wave" size="xl" animateIn />
      <h1 className="font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
        {t('selectRole')}
      </h1>
      <div className="w-full max-w-md">
        <RoleChoiceForm />
      </div>
    </div>
  );
}
