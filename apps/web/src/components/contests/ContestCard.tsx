import { OpenSessionButton } from '@/components/contests/OpenSessionButton';
import { Link } from '@/i18n/navigation';
import { Button } from '@numoria/ui';
import { useFormatter, useLocale, useTranslations } from 'next-intl';

export type ContestState =
  | 'active' // status=active y dentro del window, NO attempt todavía
  | 'in-progress' // hay attempt sin submit
  | 'completed' // attempt submitted
  | 'upcoming' // status=scheduled o active pero scheduled_at > now
  | 'expired'; // status=closed o window passed

export interface ContestCardData {
  id: string;
  slug: string;
  contestNumber: number;
  seasonYear: number;
  division: 'elementary' | 'middle';
  titleEs: string;
  titleEn: string;
  scheduledAt: string; // ISO timestamp
  durationMinutes: number;
  calculatorAllowed: boolean;
  numProblems: number;
  /** State derivado del status del contest + del attempt del student */
  state: ContestState;
  /** Solo si state === 'completed' (student view) */
  yourScore?: number;
  yourMaxScore?: number;
  /** True si esta es la división recomendada para el student */
  isYourDivision: boolean;
  /** Si está presente, renderiza en modo "teacher view": muestra agregados del
   *  team en lugar de yourScore, y CTA "Ver leaderboard" en vez de "Empezar". */
  teacherStats?: {
    submittedCount: number;
    totalMembers: number;
    avgScore: number | null;
  };
  /** Phase 4 — Si está presente, hay una session 'open' para uno de los teams
   *  del teacher. Muestra badge "Sesión abierta hasta XX". */
  teacherOpenSession?: {
    sessionId: string;
    teamId: string;
    closesAt: string;
  };
  /** Phase 4 — Teams del teacher para el dropdown del modal OpenSessionButton. */
  teacherTeams?: Array<{ id: string; name: string; division: 'elementary' | 'middle' }>;
}

interface ContestCardProps {
  data: ContestCardData;
}

/**
 * Card visual para un contest, server-component-friendly (recibe data pre-computed).
 * Display:
 * - Header: Contest # + Division chip + "Tu división" badge si aplica
 * - Title bilingüe (selecciona según locale)
 * - Specs: # problemas, duración, con/sin calc
 * - State badge + CTA contextual según state
 */
