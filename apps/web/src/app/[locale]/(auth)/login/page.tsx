import { LoginForm } from '@/components/auth/LoginForm';
import { Link } from '@/i18n/navigation';
import { NumaAvatar } from '@numoria/ui';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { locale } = await params;
  const { next } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('auth');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <NumaAvatar pose="wave" size="lg" animateIn />
        <h1 className="font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
          {t('loginTitle')}
        </h1>
        <p className="text-sm text-numoria-mid">{t('loginSubtitle')}</p>
      </div>

      <LoginForm next={next} />

      <p className="text-center text-sm text-numoria-mid">
        {t('noAccount')}{' '}
        <Link
          href={next ? `/register?next=${encodeURIComponent(next)}` : '/register'}
          className="font-semibold text-numoria-blue hover:underline"
        >
          {t('register')}
        </Link>
      </p>
    </div>
  );
}
