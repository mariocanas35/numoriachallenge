import { ContestCard } from '@/components/contests/ContestCard';
import { Link } from '@/i18n/navigation';
import { fetchContestsListData, groupContestsByNumber, variantOf } from '@/lib/contests/list-data';
import { createServerClient } from '@numoria/database/server';
import type { Tables } from '@numoria/database/types';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

type Profile = Tables<'profiles'>;

/**
 * /contests/practices — Tarea 3 del plan recalibrado 2026-05-15.
 *
 * Página dedicada para prácticas (separada de /contests). Cada práctica
 * (Practice #1, #2, #3) se renderiza como una "carpeta" con sus 3
 * versiones lado a lado (E sin-calc, M sin-calc, M con-calc) cada una
 * con su ícono diferenciador:
 *   🧒 Primaria (sin calc)
 *   🧠 Secundaria (sin calc)
 *   🧮 Secundaria (con calc)
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
  const grouped = groupContestsByNumber(practices, contestById);

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

      {grouped.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-numoria-gray bg-white p-8 text-center text-sm text-numoria-mid">
          No hay prácticas disponibles en este momento.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map(({ number, cards }) => (
            <section
              key={number}
              className="rounded-2xl border-2 border-numoria-teal/20 bg-numoria-teal/5 p-5"
            >
              <h2 className="mb-4 flex items-center justify-between font-display text-lg font-bold text-numoria-grafito">
                <span>📁 Práctica #{number}</span>
                <span className="text-xs font-bold uppercase tracking-wide text-numoria-mid">
                  3 versiones
                </span>
              </h2>
              <div className="grid gap-3 md:grid-cols-3">
                {cards.map((card) => {
                  const contest = contestById(card.id);
                  if (!contest) return null;
                  const variant = variantOf(contest);
                  return (
                    <div key={card.id} className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wide text-numoria-mid">
                        <span className="text-base" aria-hidden>
                          {variant.icon}
                        </span>
                        <span>{variant.shortLabel}</span>
                      </div>
                      <ContestCard data={card} />
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
