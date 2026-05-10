import { getTranslations } from 'next-intl/server';

/**
 * Sección "Escuelas que confían en Numoria".
 *
 * Para el MVP, los logos son placeholders estilizados (cards con nombre +
 * color de marca) ya que aún no tenemos socios reales. Cuando se firmen
 * acuerdos con escuelas piloto, se reemplazarán por logos reales subidos
 * a Cloudflare R2 vía el panel admin.
 */

interface PlaceholderSchool {
  name: string;
  country: string;
  flag: string;
  /** Color de fondo decorativo para diferenciar visualmente. */
  tint: string;
}

const placeholderSchools: PlaceholderSchool[] = [
  { name: 'EIS Tegucigalpa', country: 'HN', flag: '🇭🇳', tint: 'bg-numoria-blue/10' },
  { name: 'Colegio Saint Paul', country: 'HN', flag: '🇭🇳', tint: 'bg-numoria-orange/10' },
  { name: 'Liceo Bilingüe', country: 'GT', flag: '🇬🇹', tint: 'bg-numoria-green/10' },
  { name: 'Colegio San José', country: 'CR', flag: '🇨🇷', tint: 'bg-numoria-purple/10' },
  { name: 'Instituto Mexicano', country: 'MX', flag: '🇲🇽', tint: 'bg-numoria-yellow/10' },
  { name: 'Colegio Andino', country: 'CO', flag: '🇨🇴', tint: 'bg-numoria-blue/10' },
];

export async function SchoolsSection() {
  const t = await getTranslations('landing.schools');

  return (
    <section className="bg-numoria-cloud" aria-labelledby="schools-heading">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="schools-heading"
            className="font-display text-3xl font-bold text-numoria-ink sm:text-4xl"
          >
            {t('title')}
          </h2>
          <p className="mt-4 text-numoria-mid">{t('subtitle')}</p>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label={t('title')}>
          {placeholderSchools.map((school) => (
            <li
              key={school.name}
              className={`flex items-center gap-4 rounded-xl ${school.tint} p-5 ring-1 ring-numoria-gray transition-shadow hover:shadow-card`}
            >
              <span aria-hidden="true" className="text-3xl">
                {school.flag}
              </span>
              <div>
                <p className="font-display font-semibold text-numoria-ink">{school.name}</p>
                <p className="text-sm text-numoria-mid">{school.country}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center text-xs text-numoria-mid">
          {/* Disclaimer honesto — son placeholders hasta cerrar acuerdos */}
          <span aria-hidden="true">✨</span>{' '}
          <em>Numoria está en piloto. Estos nombres son representativos del público objetivo.</em>
        </p>
      </div>
    </section>
  );
}
