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

  // Solo los estudiantes resuelven; maestros/padres ven la info.
  const { data: profileData } = await supabase.rpc('get_my_profile');
  const profile = profileData as { role?: string } | null;
  if (profile?.role !== 'student') {
    redirect(`/${locale}/summer-bowl`);
  }

  // Buscar el contest del bowl activo y mandar a resolverlo.
  const { data: rows } = await supabase
    .from('contests')
    .select('id')
    .eq('slug', ACTIVE_BOWL_SLUG)
    .limit(1);
  const contest = (rows as Array<{ id: string }> | null)?.[0];

  if (!contest) {
    redirect(`/${locale}/summer-bowl`);
  }

  redirect(`/${locale}/contests/${contest.id}`);
}
