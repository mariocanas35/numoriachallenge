import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { Footer } from '@/components/landing/Footer';
import { Link } from '@/i18n/navigation';
import { NumoriaLogo } from '@numoria/ui';
import { setRequestLocale } from 'next-intl/server';

/**
 * Layout compartido para páginas informativas públicas
 * (about, help, privacy, terms, contact).
 *
 * - Header minimal con NumoriaLogo + LocaleSwitcher
 * - Contenido en una card centrada (max-w-3xl)
 * - Footer al pie (mismos enlaces que la landing)
 * - Público: accesible para anónimos y autenticados
 */
export default async function InfoLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-numoria-crema via-white to-numoria-crema">
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <Link href="/" className="text-xl transition hover:opacity-80">
          <NumoriaLogo variant="horizontal" />
        </Link>
        <LocaleSwitcher />
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 sm:py-14">
        <article className="rounded-2xl bg-white p-8 shadow-card sm:p-10">{children}</article>
      </main>

      <Footer />
    </div>
  );
}
