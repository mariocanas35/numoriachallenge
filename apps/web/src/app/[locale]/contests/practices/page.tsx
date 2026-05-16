import { ContestCard, type ContestCardData } from '@/components/contests/ContestCard';
import { Link } from '@/i18n/navigation';
import { type ContestListContext, fetchContestsListData } from '@/lib/contests/list-data';
import { createServerClient } from '@numoria/database/server';
import type { Tables } from '@numoria/database/types';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

type Profile = Tables<'profiles'>;

/**
 * /contests/practices — refinada 2026-05-16.
 *
 * Folder pattern jerárquico solicitado por el founder:
 *
 *   📁 Primaria
 *     └ Práctica #1 D-E, Práctica #2 D-E, Práctica #3 D-E
 *
 *   📁 Middle School
 *     ├ ✏️ Sin calculadora
 *     │  └ Práctica #1 D-M, #2, #3
 *     └ 🧮 Con calculadora
 *        └ Práctica #1 D-MC, #2, #3
 *
 * Las prácticas NO requieren sesión MOEMS (fix d80f5aa) y NO cuentan
 * para XP/leaderboards/stats regionales (decisión 2026-05-15, Opción B).
 */
export default async function PracticesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contests');

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

  return (
    <div className="flex flex-col gap-8">
      <header>
        <div className="flex items-center gap-2 text-sm text-numoria-mid">
          <Link href="/contests" className="hover:text-numoria-orange hover:underline">
            🏆 {t('listTitle')}
          </Link>
          <span>›</span>
          <span className="font-bold text-numoria-grafito">📚 Prácticas</span>
        </div>
        <h1 className="mt-3 font-display text-2xl font-bold text-numoria-grafito sm:text-3xl">
          📚 Prácticas
        </h1>
        <p className="mt-2 text-sm text-numoria-mid">
          Tests siempre disponibles para entrenar antes de los contests oficiales. Las prácticas no
          cuentan para tu nivel ni para el ranking nacional — son para que tus estudiantes ganen
          confianza sin presión.
        </p>
      </header>

      {practices.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-numoria-gray bg-white p-8 text-center text-sm text-numoria-mid">
          No hay prácticas disponibles en este momento.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* === 📁 Primaria === */}
          {byLevel.elementary.length > 0 && (
            <FolderSection
              title="Primaria"
              accent="orange"
              description="Para estudiantes de 4° a 6° grado. Sin calculadora."
              cards={byLevel.elementary}
              contestById={contestById}
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
                    📁 Middle School
                  </h2>
                  <p className="mt-1 text-sm text-numoria-mid">
                    Para estudiantes de 7° a 9° grado. Dos variantes según el uso de calculadora.
                  </p>
                </div>
                <span className="text-xs font-bold uppercase tracking-wide text-numoria-mid">
                  {byLevel.middleNoCalc.length + byLevel.middleCalc.length} prácticas
                </span>
              </summary>

              <div className="mt-5 flex flex-col gap-3">
                {byLevel.middleNoCalc.length > 0 && (
                  <SubFolder
                    title="Sin calculadora"
                    icon="✏️"
                    accent="teal"
                    cards={byLevel.middleNoCalc}
                    contestById={contestById}
                  />
                )}
                {byLevel.middleCalc.length > 0 && (
                  <SubFolder
                    title="Con calculadora"
                    icon="🧮"
                    accent="dorado"
                    cards={byLevel.middleCalc}
                    contestById={contestById}
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
}: {
  title: string;
  accent: Accent;
  description?: string;
  cards: ContestCardData[];
  contestById: (id: string) => ContestListContext | undefined;
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
          {cards.length} {cards.length === 1 ? 'práctica' : 'prácticas'}
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
}: {
  title: string;
  icon: string;
  accent: Accent;
  cards: ContestCardData[];
  contestById: (id: string) => ContestListContext | undefined;
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
          {cards.length} {cards.length === 1 ? 'práctica' : 'prácticas'}
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

function PracticeCardWithNumber({
  card,
  contestById,
}: {
  card: ContestCardData;
  contestById: (id: string) => ContestListContext | undefined;
}) {
  const ctx = contestById(card.id);
  const number = ctx?.contest_number ?? '?';
  return (
    <div className="flex flex-col gap-2">
      <div className="px-1 text-xs font-bold uppercase tracking-wide text-numoria-mid">
        Práctica #{number}
      </div>
      <ContestCard data={card} />
    </div>
  );
}
