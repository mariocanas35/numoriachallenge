import { createServerClient } from '@numoria/database/server';
import { getTranslations } from 'next-intl/server';

/**
 * Sección "Colegios bilingües de LatAm — público objetivo + verificados".
 *
 * Comportamiento dinámico (decisión founder 2026-05-25):
 *   1. Query schools WHERE verified=true (max 6 más recientes)
 *   2. Si hay ≥ TARGET_COUNT verifieds → solo verifieds (sin disclaimer)
 *   3. Si hay 0-N verifieds donde N<TARGET → verifieds + representativos hasta TARGET
 *   4. Si hay 0 verifieds → solo representativos (con disclaimer claro)
 *
 * Esto permite que tan pronto como un colegio real se inscribe y se verifica
 * en la BD, aparezca automáticamente en la landing pública — sin re-deploy.
 *
 * Representativos: colegios bilingües reconocidos de LatAm que son nuestro
 * público objetivo. NO son clientes actuales (se aclara con disclaimer).
 */

const TARGET_COUNT = 6;

interface SchoolCard {
  key: string;
  name: string;
  city: string;
  countryCode: string;
  flag: string;
  countryName: string;
  logoUrl: string | null;
  isVerified: boolean;
}

interface RepresentativeSchool {
  name: string;
  city: string;
  countryCode: string;
}

/**
 * Lista de colegios bilingües representativos del público objetivo.
 * Selección 2026-05-25: 1 por ciudad/país para mostrar diversidad LatAm.
 */
const representativeSchools: RepresentativeSchool[] = [
  {
    name: 'Escuela Internacional Sampedrana',
    city: 'San Pedro Sula',
    countryCode: 'HN',
  },
  {
    name: 'Greengates School',
    city: 'Ciudad de México',
    countryCode: 'MX',
  },
  {
    name: 'Colegio Americano de Monterrey',
    city: 'Monterrey',
    countryCode: 'MX',
  },
  {
    name: 'Colegio Nueva Granada',
    city: 'Bogotá',
    countryCode: 'CO',
  },
  {
    name: 'Colegio Menor San Francisco de Quito',
    city: 'Quito',
    countryCode: 'EC',
  },
];

/** Nombre del país en español por country_code ISO 3166-1 alpha-2. */
const COUNTRY_NAMES: Record<string, string> = {
  HN: 'Honduras',
  MX: 'México',
  GT: 'Guatemala',
  CR: 'Costa Rica',
  SV: 'El Salvador',
  NI: 'Nicaragua',
  PA: 'Panamá',
  CO: 'Colombia',
  EC: 'Ecuador',
  PE: 'Perú',
  CL: 'Chile',
  AR: 'Argentina',
  UY: 'Uruguay',
  PY: 'Paraguay',
  BO: 'Bolivia',
  VE: 'Venezuela',
  DO: 'República Dominicana',
  US: 'Estados Unidos',
  ES: 'España',
  BR: 'Brasil',
};

/** Tints rotativos para diferenciar visualmente los cards. */
const TINTS = [
  'bg-numoria-blue/10',
  'bg-numoria-orange/10',
  'bg-numoria-green/10',
  'bg-numoria-purple/10',
  'bg-numoria-yellow/10',
  'bg-numoria-teal/10',
];

/** Convierte country code ISO a emoji bandera (works for any 2-letter code). */
function countryCodeToFlag(code: string): string {
  if (!code || code.length !== 2) return '🏳️';
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

/** Fetch escuelas verificadas reales de la BD. */
async function fetchVerifiedSchools(): Promise<SchoolCard[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('schools')
    .select('id, name, city, country_code, logo_url')
    .eq('verified', true)
    .order('created_at', { ascending: false })
    .limit(TARGET_COUNT);

  const rows =
    (data as Array<{
      id: string;
      name: string;
      city: string | null;
      country_code: string;
      logo_url: string | null;
    }> | null) ?? [];

  return rows.map((s) => ({
    key: `verified-${s.id}`,
    name: s.name,
    city: s.city ?? '',
    countryCode: s.country_code,
    flag: countryCodeToFlag(s.country_code),
    countryName: COUNTRY_NAMES[s.country_code] ?? s.country_code,
    logoUrl: s.logo_url,
    isVerified: true,
  }));
}

export async function SchoolsSection() {
  const t = await getTranslations('landing.schools');

  // 1. Fetch escuelas verificadas (reales en BD)
  const verifiedSchools = await fetchVerifiedSchools();

  // 2. Decidir qué mostrar:
  //    - Si hay ≥ TARGET verifieds → solo verifieds
  //    - Si hay menos → completar con representativos
  const needed = Math.max(0, TARGET_COUNT - verifiedSchools.length);
  const representativesNeeded: SchoolCard[] =
    needed > 0
      ? representativeSchools.slice(0, needed).map((s, i) => ({
          key: `rep-${i}`,
          name: s.name,
          city: s.city,
          countryCode: s.countryCode,
          flag: countryCodeToFlag(s.countryCode),
          countryName: COUNTRY_NAMES[s.countryCode] ?? s.countryCode,
          logoUrl: null,
          isVerified: false,
        }))
      : [];

  const schoolsToShow: SchoolCard[] = [...verifiedSchools, ...representativesNeeded];
  const hasAnyRepresentative = representativesNeeded.length > 0;

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
          {schoolsToShow.map((school, idx) => (
            <li
              key={school.key}
              className={`flex items-center gap-4 rounded-xl ${TINTS[idx % TINTS.length]} p-5 ring-1 ring-numoria-gray transition-shadow hover:shadow-card`}
            >
              {school.logoUrl ? (
                <img
                  src={school.logoUrl}
                  alt={`Logo de ${school.name}`}
                  className="h-12 w-12 shrink-0 rounded-lg bg-white object-contain p-1 shadow-sm"
                />
              ) : (
                <span aria-hidden="true" className="text-3xl">
                  {school.flag}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-display font-semibold text-numoria-ink">
                  {school.name}
                  {school.isVerified && (
                    <span
                      className="ml-1.5 inline-flex h-4 w-4 items-center justify-center align-text-bottom text-numoria-blue"
                      title="Colegio verificado en Numoria"
                      aria-label="Verificado"
                    >
                      ✓
                    </span>
                  )}
                </p>
                <p className="text-sm text-numoria-mid">
                  {school.city ? `${school.city}, ${school.countryName}` : school.countryName}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {/* Disclaimer: solo si hay al menos un representativo (no son todos clientes) */}
        {hasAnyRepresentative && (
          <p className="mt-8 text-center text-xs italic text-numoria-mid">
            <span aria-hidden="true">✨</span> Numoria está en su edición inaugural. Los colegios
            bilingües reconocidos de LatAm aún no inscritos son nuestro público objetivo. Los que
            tienen ✓ ya son socios verificados.
          </p>
        )}
      </div>
    </section>
  );
}
