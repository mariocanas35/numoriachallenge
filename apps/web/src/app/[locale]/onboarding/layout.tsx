import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { Link } from '@/i18n/navigation';
import { NumoriaLogo } from '@numoria/ui';

/**
 * Layout para el flow de onboarding.
 *
 * - Header minimal con NumoriaLogo + LocaleSwitcher
 * - Logout link disponible (por si user quiere salir sin completar)
 * - Background con tinte crema (Manual de Marca §03)
 */
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
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
            Salir
          </a>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-card sm:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
