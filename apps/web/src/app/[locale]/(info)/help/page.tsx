import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function HelpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.help');
  const tp = await getTranslations('pages');
  const faqs = t.raw('faqs') as { q: string; a: string }[];

  return (
    <div className="flex flex-col gap-6 text-numoria-ink">
      <h1 className="font-display text-2xl font-bold text-numoria-ink sm:text-3xl">{t('title')}</h1>
      <p className="text-base leading-relaxed text-numoria-mid">{t('intro')}</p>

      <dl className="flex flex-col gap-5">
        {faqs.map((faq) => (
          <div key={faq.q} className="flex flex-col gap-1.5">
            <dt className="font-display text-base font-bold text-numoria-ink">{faq.q}</dt>
            <dd className="text-base leading-relaxed text-numoria-mid">{faq.a}</dd>
          </div>
        ))}
      </dl>

      <p className="rounded-xl border-2 border-numoria-blue/20 bg-numoria-blue/5 p-4 text-sm leading-relaxed text-numoria-ink">
        {t('contactNote')}
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