export function ContestCard({ data }: ContestCardProps) {
  const t = useTranslations('contests.card');
  const locale = useLocale() as 'es' | 'en';
  const format = useFormatter();

  const title = locale === 'es' ? data.titleEs : data.titleEn;
  const divisionLabel = data.division === 'elementary' ? t('divisionE') : t('divisionM');

  const stateColors: Record<ContestState, { border: string; bg: string; chip: string }> = {
    active: {
      border: 'border-numoria-green',
      bg: 'bg-numoria-green/5',
      chip: 'bg-numoria-green text-white',
    },
    'in-progress': {
      border: 'border-numoria-blue',
      bg: 'bg-numoria-blue/5',
      chip: 'bg-numoria-blue text-white',
    },
    completed: {
      border: 'border-numoria-mid',
      bg: 'bg-numoria-cloud',
      chip: 'bg-numoria-ink text-white',
    },
    upcoming: {
      border: 'border-numoria-yellow',
      bg: 'bg-numoria-yellow/5',
      chip: 'bg-numoria-yellow text-numoria-ink',
    },
    expired: {
      border: 'border-numoria-gray',
      bg: 'bg-white',
      chip: 'bg-numoria-gray text-numoria-mid',
    },
  };

  const colors = stateColors[data.state];

  return (
    <article className={`rounded-xl border-2 ${colors.border} ${colors.bg} p-5`}>
      {/* Header */}
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-numoria-mid">
            {t('contestNumber', { number: data.contestNumber })} ·{' '}
            {t('season', { year: data.seasonYear })}
          </p>
          <h3 className="mt-1 font-display text-lg font-bold text-numoria-ink">{title}</h3>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
              data.isYourDivision
                ? 'bg-numoria-blue text-white'
                : 'bg-numoria-gray text-numoria-mid'
            }`}
          >
            {divisionLabel}
          </span>
          {data.isYourDivision && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-numoria-blue">
              ★ {t('yourDivisionBadge')}
            </span>
          )}
        </div>
      </header>

      {/* Specs */}
      <div className="mb-4 flex flex-wrap gap-2 text-xs text-numoria-mid">
        <span className="rounded-md bg-white px-2 py-1 ring-1 ring-numoria-gray">
          {t('problemCount', { count: data.numProblems })}
        </span>
        <span className="rounded-md bg-white px-2 py-1 ring-1 ring-numoria-gray">
          {t('duration', { min: data.durationMinutes })}
        </span>
        <span className="rounded-md bg-white px-2 py-1 ring-1 ring-numoria-gray">
          {data.calculatorAllowed ? t('withCalc') : t('noCalc')}
        </span>
      </div>

      {/* State info + CTA */}
      {data.state === 'upcoming' && (
        <p className="mb-3 text-sm text-numoria-mid">
          {t('scheduledFor', {
            date: format.dateTime(new Date(data.scheduledAt), {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              hour: 'numeric',
              minute: 'numeric',
            }),
          })}
        </p>
      )}

      {/* === TEACHER VIEW (teacherStats presente) === */}
      {data.teacherStats && (
        <>
          {/* Línea de stats agregados */}
          <p className="mb-3 text-sm text-numoria-ink">
            {t('teacherStats.submittedRatio', {
              submitted: data.teacherStats.submittedCount,
              total: data.teacherStats.totalMembers,
            })}
            {data.teacherStats.avgScore !== null && (
              <span className="ml-2 font-semibold text-numoria-orange">
                · {t('teacherStats.avgScore', { score: data.teacherStats.avgScore.toFixed(1) })}
              </span>
            )}
          </p>

          {/* Badge: sesión abierta — solo si Phase 4 session activa */}
          {data.teacherOpenSession && (
            <p className="mb-3 text-xs font-bold text-numoria-teal">
              {t('teacherStats.sessionOpenUntil', {
                time: format.dateTime(new Date(data.teacherOpenSession.closesAt), {
                  hour: 'numeric',
                  minute: 'numeric',
                }),
              })}
            </p>
          )}

          {/* CTA contextual del teacher view:
              - upcoming → ghost preview (no actions yet)
              - active sin session → "Abrir sesión" (MOEMS Phase 4)
              - active con session abierta → "Ver leaderboard"
              - completed/expired → "Ver leaderboard" */}
          {data.state === 'upcoming' ? (
            <Button variant="ghost" size="md" fullWidth disabled>
              {t('ctaPreview')}
            </Button>
          ) : data.state === 'active' && !data.teacherOpenSession && data.teacherTeams ? (
            <OpenSessionButton
              contestId={data.id}
              teams={data.teacherTeams}
              defaultDurationMinutes={data.durationMinutes}
              label={t('ctaOpenSession')}
            />
          ) : (
            <Button variant="primary" size="md" fullWidth asChild>
              <Link href={`/contests/${data.id}/leaderboard`}>📊 {t('ctaViewLeaderboard')}</Link>
            </Button>
          )}
        </>
      )}

      {/* === STUDENT VIEW (sin teacherStats) === */}
      {!data.teacherStats && (
        <>
          {data.state === 'completed' && data.yourScore !== undefined && data.yourMaxScore && (
            <p className="mb-3 text-sm font-semibold text-numoria-ink">
              {t('yourScore', { score: data.yourScore, max: data.yourMaxScore })}
            </p>
          )}

          {data.state === 'active' && data.isYourDivision && (
            <Button variant="primary" size="lg" fullWidth asChild>
              <Link href={`/contests/${data.id}`}>{t('ctaStart')}</Link>
            </Button>
          )}
          {data.state === 'in-progress' && (
            <Button variant="primary" size="lg" fullWidth asChild>
              <Link href={`/contests/${data.id}`}>{t('ctaContinue')}</Link>
            </Button>
          )}
          {data.state === 'completed' && (
            <Button variant="outline" size="md" fullWidth asChild>
              <Link href={`/contests/${data.id}/results`}>{t('ctaResults')}</Link>
            </Button>
          )}
          {data.state === 'expired' && (
            <Button variant="ghost" size="md" fullWidth asChild>
              <Link href={`/contests/${data.id}`}>{t('ctaPreview')}</Link>
            </Button>
          )}
          {data.state === 'active' && !data.isYourDivision && (
            <Button variant="ghost" size="md" fullWidth disabled>
              {t('otherDivision')}
            </Button>
          )}
          {data.state === 'upcoming' && (
            <Button variant="ghost" size="md" fullWidth disabled>
              {t('ctaPreview')}
            </Button>
          )}
        </>
      )}
    </article>
  );
}
