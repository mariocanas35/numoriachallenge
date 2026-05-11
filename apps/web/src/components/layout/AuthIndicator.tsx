import { Link } from '@/i18n/navigation';
import { createAdminClient, createServerClient } from '@numoria/database/server';
import type { Tables } from '@numoria/database/types';
import { Button } from '@numoria/ui';
import { getTranslations } from 'next-intl/server';

type ProfileSlice = Pick<Tables<'profiles'>, 'display_name' | 'role' | 'locale'>;

/**
 * Indicador flotante (esquina superior derecha) que muestra el estado
 * de autenticación del usuario actual.
 *
 * - Si no hay sesión → botón "Iniciar sesión"
 * - Si hay sesión → display_name + rol + botón "Salir"
 *
 * Server component — lee cookies vía createServerClient.
 * Si la sesión se estableció correctamente post-callback, el badge
 * aparecerá con info del user. Si no, aparece el CTA de login.
 *
 * Sirve como prueba visible del flow de auth durante desarrollo.
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

  // Buscar el profile para mostrar display_name + role.
  // Usamos admin client (service_role) para esta lookup específica porque
  // @supabase/ssr 0.5.x tiene un issue conocido propagando el JWT a postgrest
  // calls desde Server Components, lo cual hace que RLS bloquee la query
  // aunque el user esté autenticado.
  // Seguro porque solo leemos `user.id` que ya verificamos vía getUser().
  // TODO Phase 2: investigar RLS context propagation o migrar a RPC SECURITY DEFINER.
  const admin = createAdminClient();
  const profileResult = await admin
    .from('profiles')
    .select('display_name, role, locale')
    .eq('id', user.id)
    .single();

  const profile = profileResult.data as ProfileSlice | null;
  const displayName = profile?.display_name ?? user.email ?? 'Usuario';
  const role = profile?.role ?? null;

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
