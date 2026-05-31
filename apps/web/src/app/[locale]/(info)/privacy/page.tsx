import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.privacy');
  const tp = await getTranslations('pages');
  const points = t.raw('points') as { h: string; t: string }[];

  return (
    <div className="flex flex-col gap-6 text-numoria-ink">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
          {t('title')}
        </h1>
        <p className="text-xs text-numoria-niebla">{t('updated')}</p>
      </header>
      <p className="text-base leading-relaxed text-numoria-mid">{t('intro')}</p>

      <div className="flex flex-col gap-5">
        {points.map((point) => (
          <section key={point.h} className="flex flex-col gap-1.5">
            <h2 className="font-display text-lg font-bold text-numoria-ink">{point.h}</h2>
            <p className="text-base leading-relaxed text-numoria-mid">{point.t}</p>
          </section>
        ))}
      </div>

      <p className="rounded-xl border-2 border-numoria-blue/20 bg-numoria-blue/5 p-4 text-sm leading-relaxed text-numoria-ink">
        {t('note')}
      </p>

      <Link
        href="/"
        className="mt-2 text-sm font-semibold text-numoria-blue underline-offset-2 hover:underline"
      >
        {tp('backToHome')}
      </Link>
    </div>
  );
}
