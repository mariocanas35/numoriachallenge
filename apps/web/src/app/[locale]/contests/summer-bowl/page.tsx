import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

/**
 * /contests/summer-bowl — El Summer Bowl 2026 ya terminó y su competencia está
 * archivada, así que esta entrada lleva siempre a los resultados oficiales.
 */
export default async function SummerBowlEntryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect(`/${locale}/summer-bowl/results`);
}
