import { ContestCard, type ContestCardData } from '@/components/contests/ContestCard';
import { Link } from '@/i18n/navigation';
import { type ContestListContext, fetchContestsListData } from '@/lib/contests/list-data';
import { createServerClient } from '@numoria/database/server';
import type { Tables } from '@numoria/database/types';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

type Profile = Tables<'profiles'>;

/**
 * /contests/practices — doble función desde 2026-05-16:
 *
 *  1. SUMMER BOWL 2026 (jun-jul, GRATIS) — Edición Inaugural, banner destacado
 *     arriba de la página. Funnel de adquisición pre-ciclo pago agosto 2026.
 *     Datos: tabla summer_bowls (sb1-2026, sb2-2026, sb3-2026).
 *
 *  2. PRÁCTICA LIBRE — material de entrenamiento permanente, organizado en
 *     folders jerárquicos:
 *
 *       📁 Primaria
 *         └ Práctica #1 D-E, Práctica #2 D-E, Práctica #3 D-E
 *
 *       📁 Middle School
 *         ├ ✏️ Sin calculadora
 *         │  └ Práctica #1 D-M, #2, #3
 *         └ 🧮 Con calculadora
 *            └ Práctica #1 D-MC, #2, #3
 *
 *     Las prácticas NO requieren sesión MOEMS y NO cuentan para XP/leaderboards
 *     (decisión 2026-05-15, Opción B).
 */
