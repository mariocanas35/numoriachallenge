import { createServerClient } from '@numoria/database/server';
import type { Tables } from '@numoria/database/types';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

type Profile = Tables<'profiles'>;

/**
 * Onboarding router.
 *
 * Decisión basada en estado del profile:
 * - Si user no autenticado → redirect a /login
 * - Si onboarding ya completo → redirect a / (home)
 * - Si role en {student, parent, teacher} → redirect a /onboarding/{role}
 * - Caso default (admin u otro) → redirect a / (admins no necesitan onboarding)
 */
export default async function OnboardingRouterPage({
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
    // Edge case: user existe en auth pero no profile (trigger falló o el JWT
    // no se propagó). Antes redirigía a `/${locale}/auth-error`, una ruta que
    // NO existe (404). La página real de error vive fuera de [locale].
    redirect('/auth/error?reason=no_profile');
  }

  if (profile.onboarding_completed) {
    redirect(`/${locale}`);
  }

  // Redirigir al flow específico del rol
  // Nota: redirect() de Next.js lanza internamente, pero Biome no infiere
  // que retorna `never` — usamos if/else para evitar warning de fallthrough.
  if (profile.role === 'student') {
    redirect(`/${locale}/onboarding/student`);
  }
  if (profile.role === 'parent') {
    redirect(`/${locale}/onboarding/parent`);
  }
  if (profile.role === 'teacher') {
    redirect(`/${locale}/onboarding/teacher`);
  }

  // Admins u otros roles no necesitan onboarding
  redirect(`/${locale}`);
}
