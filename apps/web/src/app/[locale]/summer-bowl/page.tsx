import { Footer } from '@/components/landing/Footer';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { createServerClient } from '@numoria/database/server';
import { NumaAvatar } from '@numoria/ui';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

/**
 * /summer-bowl — Landing pública (sin auth) para promoción del Summer Bowl 2026.
 *
 * Copy aprobado por founder 2026-05-25:
 *   - Título: "Numoria Summer Bowl 🏆"
 *   - Tagline: "Entra al Bowl. Sal campeón." / "Enter the Bowl. Leave a champion."
 *   - Specs: "7 problemas · 100% online · 100% gratis"
 *   - Dos formas de competir:
 *       🎓 Como maestro — crea una clase con tu cuenta institucional
 *       ✏️ Como estudiante — regístrate por tu cuenta y compite individual
 *
 * Audiencia: estudiantes + profesores + padres que llegan desde redes/WhatsApp.
 * Fuente de leads: source='summer_bowl_landing' en email_captures.
 */

interface SummerBowl {
  id: string;
  bowl_number: number;
  starts_at: string;
  ends_at: string;
  theme_es: string | null;
  theme_en: string | null;
}

export default async function SummerBowlLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contests.summerBowlLanding');
  const format = await getFormatter();

  const supabase = await createServerClient();
  const { data: bowlsRows } = await supabase
    .from('summer_bowls' as never)
    .select('id, bowl_number, starts_at, ends_at, theme_es, theme_en')
    .order('bowl_number');
  const bowls = ((bowlsRows as SummerBowl[] | null) ?? []) as SummerBowl[];

  return (
    <>
      <LandingHeader />
      <main className="min-h-dvh bg-gradient-to-b from-numoria-cream via-white to-numoria-cream">
        {/* === HERO === */}
        <section className="relative px-6 pt-28 pb-12 sm:px-10 sm:pt-32">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-3xl bg-gradient-to-br from-numoria-orange via-numoria-coral to-numoria-indigo p-8 text-numoria-ink shadow-xl sm:p-14">
              <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
                <div className="shrink-0">
                  <NumaAvatar pose="wave" size="lg" animateIn />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-numoria-ink/80">
                    {t('edition')}
                  </p>
                  <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-numoria-ink sm:text-5xl md:text-6xl">
                    {t('title')} {t('trophy')}
                  </h1>
                  <p className="mt-4 font-display text-xl font-semibold leading-snug text-numoria-ink sm:text-2xl md:text-3xl">
                    {t('tagline')}
                  </p>
                  <p className="mt-5 text-base font-semibold text-numoria-ink sm:text-lg">
                    {t('specs')}
                  </p>
                  <p className="mt-5 inline-block rounded-lg bg-white/95 px-4 py-2 text-xs font-semibold text-numoria-ink shadow-sm sm:text-sm">
                    {t('prize')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* === DOS FORMAS DE COMPETIR === */}
        <section className="px-6 pb-4 sm:px-10">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-6 text-center font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
              {t('twoWaysHeader')}
            </h2>
            <div className="mx-auto max-w-md">
              <WayCard
                icon={t('studentWayIcon')}
                title={t('signupTitle')}
                body={t('signupBody')}
                ctaLabel={t('studentWayCta')}
                href="/register"
                accent="orange"
              />
            </div>
          </div>
        </section>

        {/* === LOS 3 BOWLS === */}
        {bowls.length > 0 && (
          <section className="px-6 py-12 sm:px-10">
            <div className="mx-auto max-w-5xl">
              <h2 className="mb-3 text-center font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
                📅 {t('bowlsHeader')}
              </h2>
              <p className="mx-auto mb-10 max-w-2xl text-center text-sm text-numoria-mid sm:text-base">
                {t('bowlsSubHeader')}
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {bowls.map((bowl) => (
                  <BowlCard
                    key={bowl.id}
                    bowl={bowl}
                    locale={locale}
                    formatter={format}
                    statusLabel={t('statusUpcoming')}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* === ¿CÓMO FUNCIONA? === */}
        <section className="bg-white px-6 py-16 sm:px-10">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
              {t('howItWorksHeader')}
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <Step number={1} title={t('step1Title')} description={t('step1Body')} pose="wave" />
              <Step number={2} title={t('step2Title')} description={t('step2Body')} pose="think" />
              <Step
                number={3}
                title={t('step3Title')}
                description={t('step3Body')}
                pose="celebrate"
              />
            </div>
          </div>
        </section>

        {/* === FAQ === */}
        <section className="bg-white px-6 py-16 sm:px-10">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-center font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
              {t('faqHeader')}
            </h2>
            <div className="space-y-4">
              <FaqItem question={t('faq1Q')} answer={t('faq1A')} />
              <FaqItem question={t('faq2Q')} answer={t('faq2A')} />
              <FaqItem question={t('faq3Q')} answer={t('faq3A')} />
              <FaqItem question={t('faq4Q')} answer={t('faq4A')} />
              <FaqItem question={t('faq5Q')} answer={t('faq5A')} />
              <FaqItem question={t('faq6Q')} answer={t('faq6A')} />
            </div>
          </div>
        </section>

        {/* === CTA FINAL === */}
        <section className="px-6 pt-8 pb-20 sm:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <NumaAvatar pose="celebrate" size="xl" />
            <h2 className="mt-4 font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
              {t('finalCtaHeader')}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-numoria-mid sm:text-base">
              {t('finalCtaBodyShort')}
            </p>
            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-numoria-orange px-6 py-3 text-base font-bold text-white shadow-sm transition hover:bg-numoria-orange/90"
              >
                🚀 {t('studentWayCta')}
              </Link>
            </div>
            <p className="mt-4 text-xs text-numoria-mid">{t('finalCtaTipInstitutional')}</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

// ============================================================
// Sub-components
// ============================================================

function WayCard({
  icon,
  title,
  body,
  ctaLabel,
  href,
  external,
  accent,
}: {
  icon: string;
  title: string;
  body: string;
  ctaLabel: string;
  href: string;
  external?: boolean;
  accent: 'indigo' | 'orange';
}) {
  const accentClasses =
    accent === 'orange' ? 'border-numoria-orange/40 bg-white' : 'border-numoria-indigo/40 bg-white';
  const ctaClasses =
    accent === 'orange'
      ? 'bg-numoria-orange hover:bg-numoria-orange/90'
      : 'bg-numoria-indigo hover:bg-numoria-indigo/90';

  return (
    <div
      className={`flex flex-col items-center gap-4 rounded-2xl border-2 p-7 text-center shadow-sm transition hover:shadow-md ${accentClasses}`}
    >
      <span className="text-5xl" aria-hidden>
        {icon}
      </span>
      <h3 className="font-display text-xl font-bold text-numoria-ink">{title}</h3>
      <p className="text-sm text-numoria-mid sm:text-base">{body}</p>
      {external ? (
        <a
          href={href}
          className={`mt-1 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition ${ctaClasses}`}
        >
          {ctaLabel}
        </a>
      ) : (
        <Link
          href={href}
          className={`mt-1 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition ${ctaClasses}`}
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}

function BowlCard({
  bowl,
  locale,
  formatter,
  statusLabel,
}: {
  bowl: SummerBowl;
  locale: string;
  formatter: Awaited<ReturnType<typeof getFormatter>>;
  statusLabel: string;
}) {
  const dateRange = `${formatter.dateTime(new Date(bowl.starts_at), {
    day: 'numeric',
    month: 'short',
  })} – ${formatter.dateTime(new Date(bowl.ends_at), {
    day: 'numeric',
    month: 'short',
  })}`;

  const theme = locale === 'en' ? bowl.theme_en : bowl.theme_es;

  return (
    <div className="flex flex-col gap-3 rounded-xl border-2 border-numoria-orange/30 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <span className="font-display text-3xl font-bold text-numoria-orange">
          #{bowl.bowl_number}
        </span>
        <span className="rounded-full bg-numoria-indigo/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-numoria-indigo">
          🔵 {statusLabel}
        </span>
      </div>
      <h3 className="font-display text-lg font-bold text-numoria-ink">
        Summer Bowl #{bowl.bowl_number}
      </h3>
      <p className="text-sm font-semibold text-numoria-mid">📅 {dateRange}</p>
      {theme && <p className="text-xs italic text-numoria-mid">{theme}</p>}
    </div>
  );
}

function Step({
  number,
  title,
  description,
  pose,
}: {
  number: number;
  title: string;
  description: string;
  pose: 'wave' | 'think' | 'celebrate' | 'sad';
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="relative">
        <NumaAvatar pose={pose} size="xl" />
        <span className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-numoria-orange text-sm font-bold text-white shadow-md">
          {number}
        </span>
      </div>
      <h3 className="font-display text-lg font-bold text-numoria-ink">{title}</h3>
      <p className="max-w-xs text-sm text-numoria-mid">{description}</p>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-xl border-2 border-numoria-niebla/30 bg-white p-5 [&_summary::-webkit-details-marker]:hidden">
      <summary className="-m-5 flex cursor-pointer list-none items-start gap-3 rounded-xl p-5 transition hover:bg-numoria-cloud">
        <span
          className="mt-0.5 text-numoria-orange transition-transform group-open:rotate-90"
          aria-hidden
        >
          ▶
        </span>
        <h3 className="flex-1 font-display text-base font-bold text-numoria-ink sm:text-lg">
          {question}
        </h3>
      </summary>
      <p className="mt-4 pl-7 text-sm leading-relaxed text-numoria-mid sm:text-base">{answer}</p>
    </details>
  );
}
