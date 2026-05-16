import { ContestCard, type ContestCardData } from '@/components/contests/ContestCard';
import { fetchContestsListData, groupContestsByNumber } from '@/lib/contests/list-data';
import { createServerClient } from '@numoria/database/server';
import type { Tables } from '@numoria/database/types';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

type Profile = Tables<'profiles'>;

/**
 * Página /contests — listado de todos los contests visibles para el user actual,
 * agrupados en 3 secciones: activos / próximos / pasados.
 *
 * Visible solo para students y teachers autenticados onboarded.
 */
export default async function ContestsListPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ startError?: string }>;
}) {
  const { locale } = await params;
  const { startError } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('contests');

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Profile del user (para division derivation)
  const rpcResult = await supabase.rpc('get_my_profile');
  const profile = rpcResult.data as Profile | null;
  if (!profile) {
    redirect(`/${locale}/auth-error`);
  }

  const data = await fetchContestsListData(supabase, user.id, profile);
  const { practices, officialActive, officialUpcoming, officialPast, contests, contestById } = data;

  if (contests.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
            🏆 {t('listTitle')}
          </h1>
          <p className="mt-2 text-sm text-numoria-mid">{t('listSubtitle')}</p>
        </header>
        <p className="rounded-xl border-2 border-dashed border-numoria-gray bg-white p-8 text-center text-sm text-numoria-mid">
          {t('sections.empty')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {startError && (
        <div className="rounded-xl border-2 border-numoria-coral/40 bg-numoria-coral/5 p-4">
          <p className="text-sm font-bold text-numoria-coral">
            ⚠️{' '}
            {startError === 'session_not_open'
              ? 'No hay una sesión abierta de este contest para tu equipo.'
              : startError === 'Contest is not active'
                ? 'Este contest no está activo en este momento.'
                : startError === 'Contest has not started yet'
                  ? 'Este contest aún no ha empezado.'
                  : startError === 'Contest window has expired'
                    ? 'La ventana de este contest ya expiró.'
                    : `No se pudo empezar el contest: ${startError}`}
          </p>
          <p className="mt-1 text-xs text-numoria-mid">
            Tu maestro debe abrir una sesión para tu equipo desde su dashboard. La sesión dura 35
            minutos y permite que todos los students del equipo entren al contest.
          </p>
        </div>
      )}

      <header>
        <h1 className="font-display text-2xl font-bold text-numoria-ink sm:text-3xl">
          🏆 {t('listTitle')}
        </h1>
        <p className="mt-2 text-sm text-numoria-mid">{t('listSubtitle')}</p>
      </header>

      {/* Phase 4.5a — Sección PRÁCTICAS arriba (siempre disponibles, no expiran).
          Agrupadas en "carpetas" por contest_number — cada práctica tiene 3
          versiones (E sin-calc, M sin-calc, M con-calc) que se muestran lado
          a lado en desktop, apiladas en móvil.

          id="practices" → target del redirect /contests/practices (Tarea 1). */}
      {practices.length > 0 && (
        <section id="practices" className="scroll-mt-6">
          <h2 className="mb-3 font-display text-lg font-bold text-numoria-ink">
            📚 {t('sections.practices')}
          </h2>
          <p className="mb-5 text-sm text-numoria-mid">{t('sections.practicesSubtitle')}</p>
          <div className="flex flex-col gap-6">
            {groupContestsByNumber(practices, contestById).map(({ number, cards }) => (
              <div
                key={number}
                className="rounded-2xl border-2 border-numoria-teal/20 bg-numoria-teal/5 p-4"
              >
                <h3 className="mb-3 font-display text-base font-bold text-numoria-ink">
                  {t('sections.practiceGroupHeader', { number })}
                </h3>
                <div className="grid gap-3 md:grid-cols-3">
                  {cards.map((card) => (
                    <ContestCard key={card.id} data={card} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CONTESTS OFICIALES — agrupados por calendar state.
          id="officials" → target del redirect /contests/officials (Tarea 1). */}
      <section id="officials" className="scroll-mt-6">
        <h2 className="mb-3 font-display text-xl font-bold text-numoria-ink">
          🏆 {t('sections.officials')}
        </h2>
        <p className="mb-4 text-sm text-numoria-mid">{t('sections.officialsSubtitle')}</p>
        <div className="flex flex-col gap-6">
          <ContestSection
            title={t('sections.active')}
            cards={officialActive}
            empty={t('sections.empty')}
          />
          <ContestSection
            title={t('sections.upcoming')}
            cards={officialUpcoming}
            empty={t('sections.empty')}
          />
          <ContestSection
            title={t('sections.past')}
            cards={officialPast}
            empty={t('sections.empty')}
          />
        </div>
      </section>
    </div>
  );
}

function ContestSection({
  title,
  cards,
  empty,
}: {
  title: string;
  cards: ContestCardData[];
  empty: string;
}) {
  return (
    <section>
      <h2 className="mb-3 font-display text-lg font-bold text-numoria-ink">{title}</h2>
      {cards.length === 0 ? (
        <p className="rounded-md border-2 border-dashed border-numoria-gray bg-white/50 p-4 text-center text-sm text-numoria-mid">
          {empty}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {cards.map((card) => (
            <ContestCard key={card.id} data={card} />
          ))}
        </div>
      )}
    </section>
  );
}
