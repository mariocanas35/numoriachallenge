import { RegisterForm } from '@/components/auth/RegisterForm';
import { Link } from '@/i18n/navigation';
import { NumaAvatar } from '@numoria/ui';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type Role = 'student' | 'parent' | 'teacher';

function isValidRole(value: string | undefined): value is Role {
  return value === 'student' || value === 'parent' || value === 'teacher';
}

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ role?: string; next?: string }>;
}) {
  const { locale } = await params;
  const { role: roleParam, next } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('auth');
  const defaultRole: Role = isValidRole(roleParam) ? roleParam : 'student';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <NumaAvatar pose="celebrate" size="lg" animateIn />
        <h1 className="font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
          {t('registerTitle')}
        </h1>
        <p className="text-sm text-numoria-mid">{t('registerSubtitle')}</p>
      </div>

      <RegisterForm defaultRole={defaultRole} next={next} />

      <p className="text-center text-sm text-numoria-mid">
        {t('hasAccount')}{' '}
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'}
          className="font-semibold text-numoria-blue hover:underline"
        >
          {t('login')}
        </Link>
      </p>
    </div>
  );
}
