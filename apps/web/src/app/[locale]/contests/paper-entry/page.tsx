import { Link } from '@/i18n/navigation';
import { createServerClient } from '@numoria/database/server';
import type { Tables } from '@numoria/database/types';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

type Contest = Tables<'contests'>;
type Profile = Tables<'profiles'>;

/**
 * /contests/paper-entry — Tarea 1 (refinada 2026-05-16).
 *
 * Lista SOLO los contests OFICIALES del teacher (no practices) para
 * entrada manual de respuestas en papel. Decisión del founder
 * 2026-05-16: las prácticas no necesitan transcripción porque no
 * cuentan para rankings — los students las hacen directo en la app.
 * Solo los oficiales se administran en papel y requieren transcribir.
 *
 * Solo accesible para teachers. Cada contest tiene un CTA "📝
 * Transcribir" que lleva a /contests/[id]/paper-entry (existente).
 */
export default async function PaperEntryListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tp = await getTranslations('contests.paperEntryPage');
  const tCard = await getTranslations('contests.card');

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
  if (profile.role !== 'teacher') {
    // Students no transcriben respuestas de otros — solo teachers
    redirect(`/${locale}/contests`);
  }

  // Solo oficiales (no practices). Status active/scheduled = administrables.
  const { data: contestsRows } = await supabase
    .from('contests')
    .select(
      'id, slug, title_es, title_en, division, scheduled_at, calculator_allowed, status, contest_type',
    )
    .eq('contest_type', 'official')
    .in('status', ['active', 'scheduled'])
    .order('scheduled_at', { ascending: false });

  const contests =
    (contestsRows as Array<
      Pick<
        Contest,
        | 'id'
        | 'slug'
        | 'title_es'
        | 'title_en'
        | 'division'
        | 'scheduled_at'
        | 'calculator_allowed'
        | 'status'
      > & { contest_type: 'practice' | 'official' }
    > | null) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-numoria-grafito sm:text-3xl">
          {tp('title')}
        </h1>
        <p className="mt-2 text-sm text-numoria-mid">{tp('description')}</p>
      </header>

      {contests.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-numoria-gray bg-white p-8 text-center">
          <p className="text-sm text-numoria-mid">{tp('emptyMessage')}</p>
          <Link
            href="/contests/officials"
            className="mt-4 inline-block text-sm font-bold text-numoria-orange hover:underline"
          >
            {tp('viewOfficialsLink')}
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {contests.map((c) => (
            <li key={c.id}>
              <Link
                href={`/contests/${c.id}/paper-entry`}
                className="flex items-center justify-between gap-4 rounded-xl border-2 border-numoria-gray bg-white p-5 transition hover:border-numoria-coral hover:bg-numoria-coral/5"
              >
                <div className="flex-1">
                  <p className="font-display text-base font-bold text-numoria-grafito">
                    🏆 {locale === 'en' ? c.title_en : c.title_es}
                  </p>
                  <p className="mt-1 text-xs text-numoria-mid">
                    {c.division === 'elementary' ? tCard('divisionE') : tCard('divisionM')} ·{' '}
                    {c.calculator_allowed ? tCard('withCalc') : tCard('noCalc')}
                  </p>
                </div>
                <span className="rounded-full bg-numoria-coral/10 px-3 py-1 text-xs font-bold text-numoria-coral">
                  {tp('transcribeButton')}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
