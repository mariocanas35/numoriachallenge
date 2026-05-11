import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { Link } from '@/i18n/navigation';
import { BRAND_NAME } from '@numoria/i18n';
import { getTranslations } from 'next-intl/server';

/**
 * Layout para páginas de contests.
 * Mismo patrón visual que teams/onboarding: gradient + header + main centrado.
 */
export default async function ContestsLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('auth');
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-numoria-cloud via-white to-numoria-cloud">
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <Link
          href="/"
          className="font-display text-xl font-bold text-numoria-ink hover:text-numoria-blue"
        >
          {BRAND_NAME}
        </Link>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <a
            href="/auth/logout"
            className="text-sm text-numoria-mid underline-offset-2 hover:text-numoria-red hover:underline"
          >
            {t('logout')}
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8 sm:px-10 sm:py-12">
        {children}
      </main>
    </div>
  );
}
