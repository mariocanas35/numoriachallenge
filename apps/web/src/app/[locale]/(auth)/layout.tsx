import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { Link } from '@/i18n/navigation';
import { BRAND_NAME } from '@numoria/i18n';

/**
 * Layout compartido para páginas de autenticación
 * (login, register, check-email, etc).
 *
 * - Header minimal con logo + locale switcher
 * - Centra el contenido en una card
 * - Background con tinte sutil de marca
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-numoria-cloud via-white to-numoria-cloud">
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <Link
          href="/"
          className="font-display text-xl font-bold text-numoria-ink hover:text-numoria-blue"
        >
          {BRAND_NAME}
        </Link>
        <LocaleSwitcher />
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card sm:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
