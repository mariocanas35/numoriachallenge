'use client';

import { useRouter } from '@/i18n/navigation';
import { openContestSession } from '@/lib/contests/actions';
import { Button } from '@numoria/ui';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

interface OpenSessionButtonProps {
  contestId: string;
  /** Teams del teacher elegibles para abrir session. Si solo 1, skipear el modal. */
  teams: Array<{ id: string; name: string; division: 'elementary' | 'middle' }>;
  /** Duración default del contest (min). Para placeholder. */
  defaultDurationMinutes: number;
  /** Label del botón en el card. */
  label: string;
}

/**
 * Botón de teacher que abre una contest_session para uno de sus teams.
 *
 * Flow:
 * 1. Click → si solo 1 team, abre directamente
 * 2. Si múltiples teams → modal con dropdown team selection + duration override
 * 3. Confirma → server action openContestSession
 * 4. Success → router.refresh() para que la card cambie de estado
 * 5. Error → muestra mensaje inline
 *
 * Duration: default = contest.duration_minutes. Teacher puede override pero
 * el helper recorta al outer calendar window.
 */
export function OpenSessionButton({
  contestId,
  teams,
  defaultDurationMinutes,
  label,
}: OpenSessionButtonProps) {
  const router = useRouter();
  const t = useTranslations('contests.card.openSession');
  const [open, setOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string>(teams[0]?.id ?? '');
  const [duration, setDuration] = useState<number>(defaultDurationMinutes);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    setError(null);
    if (teams.length === 0) {
      setError(t('noTeams'));
      return;
    }
    if (teams.length === 1) {
      // Direct open con defaults
      submitOpen(teams[0]?.id ?? '', defaultDurationMinutes);
      return;
    }
    setOpen(true);
  };

  const submitOpen = (teamId: string, durationMin: number) => {
    setError(null);
    startTransition(async () => {
      const result = await openContestSession({
        contestId,
        teamId,
        durationMinutes: durationMin,
      });
      if (!result.ok) {
        setError(result.message ?? t('errorGeneric'));
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="primary"
        size="md"
        fullWidth
        onClick={handleClick}
        disabled={isPending || teams.length === 0}
      >
        {isPending ? t('opening') : `🎯 ${label}`}
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-xs text-numoria-coral">
          {error}
        </p>
      )}

      {/* Modal: solo aparece si hay múltiples teams */}
      {open && teams.length > 1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-numoria-ink/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-card">
            <h2 className="font-display text-lg font-bold text-numoria-ink">{t('modalTitle')}</h2>
            <p className="mt-1 text-sm text-numoria-mid">{t('modalSubtitle')}</p>

            <label className="mt-4 block">
              <span className="text-xs font-bold uppercase tracking-wider text-numoria-mid">
                {t('teamLabel')}
              </span>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="mt-1 w-full rounded-md border-2 border-numoria-niebla/40 bg-white px-3 py-2 text-sm text-numoria-ink focus:border-numoria-orange focus:outline-none"
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-4 block">
              <span className="text-xs font-bold uppercase tracking-wider text-numoria-mid">
                {t('durationLabel')}
              </span>
              <input
                type="number"
                min={5}
                max={180}
                value={duration}
                onChange={(e) =>
                  setDuration(Number.parseInt(e.target.value, 10) || defaultDurationMinutes)
                }
                className="mt-1 w-full rounded-md border-2 border-numoria-niebla/40 bg-white px-3 py-2 text-sm text-numoria-ink focus:border-numoria-orange focus:outline-none"
              />
              <span className="mt-1 block text-xs italic text-numoria-mid">
                {t('durationHint', { defaultMin: defaultDurationMinutes })}
              </span>
            </label>

            {error && (
              <p role="alert" className="mt-3 text-sm text-numoria-coral">
                {error}
              </p>
            )}

            <div className="mt-5 flex gap-3">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => {
                  setOpen(false);
                  setError(null);
                }}
                disabled={isPending}
              >
                {t('cancel')}
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => submitOpen(selectedTeam, duration)}
                disabled={isPending || !selectedTeam}
              >
                {isPending ? t('opening') : `🎯 ${t('confirm')}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
