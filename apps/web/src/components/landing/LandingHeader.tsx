import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { Link } from '@/i18n/navigation';
import { NumoriaLogo } from '@numoria/ui';
import { getTranslations } from 'next-intl/server';

/**
 * Header pequeño para la landing page (solo se ve cuando el user es anónimo).
 * - NumoriaLogo a la izquierda (wordmark + tagline)
 * - LocaleSwitcher + link a Iniciar sesión a la derecha
 */
export async function LandingHeader() {
  const t = await getTranslations('auth');

  return (
    <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-4 sm:px-10">
      <Link href="/" className="text-xl transition hover:opacity-80">
        <NumoriaLogo variant="horizontal" />
      </Link>
      <div className="flex items-center gap-4">
        <LocaleSwitcher />
        <Link
          href="/login"
          className="text-sm font-semibold text-numoria-grafito underline-offset-2 hover:text-numoria-orange hover:underline"
        >
          {t('login')}
        </Link>
      </div>
    </header>
  );
}
