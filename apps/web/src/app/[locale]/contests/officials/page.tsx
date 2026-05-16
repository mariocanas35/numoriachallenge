import { ContestCard } from '@/components/contests/ContestCard';
import { Link } from '@/i18n/navigation';
import {
  type ContestListContext,
  fetchContestsListData,
  groupContestsByNumber,
  variantOf,
} from '@/lib/contests/list-data';
import { createServerClient } from '@numoria/database/server';
import type { Tables } from '@numoria/database/types';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

type Profile = Tables<'profiles'>;

/**
 * /contests/officials — Tarea 3 del plan recalibrado 2026-05-15.
 *
 * Página dedicada para los 6 contests oficiales del ciclo académico
 * 2026-2027 (Nov 2026 → Abr 2027). Cada oficial se renderiza como
 * "carpeta" con sus 3 versiones (E sin-calc, M sin-calc, M con-calc)
 * y un header con fecha programada, estado actual y countdown.
 *
 * Los oficiales SÍ requieren sesión MOEMS del teacher y SÍ cuentan
 * para XP/leaderboards/stats regionales.
 */
export default async function OfficialsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contests');
  const to = await getTranslations('contests.officialsPage');
  const tv = await getTranslations('contests.variants');
  const format = await getFormatter();

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

  const { officials, contestById } = await fetchContestsListData(supabase, user.id, profile);
  const grouped = groupContestsByNumber(officials, contestById);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <div className="flex items-center gap-2 text-sm text-numoria-mid">
          <Link href="/contests" className="hover:text-numoria-orange hover:underline">
            🏆 {t('listTitle')}
          </Link>
          <span>›</span>
          <span className="font-bold text-numoria-grafito">{to('breadcrumb')}</span>
        </div>
        <h1 className="mt-3 font-display text-2xl font-bold text-numoria-grafito sm:text-3xl">
          {to('title')}
        </h1>
        <p className="mt-2 text-sm text-numoria-mid">{to('description')}</p>
      </header>

      {grouped.length === 0 ? (
        <EmptyOfficials />
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map(({ number, cards }) => {
            const firstContest = cards[0] ? contestById(cards[0].id) : undefined;
            const status = officialStatusOf(firstContest, to);
            return (
              <section
                key={number}
                className="rounded-2xl border-2 border-numoria-orange/20 bg-numoria-orange/5 p-5"
              >
                <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
                  <div>
                    <h2 className="font-display text-lg font-bold text-numoria-grafito">
                      {to('officialHeader', { number })}
                    </h2>
                    {firstContest && (
                      <p className="mt-1 text-sm text-numoria-mid">
                        {to('scheduledDate')}
                        <strong className="text-numoria-grafito">
                          {format.dateTime(new Date(firstContest.scheduled_at), {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </strong>
                      </p>
                    )}
                  </div>
                  <StatusBadge {...status} />
                </header>
                <div className="grid gap-3 md:grid-cols-3">
                  {cards.map((card) => {
                    const contest = contestById(card.id);
                    if (!contest) return null;
                    const variant = variantOf(contest, tv);
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
            );
          })}
        </div>
      )}
    </div>
  );
}

interface StatusInfo {
  label: string;
  tone: 'upcoming' | 'active' | 'closed';
}

function officialStatusOf(
  contest: ContestListContext | undefined,
  to: (key: string) => string,
): StatusInfo {
  if (!contest) return { label: to('statusFallback'), tone: 'upcoming' };
  const now = new Date();
  const scheduled = new Date(contest.scheduled_at);
  const windowEnd = new Date(
    scheduled.getTime() + (contest.calendar_window_days ?? 30) * 24 * 60 * 60 * 1000,
  );
  if (now < scheduled) return { label: to('statusUpcoming'), tone: 'upcoming' };
  if (now <= windowEnd) return { label: to('statusActive'), tone: 'active' };
  return { label: to('statusClosed'), tone: 'closed' };
}

function StatusBadge({ label, tone }: StatusInfo) {
  const toneClasses = {
    upcoming: 'bg-numoria-indigo/10 text-numoria-indigo',
    active: 'bg-numoria-teal/15 text-[#0d8278]',
    closed: 'bg-numoria-gray/40 text-numoria-mid',
  }[tone];
  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${toneClasses}`}
    >
      {label}
    </span>
  );
}

async function EmptyOfficials() {
  const to = await getTranslations('contests.officialsPage');
  return (
    <div className="rounded-2xl border-2 border-dashed border-numoria-orange/40 bg-numoria-orange/5 p-8">
      <h2 className="font-display text-lg font-bold text-numoria-grafito">{to('emptyTitle')}</h2>
      <p className="mt-2 text-sm text-numoria-mid">{to('emptyDescription')}</p>
      <ul className="mt-4 grid gap-2 text-sm text-numoria-mid sm:grid-cols-2">
        <li>{to('calendar.c1')}</li>
        <li>{to('calendar.c2')}</li>
        <li>{to('calendar.c3')}</li>
        <li>{to('calendar.c4')}</li>
        <li>{to('calendar.c5')}</li>
        <li>{to('calendar.c6')}</li>
      </ul>
    </div>
  );
}
