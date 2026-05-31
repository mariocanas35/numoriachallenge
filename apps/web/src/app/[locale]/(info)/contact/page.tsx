import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.contact');
  const tp = await getTranslations('pages');
  const email = t('email');

  return (
    <div className="flex flex-col gap-6 text-numoria-ink">
      <h1 className="font-display text-2xl font-bold text-numoria-ink sm:text-3xl">{t('title')}</h1>
      <p className="text-base leading-relaxed text-numoria-mid">{t('intro')}</p>

      <div className="flex flex-col gap-1.5 rounded-xl border-2 border-numoria-blue/20 bg-numoria-blue/5 p-5">
        <span className="text-sm font-semibold text-numoria-mid">{t('emailLabel')}</span>
        <a
          href={`mailto:${email}`}
          className="font-display text-lg font-bold text-numoria-blue underline-offset-2 hover:underline"
        >
          {email}
        </a>
      </div>

      <p className="text-sm text-numoria-mid">{t('responseTime')}</p>

      <Link
        href="/"
        className="mt-2 text-sm font-semibold text-numoria-blue underline-offset-2 hover:underline"
      >
        {tp('backToHome')}
      </Link>
    </div>
  );
}
