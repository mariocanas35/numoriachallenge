import { Button, NumaAvatar } from '@numoria/ui';
import { setRequestLocale } from 'next-intl/server';

/**
 * Shell del onboarding de padre/madre.
 *
 * El flow real (datos personales, agregar hijos, consentimiento parental
 * verificable) se construye en Chunk 2.4.
 */
export default async function ParentOnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <NumaAvatar pose="celebrate" size="2xl" animateIn />

      <h1 className="font-display text-3xl font-bold text-numoria-ink sm:text-4xl">
        👨‍👩‍👧 ¡Hola, mamá o papá!
      </h1>

      <p className="max-w-md text-numoria-mid">
        Vamos a configurar tu cuenta y agregar a tus hijos para que puedan competir.
      </p>

      <div className="w-full rounded-xl border-2 border-dashed border-numoria-gray bg-numoria-cloud/50 p-6 text-left">
        <p className="text-sm font-semibold text-numoria-ink">🚧 Próximamente (Chunk 2.4):</p>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-numoria-mid">
          <li>Tu nombre completo y país</li>
          <li>Agregar hasta 4 hijos (nombre, edad, grado)</li>
          <li>Email de cada hijo (magic link de activación)</li>
          <li>Aceptación de consentimiento parental (COPPA-aware)</li>
        </ul>
      </div>

      <Button variant="ghost" size="md" disabled>
        Continuar (próximo chunk)
      </Button>
    </div>
  );
}
