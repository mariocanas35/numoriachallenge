import { Link } from '@/i18n/navigation';
import { Button, NumaAvatar } from '@numoria/ui';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function CheckEmailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const { locale } = await params;
  const { email } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('auth');

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <NumaAvatar pose="think" size="2xl" animateIn />

      <h1 className="font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
        {t('checkEmailTitle')}
      </h1>

      {email && (
        <p className="rounded-lg bg-numoria-cloud px-4 py-2 text-sm font-medium text-numoria-ink">
          📧 {email}
        </p>
      )}

      <p className="max-w-sm text-numoria-mid">{t('checkEmailDescription')}</p>

      <p className="text-xs text-numoria-mid">{t('checkSpam')}</p>

      <Button variant="ghost" size="md" asChild>
        <Link href="/login">{t('tryAgain')}</Link>
      </Button>
    </div>
  );
}
