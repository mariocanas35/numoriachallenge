import { Link } from '@/i18n/navigation';
import { createServerClient } from '@numoria/database/server';
import type { Tables } from '@numoria/database/types';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

type Contest = Tables<'contests'>;
type Profile = Tables<'profiles'>;

/**
 * /contests/paper-entry — Stub funcional Tarea 1.
 *
 * Lista los contests activos del teacher para entrada manual de
 * respuestas en papel. Solo accesible para teachers. Cada contest
 * tiene un CTA "📝 Transcribir" que lleva a /contests/[id]/paper-entry
 * (página individual que ya existe desde Phase 4.2).
 *
 * Esta lista es un atajo desde el dashboard para no tener que entrar
 * a /contests, ubicar el contest y luego clickear el botón de paper
 * entry. El founder lo pidió como card propia en quick actions.
 */
export default async function PaperEntryListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

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

  // Fetch todos los contests activos/scheduled (oficial + practice) que el
  // teacher puede transcribir. Ordenados por scheduled_at desc.
  const { data: contestsRows } = await supabase
    .from('contests')
    .select(
      'id, slug, title_es, title_en, division, scheduled_at, calculator_allowed, status, contest_type',
    )
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
          📝 Entrada manual
        </h1>
        <p className="mt-2 text-sm text-numoria-mid">
          Transcribe respuestas que tus estudiantes hicieron en papel. Selecciona el contest y luego
          ingresa las respuestas estudiante por estudiante.
        </p>
      </header>

      {contests.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-numoria-gray bg-white p-8 text-center">
          <p className="text-sm text-numoria-mid">
            No hay contests activos en este momento. Cuando un contest oficial esté disponible,
            podrás transcribir respuestas desde aquí.
          </p>
          <Link
            href="/contests"
            className="mt-4 inline-block text-sm font-bold text-numoria-orange hover:underline"
          >
            Ver todos los contests →
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
                    {c.contest_type === 'practice' ? '📚' : '🏆'} {c.title_es}
                  </p>
                  <p className="mt-1 text-xs text-numoria-mid">
                    {c.division === 'elementary' ? 'Elementary' : 'Middle'} ·{' '}
                    {c.calculator_allowed ? 'Con calculadora' : 'Sin calculadora'} ·{' '}
                    {c.contest_type === 'practice' ? 'Práctica' : 'Oficial'}
                  </p>
                </div>
                <span className="rounded-full bg-numoria-coral/10 px-3 py-1 text-xs font-bold text-numoria-coral">
                  Transcribir →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
