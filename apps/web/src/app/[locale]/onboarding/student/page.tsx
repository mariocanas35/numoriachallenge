import { Button, NumaAvatar } from '@numoria/ui';
import { setRequestLocale } from 'next-intl/server';

/**
 * Shell del onboarding de estudiante.
 *
 * El flow real (edad, grado, país, escuela opcional) se construye en Chunk 2.3.
 * Por ahora es solo un placeholder visual que confirma que el router funciona.
 */
export default async function StudentOnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <NumaAvatar pose="wave" size="2xl" animateIn />

      <h1 className="font-display text-3xl font-bold text-numoria-ink sm:text-4xl">
        🎓 ¡Bienvenido, estudiante!
      </h1>

      <p className="max-w-md text-numoria-mid">
        Vamos a personalizar tu experiencia. Te haremos unas preguntas rápidas sobre tu edad, grado
        y país.
      </p>

      <div className="w-full rounded-xl border-2 border-dashed border-numoria-gray bg-numoria-cloud/50 p-6 text-left">
        <p className="text-sm font-semibold text-numoria-ink">🚧 Próximamente (Chunk 2.3):</p>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-numoria-mid">
          <li>Selección de país (auto-detectado)</li>
          <li>Año y mes de nacimiento (no día completo)</li>
          <li>Grado escolar (1-12)</li>
          <li>Escuela opcional (selector o &quot;unirse después con código&quot;)</li>
        </ul>
      </div>

      <Button variant="ghost" size="md" disabled>
        Continuar (próximo chunk)
      </Button>
    </div>
  );
}
