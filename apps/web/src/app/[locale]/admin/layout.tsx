import { Link } from '@/i18n/navigation';
import { createServerClient } from '@numoria/database/server';
import { redirect } from 'next/navigation';

/**
 * Layout del panel de administración. PRIVADO — solo cuentas con rol 'admin'.
 *
 * Triple protección: este gate (servidor), la ruta no es visible para nadie
 * más, y las políticas RLS de la DB exigen is_admin() para los datos sensibles.
 * Interfaz solo en español (uso interno del fundador).
 */
export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data } = await supabase.rpc('get_my_profile');
  const profile = data as { role?: string } | null;
  if (profile?.role !== 'admin') {
    redirect(`/${locale}`);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-numoria-cloud">
      <header className="flex items-center justify-between border-b-2 border-numoria-gray bg-white px-6 py-3 print:hidden">
        <div className="flex items-center gap-6">
          <span className="font-display text-lg font-bold text-numoria-ink">Numoria · Admin 🛡️</span>
          <nav className="flex gap-1 text-sm font-bold">
            <Link
              href="/admin"
              className="rounded-md px-3 py-1.5 text-numoria-grafito transition hover:bg-numoria-cloud"
            >
              Inicio
            </Link>
            <Link
              href="/admin/users"
              className="rounded-md px-3 py-1.5 text-numoria-grafito transition hover:bg-numoria-cloud"
            >
              Usuarios
            </Link>
            <Link
              href="/admin/contests"
              className="rounded-md px-3 py-1.5 text-numoria-grafito transition hover:bg-numoria-cloud"
            >
              Competencias
            </Link>
            <Link
              href="/admin/analytics"
              className="rounded-md px-3 py-1.5 text-numoria-grafito transition hover:bg-numoria-cloud"
            >
              Visitas
            </Link>
            <Link
              href="/admin/leads"
              className="rounded-md px-3 py-1.5 text-numoria-grafito transition hover:bg-numoria-cloud"
            >
              Leads
            </Link>
            <Link
              href="/admin/activity"
              className="rounded-md px-3 py-1.5 text-numoria-grafito transition hover:bg-numoria-cloud"
            >
              Actividad
            </Link>
          </nav>
        </div>
        <a
          href="/auth/logout"
          className="text-sm text-numoria-mid underline-offset-2 hover:text-numoria-red hover:underline"
        >
          Cerrar sesión
        </a>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
