import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.about');
  const tp = await getTranslations('pages');
  const forWho = t.raw('forWho') as string[];

  return (
    <div className="flex flex-col gap-6 text-numoria-ink">
      <h1 className="font-display text-2xl font-bold text-numoria-ink sm:text-3xl">{t('title')}</h1>
      <p className="text-base leading-relaxed text-numoria-mid">{t('intro')}</p>

      <section className="flex flex-col gap-2">
        <h2 className="font-display text-xl font-bold text-numoria-ink">{t('missionTitle')}</h2>
        <p className="text-base leading-relaxed text-numoria-mid">{t('mission')}</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold text-numoria-ink">{t('forWhoTitle')}</h2>
        <ul className="flex flex-col gap-2">
          {forWho.map((item) => (
            <li key={item} className="flex gap-2 text-base leading-relaxed text-numoria-mid">
              <span aria-hidden className="text-numoria-blue">
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <Link
        href="/"
        className="mt-2 text-sm font-semibold text-numoria-blue underline-offset-2 hover:underline"
      >
        {tp('backToHome')}
      </Link>
    </div>
  );
}
