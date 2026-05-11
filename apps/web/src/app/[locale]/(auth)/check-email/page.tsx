import { VerifyCodeForm } from '@/components/auth/VerifyCodeForm';
import { Link } from '@/i18n/navigation';
import { NumaAvatar } from '@numoria/ui';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function CheckEmailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ email?: string; next?: string }>;
}) {
  const { locale } = await params;
  const { email, next } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('auth');
  const tVerify = await getTranslations('auth.verifyCode');

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <NumaAvatar pose="think" size="xl" animateIn />

      <div>
        <h1 className="font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
          {tVerify('title')}
        </h1>
        {email && (
          <p className="mt-3 inline-block rounded-lg bg-numoria-cloud px-4 py-2 text-sm font-medium text-numoria-ink">
            📧 {email}
          </p>
        )}
        <p className="mt-3 max-w-sm text-sm text-numoria-mid">{tVerify('description')}</p>
      </div>

      {email && (
        <div className="w-full">
          <VerifyCodeForm email={email} next={next} />
        </div>
      )}

      <p className="text-xs text-numoria-mid">{t('checkSpam')}</p>

      <Link
        href="/login"
        className="text-sm font-semibold text-numoria-blue underline-offset-2 hover:underline"
      >
        {t('tryAgain')}
      </Link>
    </div>
  );
}
