import { redirect } from 'next/navigation';

/**
 * /contests/officials — stub funcional Tarea 1.
 *
 * Por ahora redirige a /contests con anchor a la sección de oficiales.
 * En Tarea 3 esta página mostrará los 6 contests oficiales del ciclo
 * académico 2026-2027 con fechas, countdown, estado, y CTA para abrir
 * sesión MOEMS por equipo.
 *
 * Ref: memory soft-launch-plan.md "6 Contests oficiales — CICLO 2026-2027"
 */
export default async function OfficialsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/contests#officials`);
}
