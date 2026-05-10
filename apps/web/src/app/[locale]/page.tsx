import { Link } from '@/i18n/navigation';
import { Button, NumaAvatar } from '@numoria/ui';
import { getTranslations, setRequestLocale } from 'next-intl/server';

/**
 * Landing page placeholder de Chunk 1.5.
 *
 * Demuestra que están funcionando:
 * - Routing localizado (/es, /en)
 * - Mensajes de @numoria/i18n
 * - Componentes de @numoria/ui (NumaAvatar + Button)
 * - Tokens de @numoria/config (font-display, colores Numoria)
 *
 * La landing definitiva con secciones HowItWorks/Schools/etc llega en Chunk 1.8.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tHero = await getTranslations('landing.hero');
  const tBadge = await getTranslations('landing');
  const tBrand = await getTranslations('brand');

  return (
    <main className="min-h-dvh">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-16 text-center sm:py-24">
        {/* Free badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-numoria-yellow/20 px-4 py-1.5 text-sm font-medium text-numoria-ink">
          <span aria-hidden="true">🎉</span>
          <span>{tBadge('freeBadge')}</span>
        </div>

        {/* Mascot */}
        <NumaAvatar pose="wave" size="2xl" animateIn />

        {/* Hero copy */}
        <h1 className="font-display text-4xl font-bold tracking-tight text-numoria-ink sm:text-5xl md:text-6xl">
          {tHero('title')}
        </h1>
        <p className="max-w-prose text-lg text-numoria-mid sm:text-xl">{tHero('subtitle')}</p>

        {/* CTAs */}
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Button variant="primary" size="lg" asChild>
            <Link href="/register">{tHero('ctaPrimary')}</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/teacher">{tHero('ctaSecondary')}</Link>
          </Button>
        </div>

        {/* Brand line — sirve también como ancla visual del wiring */}
        <p className="mt-12 text-sm text-numoria-mid">
          <span className="font-display font-semibold">{tBrand('name')}</span>
          <span className="mx-2">·</span>
          <span>{tBrand('tagline')}</span>
        </p>
      </div>
    </main>
  );
}
