import { Footer } from '@/components/landing/Footer';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { SchoolsSection } from '@/components/landing/SchoolsSection';
import { setRequestLocale } from 'next-intl/server';

/**
 * Landing page MVP de Numoria Challenge.
 *
 * Composición:
 * 1. Hero — mascota Numa + CTA principales (registrarse / soy profesor)
 * 2. HowItWorks — 3 pasos visuales con poses distintas de Numa
 * 3. SchoolsSection — placeholders de escuelas piloto
 * 4. Footer — branding + links + LocaleSwitcher (ES/EN)
 *
 * Server component completo (sin client components excepto LocaleSwitcher
 * que es 'use client' por requerir interacción).
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <main className="min-h-dvh">
        <Hero />
        <HowItWorks />
        <SchoolsSection />
      </main>
      <Footer />
    </>
  );
}