export default async function PracticesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contests');
  const tp = await getTranslations('contests.practicesPage');

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const rpcResult = await supabase.rpc('get_my_profile');
  const profile = rpcResult.data as Profile | null;
  if (!profile) {
    redirect(`/${locale}/auth-error`);
  }

  const { practices, contestById } = await fetchContestsListData(supabase, user.id, profile);

  const byLevel = groupPracticesByLevel(practices, contestById);

  // Summer Bowl 2026 — 3 competencias gratis jun-jul. Tipado inline porque
  // types.gen.ts aún no incluye summer_bowls (regenerar al final del Chunk).
  const { data: summerBowlsRows } = await supabase
    .from('summer_bowls' as never)
    .select('id, bowl_number, starts_at, ends_at, theme_es, theme_en')
    .order('bowl_number');
  const summerBowls = ((summerBowlsRows as SummerBowl[] | null) ?? []) as SummerBowl[];

  return (
    <div className="flex flex-col gap-8">
      <header>
        <div className="flex items-center gap-2 text-sm text-numoria-mid">
          <Link href="/contests" className="hover:text-numoria-orange hover:underline">
            🏆 {t('listTitle')}
          </Link>
          <span>›</span>
          <span className="font-bold text-numoria-grafito">{tp('title')}</span>
        </div>
        <h1 className="mt-3 font-display text-2xl font-bold text-numoria-grafito sm:text-3xl">
          {tp('title')}
        </h1>
        <p className="mt-2 text-sm text-numoria-mid">{tp('description')}</p>
      </header>

      {summerBowls.length > 0 && <SummerBowlSection bowls={summerBowls} locale={locale} />}

      {practices.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-numoria-gray bg-white p-8 text-center text-sm text-numoria-mid">
          {tp('empty')}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* === 📁 Primaria === */}
          {byLevel.elementary.length > 0 && (
            <FolderSection
              title={tp('primaryFolder')}
              accent="orange"
              description={tp('primaryDescription')}
              cards={byLevel.elementary}
              contestById={contestById}
              countLabel={tp('practiceCount', { count: byLevel.elementary.length })}
            />
          )}

          {/* === 📁 Middle School (con sub-carpetas anidadas) === */}
          {(byLevel.middleNoCalc.length > 0 || byLevel.middleCalc.length > 0) && (
            <details className="group rounded-2xl border-2 border-numoria-indigo/20 bg-numoria-indigo/5 p-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="-m-5 flex cursor-pointer list-none items-center gap-3 rounded-2xl p-5 transition hover:bg-numoria-indigo/10">
                <span
                  className="text-numoria-indigo transition-transform group-open:rotate-90"
                  aria-hidden
                >
                  ▶
                </span>
                <div className="flex-1">
                  <h2 className="font-display text-xl font-bold text-numoria-grafito">
                    📁 {tp('middleFolder')}
                  </h2>
                  <p className="mt-1 text-sm text-numoria-mid">{tp('middleDescription')}</p>
                </div>
                <span className="text-xs font-bold uppercase tracking-wide text-numoria-mid">
                  {tp('practiceCount', {
                    count: byLevel.middleNoCalc.length + byLevel.middleCalc.length,
                  })}
                </span>
              </summary>

              <div className="mt-5 flex flex-col gap-3">
                {byLevel.middleNoCalc.length > 0 && (
                  <SubFolder
                    title={tp('subfolderNoCalc')}
                    icon="✏️"
                    accent="teal"
                    cards={byLevel.middleNoCalc}
                    contestById={contestById}
                    countLabel={tp('practiceCount', { count: byLevel.middleNoCalc.length })}
                    practiceLabel={tp}
                  />
                )}
                {byLevel.middleCalc.length > 0 && (
                  <SubFolder
                    title={tp('subfolderWithCalc')}
                    icon="🧮"
                    accent="dorado"
                    cards={byLevel.middleCalc}
                    contestById={contestById}
                    countLabel={tp('practiceCount', { count: byLevel.middleCalc.length })}
                    practiceLabel={tp}
                  />
                )}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Agrupación por nivel + variante
// ============================================================

interface ByLevelGroups {
  elementary: ContestCardData[];
  middleNoCalc: ContestCardData[];
  middleCalc: ContestCardData[];
}

function groupPracticesByLevel(
  cards: ContestCardData[],
  contestById: (id: string) => ContestListContext | undefined,
): ByLevelGroups {
  const elementary: ContestCardData[] = [];
  const middleNoCalc: ContestCardData[] = [];
  const middleCalc: ContestCardData[] = [];

  for (const card of cards) {
    const ctx = contestById(card.id);
    if (!ctx) continue;
    if (ctx.division === 'elementary') {
      elementary.push(card);
    } else if (ctx.division === 'middle' && !ctx.calculator_allowed) {
      middleNoCalc.push(card);
    } else if (ctx.division === 'middle' && ctx.calculator_allowed) {
      middleCalc.push(card);
    }
  }

  // Sort each group by contest_number ascending (Práctica #1, #2, #3)
  const sortByNumber = (a: ContestCardData, b: ContestCardData) => {
    const aNum = contestById(a.id)?.contest_number ?? 99;
    const bNum = contestById(b.id)?.contest_number ?? 99;
    return aNum - bNum;
  };

  return {
    elementary: [...elementary].sort(sortByNumber),
    middleNoCalc: [...middleNoCalc].sort(sortByNumber),
    middleCalc: [...middleCalc].sort(sortByNumber),
  };
}

// ============================================================
// FolderSection — folder de nivel superior (Primaria)
// ============================================================

type Accent = 'orange' | 'indigo' | 'teal' | 'dorado';

function FolderSection({
  title,
  accent,
  description,
  cards,
  contestById,
  countLabel,
}: {
  title: string;
  accent: Accent;
  description?: string;
  cards: ContestCardData[];
  contestById: (id: string) => ContestListContext | undefined;
  countLabel: string;
}) {
  const accentClasses = {
    orange: 'border-numoria-orange/20 bg-numoria-orange/5 hover:bg-numoria-orange/10',
    indigo: 'border-numoria-indigo/20 bg-numoria-indigo/5 hover:bg-numoria-indigo/10',
    teal: 'border-numoria-teal/20 bg-numoria-teal/5 hover:bg-numoria-teal/10',
    dorado: 'border-numoria-dorado/20 bg-numoria-dorado/5 hover:bg-numoria-dorado/10',
  }[accent];

  const chevronColor = {
    orange: 'text-numoria-orange',
    indigo: 'text-numoria-indigo',
    teal: 'text-numoria-teal',
    dorado: 'text-numoria-dorado',
  }[accent];

  return (
    <details
      className={`group rounded-2xl border-2 p-5 [&_summary::-webkit-details-marker]:hidden ${accentClasses}`}
    >
      <summary className="-m-5 flex cursor-pointer list-none items-center gap-3 rounded-2xl p-5">
        <span className={`transition-transform group-open:rotate-90 ${chevronColor}`} aria-hidden>
          ▶
        </span>
        <div className="flex-1">
          <h2 className="font-display text-xl font-bold text-numoria-grafito">📁 {title}</h2>
          {description && <p className="mt-1 text-sm text-numoria-mid">{description}</p>}
        </div>
        <span className="text-xs font-bold uppercase tracking-wide text-numoria-mid">
          {countLabel}
        </span>
      </summary>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {cards.map((card) => (
          <PracticeCardWithNumber key={card.id} card={card} contestById={contestById} />
        ))}
      </div>
    </details>
  );
}

// ============================================================
// SubFolder — folder anidado dentro de Middle School
// ============================================================

function SubFolder({
  title,
  icon,
  accent,
  cards,
  contestById,
  countLabel,
}: {
  title: string;
  icon: string;
  accent: Accent;
  cards: ContestCardData[];
  contestById: (id: string) => ContestListContext | undefined;
  countLabel: string;
  // practiceLabel param removed — PracticeCardWithNumber uses its own t() call
  practiceLabel?: unknown;
}) {
  const accentClasses = {
    orange: 'border-numoria-orange/30 hover:bg-numoria-orange/5',
    indigo: 'border-numoria-indigo/30 hover:bg-numoria-indigo/5',
    teal: 'border-numoria-teal/30 hover:bg-numoria-teal/5',
    dorado: 'border-numoria-dorado/30 hover:bg-numoria-dorado/5',
  }[accent];

  const chevronColor = {
    orange: 'text-numoria-orange',
    indigo: 'text-numoria-indigo',
    teal: 'text-numoria-teal',
    dorado: 'text-numoria-dorado',
  }[accent];

  return (
    <details
      className={`group rounded-xl border-2 bg-white p-4 [&_summary::-webkit-details-marker]:hidden ${accentClasses}`}
    >
      <summary className="-m-4 flex cursor-pointer list-none items-center gap-3 rounded-xl p-4 transition">
        <span className={`transition-transform group-open:rotate-90 ${chevronColor}`} aria-hidden>
          ▶
        </span>
        <h3 className="flex-1 font-display text-base font-bold text-numoria-grafito">
          {icon} {title}
        </h3>
        <span className="text-xs font-bold uppercase tracking-wide text-numoria-mid">
          {countLabel}
        </span>
      </summary>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {cards.map((card) => (
          <PracticeCardWithNumber key={card.id} card={card} contestById={contestById} />
        ))}
      </div>
    </details>
  );
}

// ============================================================
// PracticeCardWithNumber — wrapper para mostrar # de práctica arriba
// ============================================================

async function PracticeCardWithNumber({
  card,
  contestById,
}: {
  card: ContestCardData;
  contestById: (id: string) => ContestListContext | undefined;
}) {
  const tp = await getTranslations('contests.practicesPage');
  const ctx = contestById(card.id);
  const number = ctx?.contest_number ?? '?';
  return (
    <div className="flex flex-col gap-2">
      <div className="px-1 text-xs font-bold uppercase tracking-wide text-numoria-mid">
        {tp('practiceLabel', { number })}
      </div>
      <ContestCard data={card} />
    </div>
  );
}

// ============================================================
// Summer Bowl 2026 — Edición Inaugural (banner + 3 bowls)
// ============================================================
// Inscripción/participación se cablea en Chunk 3. CTAs disabled aquí.

interface SummerBowl {
  id: string;
  bowl_number: number;
  starts_at: string;
  ends_at: string;
  theme_es: string | null;
  theme_en: string | null;
}

async function SummerBowlSection({
  bowls,
  locale,
}: {
  bowls: SummerBowl[];
  locale: string;
}) {
  const tsb = await getTranslations('contests.summerBowl');

  return (
    <section aria-labelledby="summer-bowl-heading" className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-numoria-orange via-numoria-coral to-numoria-indigo p-6 text-white shadow-md sm:p-8">
        <span className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-numoria-orange">
          {tsb('freePill')}
        </span>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-90">
          {tsb('heroEyebrow')}
        </p>
        <h2
          id="summer-bowl-heading"
          className="mt-2 font-display text-2xl font-bold leading-tight sm:text-3xl"
        >
          {tsb('heroTitle')}
        </h2>
        <p className="mt-3 max-w-prose text-sm leading-relaxed opacity-95 sm:text-base">
          {tsb('heroBody')}
        </p>
        <p className="mt-4 inline-block rounded-lg bg-black/20 px-3 py-2 text-xs font-semibold sm:text-sm">
          {tsb('heroPrize')}
        </p>
      </div>

      <div>
        <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-numoria-mid">
          {tsb('bowlsHeader')}
        </h3>
        <div className="grid gap-3 md:grid-cols-3">
          {bowls.map((bowl) => (
            <BowlCard key={bowl.id} bowl={bowl} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}

async function BowlCard({ bowl, locale }: { bowl: SummerBowl; locale: string }) {
  const tsb = await getTranslations('contests.summerBowl');
  const format = await getFormatter();

  const theme = locale === 'en' ? bowl.theme_en : bowl.theme_es;
  const startDate = new Date(bowl.starts_at);
  const endDate = new Date(bowl.ends_at);
  const now = new Date();

  const status: 'upcoming' | 'active' | 'closed' =
    now < startDate ? 'upcoming' : now <= endDate ? 'active' : 'closed';

  const statusLabel = {
    upcoming: tsb('statusUpcoming'),
    active: tsb('statusActive'),
    closed: tsb('statusClosed'),
  }[status];

  const statusTone = {
    upcoming: 'bg-numoria-indigo/10 text-numoria-indigo',
    active: 'bg-numoria-green/15 text-[#0d6b3a]',
    closed: 'bg-numoria-gray/40 text-numoria-mid',
  }[status];

  const ctaLabel = {
    upcoming: tsb('ctaUpcoming'),
    active: tsb('ctaParticipate'),
    closed: tsb('ctaResults'),
  }[status];

  const dateLabel = tsb('dateRange', {
    start: format.dateTime(startDate, { day: 'numeric', month: 'short' }),
    end: format.dateTime(endDate, { day: 'numeric', month: 'short' }),
  });

  return (
    <article className="flex flex-col gap-3 rounded-xl border-2 border-numoria-orange/30 bg-white p-4 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="font-display text-base font-bold text-numoria-grafito">
          {tsb('bowlLabel', { number: bowl.bowl_number })}
        </h4>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusTone}`}
        >
          {statusLabel}
        </span>
      </div>
      <p className="text-xs font-semibold text-numoria-mid">{dateLabel}</p>
      {theme && <p className="text-sm leading-snug text-numoria-grafito">{theme}</p>}
      <button
        type="button"
        disabled
        className="mt-auto inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg border-2 border-numoria-orange/40 bg-numoria-orange/5 px-3 py-2 text-xs font-bold uppercase tracking-wide text-numoria-orange opacity-70"
        aria-disabled="true"
      >
        {ctaLabel}
      </button>
    </article>
  );
}
