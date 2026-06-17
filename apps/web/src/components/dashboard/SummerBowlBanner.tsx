import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

/**
 * Banner colorido que enlaza a la página informativa del Summer Bowl
 * (/summer-bowl). Se usa tanto en el dashboard del estudiante como en
 * el del profesor. Server Component — usa getTranslations.
 */
export async function SummerBowlBanner() {
  const t = await getTranslations('dashboard.summerBowl');

  return (
    <Link
      href="/contests/summer-bowl"
      className="group flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-numoria-orange to-numoria-coral p-5 text-white shadow-card transition hover:brightness-105 sm:p-6"
    >
      <div className="min-w-0">
        <p className="font-display text-lg font-bold sm:text-xl">{t('title')}</p>
        <p className="mt-0.5 text-sm text-white/90">{t('subtitle')}</p>
      </div>
      <span
        className="shrink-0 text-4xl transition-transform group-hover:scale-110 sm:text-5xl"
        aria-hidden="true"
      >
        🏆
      </span>
    </Link>
  );
}
