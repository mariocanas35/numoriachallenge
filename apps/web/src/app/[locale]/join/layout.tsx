import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { Link } from '@/i18n/navigation';
import { NumoriaLogo } from '@numoria/ui';

/**
 * Layout para la landing de invitación a un team (`/join/[code]`).
 * Público: visible para usuarios anónimos y autenticados.
 */
export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-numoria-crema via-white to-numoria-crema">
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <Link href="/" className="text-xl transition hover:opacity-80">
          <NumoriaLogo variant="horizontal" />
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
