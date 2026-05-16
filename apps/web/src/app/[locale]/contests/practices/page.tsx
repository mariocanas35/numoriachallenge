import { redirect } from 'next/navigation';

/**
 * /contests/practices — stub funcional Tarea 1.
 *
 * Por ahora redirige a /contests con un anchor a la sección de prácticas.
 * En Tarea 3 (folder pattern) esta página tendrá su propia UI con
 * Practice #1, #2, #3 en carpetas y las 3 versiones (E sin-calc,
 * M sin-calc, M con-calc) con íconos diferenciadores.
 *
 * Ref: memory soft-launch-plan.md "Plan de implementación 2026-05-15"
 */
export default async function PracticesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/contests#practices`);
}
