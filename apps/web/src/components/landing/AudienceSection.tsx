import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

/**
 * Sección de la landing que le habla directo a los 3 públicos:
 * estudiantes, maestros y colegios. Cada tarjeta tiene su propuesta de valor
 * y su CTA al registro (los maestros/colegios pre-seleccionan el rol).
 */
export async function AudienceSection() {
  const t = await getTranslations('landing.audience');

  return (
    <section className="bg-white" aria-labelledby="audience-heading">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <h2
          id="audience-heading"
          className="text-center font-display text-3xl font-bold text-numoria-ink sm:text-4xl"
        >
          {t('title')}
        </h2>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {/* Estudiantes */}
          <article className="flex flex-col rounded-2xl bg-gradient-to-b from-numoria-blue/10 to-white p-8 shadow-card ring-2 ring-numoria-blue/20">
            <span className="text-5xl" aria-hidden="true">
              🎓
            </span>
            <h3 className="mt-4 font-display text-xl font-bold text-numoria-ink">
              {t('studentTitle')}
            </h3>
            <p className="mt-2 flex-1 text-numoria-mid">{t('studentBody')}</p>
            <Link
              href="/register"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-numoria-blue px-5 py-3 text-sm font-bold text-white transition hover:bg-numoria-blue/90"
            >
              {t('studentCta')}
            </Link>
          </article>

          {/* Maestros */}
          <article className="flex flex-col rounded-2xl bg-gradient-to-b from-numoria-orange/10 to-white p-8 shadow-card ring-2 ring-numoria-orange/20">
            <span className="text-5xl" aria-hidden="true">
              👩‍🏫
            </span>
            <h3 className="mt-4 font-display text-xl font-bold text-numoria-ink">
              {t('teacherTitle')}
            </h3>
            <p className="mt-2 flex-1 text-numoria-mid">{t('teacherBody')}</p>
            <Link
              href={{ pathname: '/register', query: { role: 'teacher' } }}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-numoria-orange px-5 py-3 text-sm font-bold text-white transition hover:bg-numoria-orange/90"
            >
              {t('teacherCta')}
            </Link>
          </article>

          {/* Colegios */}
          <article className="flex flex-col rounded-2xl bg-gradient-to-b from-numoria-indigo/10 to-white p-8 shadow-card ring-2 ring-numoria-indigo/20">
            <span className="text-5xl" aria-hidden="true">
              🏫
            </span>
            <h3 className="mt-4 font-display text-xl font-bold text-numoria-ink">
              {t('schoolTitle')}
            </h3>
            <p className="mt-2 flex-1 text-numoria-mid">{t('schoolBody')}</p>
            <Link
              href={{ pathname: '/register', query: { role: 'teacher' } }}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-numoria-indigo px-5 py-3 text-sm font-bold text-white transition hover:bg-numoria-indigo/90"
            >
              {t('schoolCta')}
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
