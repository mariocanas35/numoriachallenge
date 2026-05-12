'use client';

import { useRouter } from '@/i18n/navigation';
import { grantContestRetry } from '@/lib/contests/actions';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

interface GrantRetryButtonProps {
  contestAttemptId: string;
  studentName: string;
}

/**
 * Botón pequeño en cada row del leaderboard que permite al teacher otorgar
 * otro intento a un student.
 *
 * Flow:
 * 1. Click → abre modal de confirmación con student name
 * 2. Confirm → server action grantContestRetry
 *    - Borra contest_attempts (CASCADE limpia problem_attempts)
 *    - Append audit log a session.notes
 * 3. router.refresh() → leaderboard se re-fetch sin el student (re-aparece
 *    cuando re-toma)
 * 4. Error → muestra inline
 *
 * Solo se renderiza si entry.canGrantRetry === true (session sigue open +
 * attempt tiene session_id).
 */
export function GrantRetryButton({ contestAttemptId, studentName }: GrantRetryButtonProps) {
  const router = useRouter();
  const t = useTranslations('contests.leaderboard.grantRetry');
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await grantContestRetry({ contestAttemptId });
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
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={isPending}
        title={t('tooltip')}
        className="inline-flex items-center gap-1 rounded-md border-2 border-numoria-coral/40 bg-white px-2 py-1 text-xs font-bold text-numoria-coral transition hover:bg-numoria-coral/10 disabled:opacity-50"
      >
        🔁 {isPending ? t('resetting') : t('reset')}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-numoria-ink/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-card">
            <h2 className="font-display text-lg font-bold text-numoria-ink">{t('modalTitle')}</h2>
            <p className="mt-2 text-sm text-numoria-mid">{t('modalBody', { studentName })}</p>
            <p className="mt-3 rounded-md border-2 border-numoria-coral/30 bg-numoria-coral/5 p-3 text-xs text-numoria-coral">
              ⚠️ {t('warningDestructive')}
            </p>

            {error && (
              <p role="alert" className="mt-3 text-sm text-numoria-coral">
                {error}
              </p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setError(null);
                }}
                disabled={isPending}
                className="rounded-md border-2 border-numoria-niebla/40 bg-white px-4 py-2 text-sm font-bold text-numoria-mid hover:bg-numoria-cloud"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isPending}
                className="rounded-md bg-numoria-coral px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? t('resetting') : `🔁 ${t('confirm')}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
