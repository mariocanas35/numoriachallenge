import { createServerClient } from '@numoria/database/server';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

/**
 * /contests/summer-bowl — Entrada al Summer Bowl para usuarios logueados.
 *
 * Manda al estudiante DIRECTO a resolver el bowl online (/contests/[id], el
 * mismo motor de las prácticas: calificación automática, sin requerir equipo).
 * El gating fino (rol estudiante, "aún no empieza", ventana de fechas) lo maneja
 * esa página. Maestros/padres van a la página informativa.
 *
 * Para el Bowl #1 buscamos el contest por su slug fijo; cuando haya más bowls
 * se generaliza por bowl activo.
 */
const ACTIVE_BOWL_SLUG = 'numoria-sb1-2026';

export default async function SummerBowlEntryPage({
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
    redirect(`/${locale}/register`);
  }

  // Buscar el contest del bowl activo.
  const { data: rows } = await supabase
    .from('contests')
    .select('id, scheduled_at, calendar_window_days')
    .eq('slug', ACTIVE_BOWL_SLUG)
    .limit(1);
  const contest = (
    rows as Array<{ id: string; scheduled_at: string; calendar_window_days: number | null }> | null
  )?.[0];

  // Si el bowl ya terminó, todos van a los resultados oficiales.
  if (contest) {
    const endsAt =
      new Date(contest.scheduled_at).getTime() +
      (contest.calendar_window_days ?? 0) * 24 * 60 * 60 * 1000;
    if (Date.now() >= endsAt) {
      redirect(`/${locale}/summer-bowl/results`);
    }
  }

  // Solo los estudiantes resuelven; maestros/padres ven la info.
  const { data: profileData } = await supabase.rpc('get_my_profile');
  const profile = profileData as { role?: string } | null;
  if (profile?.role !== 'student') {
    redirect(`/${locale}/summer-bowl`);
  }

  if (!contest) {
    redirect(`/${locale}/summer-bowl`);
  }

  redirect(`/${locale}/contests/${contest.id}`);
}
