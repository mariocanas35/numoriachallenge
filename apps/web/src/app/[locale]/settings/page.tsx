import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { ProfileForm } from '@/components/settings/ProfileForm';
import { SchoolForm } from '@/components/settings/SchoolForm';
import { Link } from '@/i18n/navigation';
import { createServerClient } from '@numoria/database/server';
import type { Tables } from '@numoria/database/types';
import { NumoriaLogo } from '@numoria/ui';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

type Profile = Tables<'profiles'>;
type School = Tables<'schools'>;

/**
 * /settings — Tarea 2 del plan recalibrado 2026-05-15.
 *
 * Cuatro secciones:
 *   1. 🏫 Mi escuela — name, country, city, address, phone, website (form)
 *      logo es read-only por ahora (upload se hará en iteración futura)
 *   2. ✅ Verificación — badge del estado verified + instrucciones
 *   3. 💳 Suscripción — placeholder estático (billing real es Phase 5b)
 *   4. 👤 Mi perfil — display_name, locale (form), email read-only
 *
 * Solo accesible para teachers (students no tienen escuela ni suscripción).
 */
export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('auth');
  const ts = await getTranslations('settings');

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

  // Solo teachers — students no tienen escuela ni billing
  if (profile.role !== 'teacher') {
    redirect(`/${locale}`);
  }

  // Fetch escuela del teacher (asumimos 1 escuela por teacher MVP)
  const { data: schoolRow } = await supabase
    .from('schools')
    .select('id, name, country_code, city, address, phone, website, logo_url, verified')
    .eq('created_by', user.id)
    .maybeSingle();

  const school = schoolRow as
    | (Pick<School, 'id' | 'name' | 'country_code' | 'city' | 'logo_url' | 'verified'> & {
        address: string | null;
        phone: string | null;
        website: string | null;
      })
    | null;

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
          <h1 className="font-display text-3xl font-bold text-numoria-grafito">{ts('title')}</h1>
          <p className="mt-2 text-sm text-numoria-mid">{ts('subtitle')}</p>
        </header>

        <div className="flex flex-col gap-6">
          {/* === 🏫 ESCUELA === */}
          <section className="rounded-2xl border-2 border-numoria-gray bg-white p-6">
            <h2 className="mb-1 flex items-center gap-2 font-display text-xl font-bold text-numoria-grafito">
              {ts('school.sectionTitle')}
            </h2>
            <p className="mb-5 text-sm text-numoria-mid">{ts('school.sectionDescription')}</p>
            {school ? (
              <SchoolForm
                initial={{
                  name: school.name,
                  country_code: school.country_code,
                  city: school.city,
                  address: school.address,
                  phone: school.phone,
                  website: school.website,
                  logo_url: school.logo_url,
                  verified: school.verified,
                }}
              />
            ) : (
              <p className="text-sm text-numoria-mid">{ts('school.noSchool')}</p>
            )}
          </section>

          {/* === ✅ VERIFICACIÓN === */}
          <section className="rounded-2xl border-2 border-numoria-gray bg-white p-6">
            <h2 className="mb-1 flex items-center gap-2 font-display text-xl font-bold text-numoria-grafito">
              {ts('verification.sectionTitle')}
            </h2>
            {school?.verified ? (
              <div className="mt-3 flex items-start gap-3 rounded-xl bg-numoria-teal/10 p-4">
                <span className="text-2xl" aria-hidden>
                  ✅
                </span>
                <div>
                  <p className="font-bold text-numoria-teal">{ts('verification.verifiedTitle')}</p>
                  <p className="mt-1 text-sm text-numoria-mid">
                    {ts('verification.verifiedDescription')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex items-start gap-3 rounded-xl bg-numoria-dorado/10 p-4">
                <span className="text-2xl" aria-hidden>
                  ⏳
                </span>
                <div className="flex-1">
                  <p className="font-bold text-numoria-grafito">
                    {ts('verification.pendingTitle')}
                  </p>
                  <p className="mt-1 text-sm text-numoria-mid">
                    {ts('verification.pendingDescriptionBefore')}
                    <a
                      href="mailto:hola@numoria.app"
                      className="font-bold text-numoria-orange underline-offset-2 hover:underline"
                    >
                      hola@numoria.app
                    </a>
                    {ts('verification.pendingDescriptionAfter')}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* === 💳 SUSCRIPCIÓN === */}
          <section className="rounded-2xl border-2 border-numoria-gray bg-white p-6">
            <h2 className="mb-1 flex items-center gap-2 font-display text-xl font-bold text-numoria-grafito">
              {ts('subscription.sectionTitle')}
            </h2>
            <p className="mb-5 text-sm text-numoria-mid">{ts('subscription.sectionDescription')}</p>
            <div className="rounded-xl bg-numoria-cloud p-5">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <p className="font-display text-2xl font-bold text-numoria-grafito">
                    {ts('subscription.planName')}
                  </p>
                  <p className="mt-1 text-sm text-numoria-mid">{ts('subscription.planSubtitle')}</p>
                </div>
                <span className="rounded-full bg-numoria-teal/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-numoria-teal">
                  {ts('subscription.priceBadge')}
                </span>
              </div>
              <ul className="mt-4 flex flex-col gap-1.5 text-sm text-numoria-mid">
                <li className="flex items-center gap-2">
                  <span className="text-numoria-teal">✓</span> {ts('subscription.feature1')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-numoria-teal">✓</span> {ts('subscription.feature2')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-numoria-teal">✓</span> {ts('subscription.feature3')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-numoria-teal">✓</span> {ts('subscription.feature4')}
                </li>
              </ul>
            </div>
            <p className="mt-4 rounded-xl border border-dashed border-numoria-orange/40 bg-numoria-orange/5 p-3 text-xs text-numoria-mid">
              {ts('subscription.comingSoonNote')}
            </p>
          </section>

          {/* === 👤 MI PERFIL === */}
          <section className="rounded-2xl border-2 border-numoria-gray bg-white p-6">
            <h2 className="mb-1 flex items-center gap-2 font-display text-xl font-bold text-numoria-grafito">
              {ts('profile.sectionTitle')}
            </h2>
            <p className="mb-5 text-sm text-numoria-mid">{ts('profile.sectionDescription')}</p>
            <ProfileForm
              initial={{
                display_name: profile.display_name,
                locale: profile.locale,
                email: user.email ?? '',
              }}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
