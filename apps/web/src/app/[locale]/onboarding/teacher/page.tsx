import { Button, NumaAvatar } from '@numoria/ui';
import { setRequestLocale } from 'next-intl/server';

/**
 * Shell del onboarding de profesor.
 *
 * El flow real (registrar escuela, branding, equipo, invitar estudiantes)
 * se construye en Chunk 2.5 y Chunk 2.6.
 */
export default async function TeacherOnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <NumaAvatar pose="think" size="2xl" animateIn />

      <h1 className="font-display text-3xl font-bold text-numoria-ink sm:text-4xl">
        👩‍🏫 ¡Hola, profesor!
      </h1>

      <p className="max-w-md text-numoria-mid">
        Vamos a registrar tu escuela y crear tu primer equipo. Luego compartes el código de
        invitación con tus estudiantes.
      </p>

      <div className="w-full rounded-xl border-2 border-dashed border-numoria-gray bg-numoria-cloud/50 p-6 text-left">
        <p className="text-sm font-semibold text-numoria-ink">🚧 Próximamente:</p>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-numoria-mid">
          <li>
            <strong>Chunk 2.5:</strong> Datos de tu escuela (nombre, ciudad, país, logo, color
            institucional)
          </li>
          <li>
            <strong>Chunk 2.6:</strong> Crear tu primer equipo + obtener invite code para compartir
          </li>
        </ul>
      </div>

      <Button variant="ghost" size="md" disabled>
        Continuar (próximo chunk)
      </Button>
    </div>
  );
}
