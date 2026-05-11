import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { Link } from '@/i18n/navigation';
import { BRAND_NAME } from '@numoria/i18n';

/**
 * Layout para páginas de teams (crear, ver, gestionar).
 * Mismo patrón visual que onboarding: header minimal + card centrada.
 */
export default function TeamsLayout({ children }: { children: React.ReactNode }) {
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
            Salir
          </a>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-6 py-8">
        <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-card sm:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
