import { SiteAnalytics } from '@/components/analytics/SiteAnalytics';
import { routing } from '@/i18n/routing';
import { BRAND_NAME } from '@numoria/i18n';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { Fraunces, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import { notFound } from 'next/navigation';
import '../../styles/globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    metadataBase: new URL('https://www.numoriachallenge.com'),
    title: t('title'),
    description: t('description'),
    applicationName: BRAND_NAME,
    authors: [{ name: 'Numoria Challenge' }],
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
    icons: {
      icon: '/icon.svg',
    },
    openGraph: {
      type: 'website',
      title: t('title'),
      description: t('description'),
      siteName: BRAND_NAME,
      locale,
      images: ['/og-image.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/og-image.png'],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validar locale activo
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  // Habilitar render estático para este locale
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${jakarta.variable} ${jetbrains.variable}`}
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <SiteAnalytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
