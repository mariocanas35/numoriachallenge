import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { Link } from '@/i18n/navigation';
import { NumoriaLogo } from '@numoria/ui';
import { getTranslations } from 'next-intl/server';

/**
 * Layout para páginas de teams (lista, crear, ver, gestionar).
 * Mismo patrón visual que onboarding: header minimal + main centrado.
 *
 * NOTA: el wrapper card (max-w-2xl + p-8 + shadow) se aplica SOLO a páginas
 * de form-style como /teams/new. La página /teams (lista) usa full width.
 * Para diferenciar, cada page decide su propio container interno.
 */
export default async function TeamsLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('auth');
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-numoria-crema via-white to-numoria-crema">
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <Link href="/" className="text-xl transition hover:opacity-80">
          <NumoriaLogo variant="horizontal" />
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-bold text-numoria-mid transition hover:text-numoria-orange"
          >
            🏠 <span className="hidden sm:inline">{t('home')}</span>
          </Link>
          <LocaleSwitcher />
          <a
            href="/auth/logout"
            className="text-sm text-numoria-niebla underline-offset-2 hover:text-numoria-coral hover:underline"
          >
            {t('logout')}
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8 sm:px-10 sm:py-12">
        {children}
      </main>
    </div>
  );
}
