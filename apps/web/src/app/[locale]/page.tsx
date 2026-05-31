import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { ParentDashboard } from '@/components/dashboard/ParentDashboard';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { TeacherDashboard } from '@/components/dashboard/TeacherDashboard';
import { Footer } from '@/components/landing/Footer';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { SchoolsSection } from '@/components/landing/SchoolsSection';
import { Link } from '@/i18n/navigation';
import { createServerClient } from '@numoria/database/server';
import type { Tables } from '@numoria/database/types';
import { getTranslations, setRequestLocale } from 'next-intl/server';

function Landing() {
  return (
    <>
      <LandingHeader />
      <main className="min-h-dvh">
        <Hero />
        <HowItWorks />
        <SchoolsSection />
      </main>
      <Footer />
    </>
  );
}

type Profile = Tables<'profiles'>;

/**
 * Home page role-aware.
 *
 * - Anónimo → landing (Hero + HowItWorks + SchoolsSection + Footer)
 * - Logueado y onboarded → dashboard según `profile.role`
 * - Logueado pero NO onboarded → no llega aquí (middleware redirige a /onboarding)
 * - Admin → landing por ahora (su dashboard llega en Phase 4)
 */
export default async function HomePage({
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

  // Anónimo → landing
  if (!user) {
    return <Landing />;
  }

  // Logueado → profile (middleware garantiza onboarding_completed=true)
  const rpcResult = await supabase.rpc('get_my_profile');
  const profile = rpcResult.data as Profile | null;

  if (!profile) {
    // El usuario SÍ está autenticado pero no pudimos leer su profile (RPC
    // devolvió null: trigger aún pendiente o JWT no propagado en este request).
    // NO mostrar la landing pública aquí — al usuario le parecería que "no
    // entró". Mostramos un estado claro de "preparando tu cuenta" con opción
    // de recargar o cerrar sesión. Evitamos un redirect para no arriesgar un
    // loop con /onboarding si la lectura del profile fluctúa.
    const tSetup = await getTranslations('auth.setupPending');
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="font-display text-2xl font-bold text-numoria-ink">{tSetup('title')}</h1>
        <p className="max-w-md text-numoria-mid">{tSetup('description')}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-numoria-blue px-5 py-2.5 text-sm font-bold text-white transition hover:bg-numoria-blue/90"
          >
            {tSetup('retry')}
          </Link>
          <a
            href="/auth/logout"
            className="rounded-full border-2 border-numoria-gray px-5 py-2.5 text-sm font-bold text-numoria-grafito transition hover:border-numoria-mid"
          >
            {tSetup('logout')}
          </a>
        </div>
      </main>
    );
  }

  // Dashboard según rol
  if (profile.role === 'student') {
    return (
      <DashboardShell>
        <StudentDashboard
          userId={profile.id}
          displayName={profile.display_name}
          level={profile.level}
          xpTotal={profile.xp_total}
          currentStreak={profile.current_streak}
        />
      </DashboardShell>
    );
  }

  if (profile.role === 'parent') {
    return (
      <DashboardShell>
        <ParentDashboard userId={profile.id} displayName={profile.display_name} />
      </DashboardShell>
    );
  }

  if (profile.role === 'teacher' && profile.school_id) {
    const tTeacher = await getTranslations('dashboard.teacher');
    return (
      <DashboardShell
        wide
        topbarRight={
          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-numoria-gray bg-white px-4 py-2 text-sm font-bold text-numoria-grafito transition hover:border-numoria-indigo hover:text-numoria-indigo"
          >
            <span aria-hidden>⚙️</span>
            <span className="hidden sm:inline">{tTeacher('settings')}</span>
          </Link>
        }
      >
        <TeacherDashboard
          userId={profile.id}
          displayName={profile.display_name}
          schoolId={profile.school_id}
        />
      </DashboardShell>
    );
  }

  // Admin u otros casos → landing (su dashboard llega en Phase 4)
  return <Landing />;
}
