'use client';

import { CountdownTimer } from '@/components/contests/CountdownTimer';
import { ProblemCard, type ProblemCardData } from '@/components/contests/ProblemCard';
import { useRouter } from '@/i18n/navigation';
import { saveProblemAnswer, submitContest } from '@/lib/contests/actions';
import { Button } from '@numoria/ui';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useRef, useState, useTransition } from 'react';

interface ContestTakeViewProps {
  attemptId: string;
  contestId: string;
  contestTitleEs: string;
  contestTitleEn: string;
  endsAt: string; // ISO
  calculatorAllowed: boolean;
  problems: ProblemCardData[];
  /** Respuestas pre-llenadas (si el user ya empezó antes y regresa). */
  initialAnswers: Record<string, string>;
}

/**
 * Vista cliente para tomar un contest:
 * - Header sticky con título + timer + toggle ES/EN + botón submit
 * - 7 cards de problemas en scroll vertical
 * - Estado local: answers por problemId
 * - Autosave on blur por input (server action saveProblemAnswer)
 * - Submit final llama submitContest y redirige a /results
 */
export function ContestTakeView({
  attemptId,
  contestId,
  contestTitleEs,
  contestTitleEn,
  endsAt,
  calculatorAllowed,
  problems,
  initialAnswers,
}: ContestTakeViewProps) {
  const t = useTranslations('contests.take');
  const initialLocale = useLocale() as 'es' | 'en';
  const router = useRouter();

  const [locale, setLocale] = useState<'es' | 'en'>(initialLocale);
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Track de respuestas que aún no se han persistido (para autosave on blur)
  const dirtyAnswers = useRef<Set<string>>(new Set());

  const handleAnswerChange = (problemId: string, newValue: string) => {
    setAnswers((prev) => ({ ...prev, [problemId]: newValue }));
    dirtyAnswers.current.add(problemId);
  };

  const handleBlur = useCallback(
    async (problemId: string) => {
      if (!dirtyAnswers.current.has(problemId)) return;
      const answer = answers[problemId] ?? '';
      if (!answer.trim()) {
        dirtyAnswers.current.delete(problemId);
        return;
      }
      dirtyAnswers.current.delete(problemId);
      // Fire-and-forget save
      await saveProblemAnswer({
        contestAttemptId: attemptId,
        problemId,
        answer,
      });
    },
    [answers, attemptId],
  );

  const handleSubmit = () => {
    setShowConfirmDialog(false);
    setSubmitError(null);
    startSubmitTransition(async () => {
      // Asegurarse de persistir todas las dirty answers antes del submit final
      const pending = Array.from(dirtyAnswers.current);
      for (const problemId of pending) {
        const answer = answers[problemId] ?? '';
        if (answer.trim()) {
          await saveProblemAnswer({
            contestAttemptId: attemptId,
            problemId,
            answer,
          });
        }
      }
      dirtyAnswers.current.clear();

      // También guardar respuestas que no fueron tocadas pero que tenían valor
      // (de un attempt previo retomado). saveProblemAnswer es idempotente.
      for (const problemId of Object.keys(answers)) {
        const answer = answers[problemId];
        if (answer?.trim()) {
          await saveProblemAnswer({
            contestAttemptId: attemptId,
            problemId,
            answer,
          });
        }
      }

      const result = await submitContest(attemptId);
      if (!result.ok) {
        setSubmitError(result.message ?? t('submitError'));
        return;
      }
      router.replace(`/contests/${contestId}/results`);
    });
  };

  // Auto-submit ref-based para evitar re-renderizar CountdownTimer cada cambio.
  // Si el timer llega a 0, dispara el mismo flow de submit.
  const submitOnTimeoutRef = useRef<() => void>(() => {});
  submitOnTimeoutRef.current = () => {
    if (!isSubmitting) handleSubmit();
  };
  const handleTimeout = useCallback(() => {
    submitOnTimeoutRef.current();
  }, []);

  const answeredCount = problems.filter((p) => {
    const a = answers[p.problemId];
    return a !== undefined && a.trim().length > 0;
  }).length;

  const title = locale === 'es' ? contestTitleEs : contestTitleEn;

  return (
    <div className="flex flex-col gap-4">
      {/* Header sticky con timer + idioma + submit */}
      <header className="sticky top-0 z-20 flex flex-col gap-3 rounded-xl border-2 border-numoria-blue bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-lg font-bold text-numoria-ink sm:text-xl">{title}</h1>
          <p className="text-xs text-numoria-mid">
            {t('answered', { answered: answeredCount, total: problems.length })} ·{' '}
            {calculatorAllowed ? t('withCalc') : t('noCalc')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Locale toggle */}
          <div className="flex items-center rounded-md border-2 border-numoria-gray bg-white p-0.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setLocale('es')}
              className={`rounded px-3 py-1 ${
                locale === 'es' ? 'bg-numoria-blue text-white' : 'text-numoria-mid'
              }`}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => setLocale('en')}
              className={`rounded px-3 py-1 ${
                locale === 'en' ? 'bg-numoria-blue text-white' : 'text-numoria-mid'
              }`}
            >
              EN
            </button>
          </div>

          <CountdownTimer endsAt={endsAt} onTimeout={handleTimeout} />

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => setShowConfirmDialog(true)}
            disabled={isSubmitting}
          >
            {isSubmitting ? t('submitting') : t('submit')}
          </Button>
        </div>
      </header>

      {/* Problemas */}
      <div className="flex flex-col gap-4">
        {problems.map((problem) => (
          <div key={problem.problemId} onBlur={() => handleBlur(problem.problemId)}>
            <ProblemCard
              data={problem}
              locale={locale}
              currentAnswer={answers[problem.problemId] ?? ''}
              onChange={(v) => handleAnswerChange(problem.problemId, v)}
              disabled={isSubmitting}
            />
          </div>
        ))}
      </div>

      {/* Footer: submit button repetido para mobile */}
      <div className="mt-2 flex flex-col gap-3">
        <Button
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => setShowConfirmDialog(true)}
          disabled={isSubmitting}
        >
          {isSubmitting ? t('submitting') : `🏁 ${t('submit')}`}
        </Button>
        {submitError && (
          <p role="alert" className="text-center text-sm text-numoria-red">
            {submitError}
          </p>
        )}
      </div>

      {/* Confirmación modal */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-numoria-ink/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-card">
            <h2 className="font-display text-lg font-bold text-numoria-ink">{t('confirmTitle')}</h2>
            <p className="mt-2 text-sm text-numoria-mid">
              {t('confirmBody', { answered: answeredCount, total: problems.length })}
            </p>
            <div className="mt-5 flex gap-3">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setShowConfirmDialog(false)}
              >
                {t('confirmCancel')}
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {t('confirmSubmit')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
