import { Link } from '@/i18n/navigation';
import { createServerClient } from '@numoria/database/server';
import type { Tables } from '@numoria/database/types';
import { Button } from '@numoria/ui';
import { getTranslations } from 'next-intl/server';

type Profile = Tables<'profiles'>;

/**
 * Indicador flotante (esquina superior derecha) que muestra el estado
 * de autenticación del usuario actual.
 *
 * - Si no hay sesión → botón "Iniciar sesión"
 * - Si hay sesión → display_name + rol + email + botón "Cerrar"
 *
 * Server component — lee cookies vía createServerClient.
 *
 * Para la lectura del profile usa el RPC `get_my_profile()` (SECURITY DEFINER)
 * que bypassa el issue de @supabase/ssr 0.5.x donde RLS no se propaga
 * correctamente al postgrest en Server Components. Resuelve el tech debt
 * documentado en ADR 0004.
 */
export async function AuthIndicator() {
  const supabase = await createServerClient();
  const tCommon = await getTranslations('common');
  const tAuth = await getTranslations('auth');

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Button variant="primary" size="sm" asChild>
          <Link href="/login">🔓 {tAuth('login')}</Link>
        </Button>
      </div>
    );
  }

  // RPC get_my_profile() es SECURITY DEFINER → devuelve el profile sin
  // pasar por RLS, evitando el bug de propagación del JWT en Server Components.
  // Type assertion necesaria por bug de inferencia de Supabase JS con
  // funciones RPC que retornan TABLE types (data se infiere como `never`).
  const rpcResult = await supabase.rpc('get_my_profile');
  if (rpcResult.error) {
    console.error('get_my_profile RPC failed:', rpcResult.error.message);
  }
  const profile = rpcResult.data as Profile | null;

  const displayName = profile?.display_name ?? user.email ?? 'Usuario';
  const role = profile?.role ?? null;
  const onboarded = profile?.onboarding_completed ?? false;

  const roleLabels: Record<string, string> = {
    student: '🎓 Estudiante',
    parent: '👨‍👩‍👧 Padre/Madre',
    teacher: '👩‍🏫 Profesor',
    admin: '🛠️ Admin',
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl border-2 border-numoria-green bg-white p-3 shadow-card">
      <div className="text-left text-sm">
        <p className="font-display font-bold text-numoria-ink">✅ {displayName}</p>
        <p className="text-xs text-numoria-mid">
          {role ? (roleLabels[role] ?? role) : 'sin rol'}
          {!onboarded && ' · 📝 onboarding pendiente'}
          {' · '}
          {user.email}
        </p>
      </div>
      <a
        href="/auth/logout"
        className="rounded-md border-2 border-numoria-gray bg-white px-3 py-1.5 text-xs font-bold text-numoria-ink hover:bg-numoria-cloud"
      >
        {tCommon('close')}
      </a>
    </div>
  );
}
