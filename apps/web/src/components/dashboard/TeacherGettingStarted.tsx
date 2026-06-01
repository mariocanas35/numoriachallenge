import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

/**
 * Guía de "Primeros pasos" para profesores nuevos (sin equipos aún).
 * Explica qué son las competencias + para qué niveles, y los 4 pasos para
 * arrancar. Se muestra en el dashboard del profesor solo cuando teams.length === 0.
 * Server Component.
 */
export async function TeacherGettingStarted() {
  const t = await getTranslations('dashboard.teacherStart');

  const steps = [
    { n: 1, icon: '👥', text: t('step1') },
    { n: 2, icon: '🔗', text: t('step2') },
    { n: 3, icon: '🎓', text: t('step3') },
    { n: 4, icon: '🏆', text: t('step4') },
  ];

  return (
    <section className="relative rounded-[18px] border-2 border-numoria-indigo/20 bg-white p-6 shadow-[0_1px_0_rgba(30,27,75,0.02),0_10px_28px_-20px_rgba(30,27,75,0.18)] sm:p-7">
      <h2 className="font-display text-lg font-bold text-numoria-indigo sm:text-xl">
        👋 {t('title')}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-numoria-mid sm:text-base">{t('intro')}</p>

      <ol className="mt-5 grid gap-3 sm:grid-cols-2">
        {steps.map((s) => (
          <li key={s.n} className="flex items-start gap-3 rounded-xl bg-numoria-indigo/5 p-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-numoria-indigo text-sm font-bold text-white">
              {s.n}
            </span>
            <span className="text-sm text-numoria-ink">
              <span className="mr-1" aria-hidden="true">
                {s.icon}
              </span>
              {s.text}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href="/teams/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-numoria-orange px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-numoria-orange/90"
        >
          👥 {t('ctaCreateTeam')}
        </Link>
        <Link
          href="/summer-bowl"
          className="inline-flex items-center justify-center gap-2 text-sm font-bold text-numoria-indigo hover:underline"
        >
          {t('ctaLearnMore')} →
        </Link>
      </div>
    </section>
  );
}
