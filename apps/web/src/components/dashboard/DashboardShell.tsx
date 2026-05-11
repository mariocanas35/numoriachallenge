import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { Link } from '@/i18n/navigation';
import { NumoriaLogo } from '@numoria/ui';
import { getTranslations } from 'next-intl/server';

/**
 * Shell visual común para los 3 dashboards (student/parent/teacher).
 * Header con NumoriaLogo + LocaleSwitcher + Salir. Card-less, full-width content.
 */
export async function DashboardShell({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('auth');
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-numoria-crema via-white to-numoria-crema">
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <Link href="/" className="text-xl transition hover:opacity-80">
          <NumoriaLogo variant="horizontal" />
        </Link>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <a
            href="/auth/logout"
            className="text-sm text-numoria-niebla underline-offset-2 hover:text-numoria-coral hover:underline"
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
