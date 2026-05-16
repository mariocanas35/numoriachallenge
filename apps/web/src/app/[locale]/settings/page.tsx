import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { Link } from '@/i18n/navigation';
import { createServerClient } from '@numoria/database/server';
import { NumoriaLogo } from '@numoria/ui';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

/**
 * /settings — Stub funcional Tarea 1.
 *
 * Página placeholder con secciones planificadas para Tarea 2:
 *   - 🏫 Escuela (logo, dirección, ciudad, teléfono)
 *   - ✅ Verificación (badge si está aprobada)
 *   - 💳 Suscripción (plan, # seats, upgrade)
 *   - 👤 Mi perfil (display_name, email, idioma)
 *
 * Por ahora solo muestra las secciones como "próximamente" para que
 * el botón ⚙️ del dashboard tenga destino funcional.
 *
 * Ref: memory soft-launch-plan.md "Plan de implementación Tarea 2"
 */
export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('auth');

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const sections = [
    {
      icon: '🏫',
      title: 'Mi escuela',
      description: 'Logo, dirección, ciudad, teléfono de contacto',
      status: 'Próximamente',
    },
    {
      icon: '✅',
      title: 'Verificación',
      description: 'Estado de verificación de tu escuela en Numoria',
      status: 'Próximamente',
    },
    {
      icon: '💳',
      title: 'Suscripción',
      description: 'Plan actual, cantidad de cupos, opciones de upgrade',
      status: 'Próximamente',
    },
    {
      icon: '👤',
      title: 'Mi perfil',
      description: 'Nombre visible, email, idioma preferido',
      status: 'Próximamente',
    },
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-numoria-crema via-white to-numoria-crema">
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <Link href="/" className="text-xl transition hover:opacity-80">
          <NumoriaLogo variant="horizontal" />
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-bold text-numoria-mid transition hover:text-numoria-orange"
          >
            🏠 <span className="hidden sm:inline">{t('home')}</span>
          </Link>
          <LocaleSwitcher />
          <a
            href="/auth/logout"
            className="text-sm text-numoria-niebla underline-offset-2 hover:text-numoria-coral hover:underline"
          >
            {t('logout')}
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8 sm:px-10 sm:py-12">
        <header className="mb-8">
          <h1 className="font-display text-3xl font-bold text-numoria-grafito">⚙️ Configuración</h1>
          <p className="mt-2 text-sm text-numoria-mid">
            Personaliza tu escuela y tu perfil. Cada sección se irá habilitando progresivamente.
          </p>
        </header>

        <ul className="flex flex-col gap-3">
          {sections.map((s) => (
            <li
              key={s.title}
              className="flex items-center gap-4 rounded-xl border-2 border-numoria-gray bg-white p-5"
            >
              <span className="text-3xl" aria-hidden>
                {s.icon}
              </span>
              <div className="flex-1">
                <p className="font-display text-base font-bold text-numoria-grafito">{s.title}</p>
                <p className="mt-1 text-xs text-numoria-mid">{s.description}</p>
              </div>
              <span className="rounded-full bg-numoria-gray/40 px-3 py-1 text-xs font-bold uppercase tracking-wide text-numoria-mid">
                {s.status}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-xl border-2 border-dashed border-numoria-orange/40 bg-numoria-orange/5 p-5 text-sm text-numoria-mid">
          <strong className="text-numoria-orange">🔨 En construcción.</strong> Estas secciones se
          activarán en la próxima actualización de la app. Por ahora puedes seguir gestionando tus
          equipos y contests desde el dashboard.
        </div>
      </main>
    </div>
  );
}
