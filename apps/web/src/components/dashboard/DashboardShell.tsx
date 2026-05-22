import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { Link } from '@/i18n/navigation';
import { NumoriaLogo } from '@numoria/ui';
import { getTranslations } from 'next-intl/server';

interface DashboardShellProps {
  children: React.ReactNode;
  /** Si true, usa max-w-6xl para layouts amplios (4-col grids). Default: max-w-3xl. */
  wide?: boolean;
  /** Slot opcional para acciones extra en el topbar (ej. botón Configuración del teacher). */
  topbarRight?: React.ReactNode;
}

/**
 * Shell visual común para los 3 dashboards (student/parent/teacher).
 * Header con NumoriaLogo + LocaleSwitcher + Logout + slot opcional.
 */
export async function DashboardShell({ children, wide, topbarRight }: DashboardShellProps) {
  const t = await getTranslations('auth');
  return (
    <div className="relative flex min-h-dvh flex-col bg-numoria-crema">
      <header className="relative z-10 flex items-center justify-between px-6 py-4 sm:px-10">
        <Link href="/" className="text-xl transition hover:opacity-80">
          <NumoriaLogo variant="horizontal" />
        </Link>
        <div className="flex items-center gap-3">
          {topbarRight}
          <LocaleSwitcher />
          <a
            href="/auth/logout"
            className="text-sm text-numoria-niebla underline-offset-2 hover:text-numoria-coral hover:underline"
          >
            {t('logout')}
          </a>
        </div>
      </header>

      <main
        className={`relative z-10 mx-auto w-full flex-1 px-6 py-8 sm:px-10 sm:py-12 ${
          wide ? 'max-w-6xl' : 'max-w-3xl'
        }`}
      >
        {children}
      </main>
    </div>
  );
}
