import { Link } from '@/i18n/navigation';
import { Button, NumaAvatar } from '@numoria/ui';
import { getTranslations } from 'next-intl/server';

export async function Hero() {
  const tHero = await getTranslations('landing.hero');
  const tBadge = await getTranslations('landing');

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-numoria-cloud via-white to-numoria-cloud"
      aria-labelledby="hero-heading"
    >
      {/* Decoración: blobs de color suaves al fondo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 size-72 rounded-full bg-numoria-blue/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 size-80 rounded-full bg-numoria-orange/10 blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-16 text-center sm:py-24">
        {/* Free badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-numoria-yellow/30 px-4 py-1.5 text-sm font-medium text-numoria-ink ring-1 ring-numoria-yellow/40">
          <span aria-hidden="true">🎉</span>
          <span>{tBadge('freeBadge')}</span>
        </div>

        {/* Mascota */}
        <NumaAvatar pose="wave" size="2xl" animateIn />

        {/* Hero copy */}
        <h1
          id="hero-heading"
          className="font-display text-4xl font-bold tracking-tight text-numoria-ink sm:text-5xl md:text-6xl"
        >
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
      </div>
    </section>
  );
}
