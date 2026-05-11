import { Link } from '@/i18n/navigation';
import { Button, NumaAvatar } from '@numoria/ui';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function ParentDonePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ count?: string }>;
}) {
  const { locale } = await params;
  const { count: countParam } = await searchParams;
  setRequestLocale(locale);

  const count = Number(countParam ?? '1') || 1;
  const t = await getTranslations('onboarding.parentDone');

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <NumaAvatar pose="celebrate" size="2xl" animateIn />

      <h1 className="font-display text-3xl font-bold text-numoria-ink sm:text-4xl">
        🎉 {t('title')}
      </h1>

      <p className="max-w-md text-numoria-mid">{t('subtitle', { count })}</p>

      <p className="rounded-lg bg-numoria-yellow/30 px-4 py-2 text-xs text-numoria-ink">
        💡 {t('checkInbox')}
      </p>

      <Button variant="primary" size="lg" asChild>
        <Link href="/">{t('goToDashboard')}</Link>
      </Button>
    </div>
  );
}
