'use client';

import { useRouter } from '@/i18n/navigation';
import { type PaperEntryRow, submitPaperBatch } from '@/lib/contests/actions';
import { Button } from '@numoria/ui';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

export interface PaperEntryStudent {
  id: string;
  displayName: string;
  grade: number | null;
  /** True si el student YA tiene attempt (online o paper) — el form lo skipea. */
  hasExistingAttempt: boolean;
}

export interface PaperEntryProblem {
  id: string;
  position: number;
  stars: 1 | 2 | 3;
  category: string;
  /** Pista de formato para placeholder del input. */
  inputHint: string;
}

interface PaperEntryFormProps {
  sessionId: string;
  contestId: string;
  students: PaperEntryStudent[];
  problems: PaperEntryProblem[];
  /** Labels traducidos pre-resueltos en el server. */
  labels: {
    headerStudent: string;
    headerGrade: string;
    alreadySubmitted: string;
    submitBatch: string;
    submitting: string;
    successTitle: string;
    successBody: string;
    errorTitle: string;
    skippedTitle: string;
    skipReason: Record<string, string>;
    gradeFormat: string;
    backToContests: string;
    confirmTitle: string;
    confirmBody: string;
    confirmCancel: string;
    confirmSubmit: string;
  };
}

type AnswersByStudent = Record<string, Record<string, string>>;

/**
 * Form tabular para que teacher transcriba respuestas de paper.
 *
 * Layout:
 *   Filas: cada student del team (los que ya tienen attempt aparecen disabled)
 *   Columnas: cada problema del contest (input por celda)
 *
 * State: AnswersByStudent { [studentId]: { [problemId]: answer } }
 *
 * Flow:
 *   1. Teacher llena celdas (puede dejar vacías)
 *   2. Botón "Submit batch" → modal confirmación con conteo
 *   3. Confirma → server action submitPaperBatch
 *   4. Success → muestra results panel + opción "volver a contests"
 *   5. Error → muestra mensaje inline
 */
export function PaperEntryForm({
  sessionId,
  contestId,
  students,
  problems,
  labels,
}: PaperEntryFormProps) {
  const router = useRouter();
  const t = useTranslations('contests.paperEntry');
  const [answers, setAnswers] = useState<AnswersByStudent>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Awaited<ReturnType<typeof submitPaperBatch>> | null>(null);
  const [isPending, startTransition] = useTransition();

  const updateAnswer = (studentId: string, problemId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] ?? {}), [problemId]: value },
    }));
  };

  // Conteo de students con al menos una respuesta llenada (no vacía)
  const filledStudentsCount = students.filter(
    (s) =>
      !s.hasExistingAttempt &&
      answers[s.id] !== undefined &&
      Object.values(answers[s.id] ?? {}).some((v) => v.trim() !== ''),
  ).length;

  const handleSubmit = () => {
    setShowConfirm(false);
    setError(null);
    setResult(null);

    // Construir entries — solo students sin attempt existente y con al menos
    // una respuesta llenada
    const entries: PaperEntryRow[] = students
      .filter((s) => !s.hasExistingAttempt && answers[s.id])
      .map((s) => ({
        studentId: s.id,
        answers: answers[s.id] ?? {},
      }))
      .filter((e) => Object.values(e.answers).some((v) => v.trim() !== ''));

    if (entries.length === 0) {
      setError(t('errorNoEntries'));
      return;
    }

    startTransition(async () => {
      const r = await submitPaperBatch({ sessionId, contestId, entries });
      if (!r.ok) {
        setError(r.message ?? t('errorGeneric'));
        return;
      }
      setResult(r);
      // No router.refresh todavía — dejamos al teacher ver el resultado
    });
  };

  // Si tenemos result, mostrar panel de éxito
  if (result?.ok && result.data) {
    return (
      <div className="flex flex-col gap-6">
        <div className="rounded-xl border-2 border-numoria-teal bg-numoria-teal/5 p-6">
          <h2 className="font-display text-xl font-bold text-numoria-ink">
            ✅ {labels.successTitle}
          </h2>
          <p className="mt-2 text-sm text-numoria-mid">
            {labels.successBody
              .replace('{processed}', String(result.data.studentsProcessed))
              .replace('{skipped}', String(result.data.studentsSkipped))}
          </p>

          {result.data.details.length > 0 && (
            <div className="mt-4 overflow-hidden rounded-md border-2 border-numoria-niebla/30 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-numoria-cloud text-xs font-bold uppercase tracking-wider text-numoria-mid">
                  <tr>
                    <th className="px-3 py-2 text-left">{labels.headerStudent}</th>
                    <th className="px-3 py-2 text-right">Score</th>
                    <th className="px-3 py-2 text-right">Correctos</th>
                    <th className="px-3 py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-numoria-niebla/20">
                  {result.data.details.map((d) => {
                    const student = students.find((s) => s.id === d.studentId);
                    return (
                      <tr key={d.studentId}>
                        <td className="px-3 py-2 font-medium text-numoria-ink">
                          {student?.displayName ?? d.studentId}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {d.skipped ? '—' : d.totalScore}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-numoria-mid">
                          {d.skipped ? '—' : d.totalCorrect}
                        </td>
                        <td className="px-3 py-2 text-right text-xs">
                          {d.skipped ? (
                            <span className="rounded-full bg-numoria-orange/15 px-2 py-0.5 font-bold text-numoria-orange">
                              {labels.skipReason[d.skipReason ?? 'unknown'] ?? d.skipReason}
                            </span>
                          ) : (
                            <span className="rounded-full bg-numoria-teal/15 px-2 py-0.5 font-bold text-numoria-teal">
                              ✓
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-5 flex gap-3">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => router.push(`/contests/${contestId}/leaderboard`)}
            >
              📊 Ver leaderboard
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => router.push('/contests')}
            >
              {labels.backToContests}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p
          role="alert"
          className="rounded-md bg-numoria-coral/10 px-4 py-3 text-sm text-numoria-coral"
        >
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border-2 border-numoria-niebla/30 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-numoria-cloud text-xs font-bold uppercase tracking-wider text-numoria-mid">
            <tr>
              <th className="sticky left-0 z-10 bg-numoria-cloud px-3 py-2 text-left">
                {labels.headerStudent}
              </th>
              {problems.map((p) => (
                <th key={p.id} className="whitespace-nowrap px-3 py-2 text-center">
                  <div className="text-numoria-ink">
                    P{p.position} {'⭐'.repeat(p.stars)}
                  </div>
                  <div className="text-[10px] font-normal normal-case text-numoria-mid">
                    {p.category}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-numoria-niebla/20">
            {students.map((student) => (
              <tr
                key={student.id}
                className={
                  student.hasExistingAttempt
                    ? 'bg-numoria-cloud/40 opacity-60'
                    : 'hover:bg-numoria-cloud/30'
                }
              >
                <td className="sticky left-0 z-10 bg-inherit px-3 py-2">
                  <div className="font-medium text-numoria-ink">{student.displayName}</div>
                  {student.grade !== null && (
                    <div className="text-xs text-numoria-mid">
                      {labels.gradeFormat.replace('{n}', String(student.grade))}
                    </div>
                  )}
                  {student.hasExistingAttempt && (
                    <div className="mt-1 inline-block rounded-full bg-numoria-niebla/20 px-2 py-0.5 text-[10px] font-bold uppercase text-numoria-mid">
                      {labels.alreadySubmitted}
                    </div>
                  )}
                </td>
                {problems.map((p) => (
                  <td key={p.id} className="px-2 py-2">
                    <input
                      type="text"
                      value={answers[student.id]?.[p.id] ?? ''}
                      onChange={(e) => updateAnswer(student.id, p.id, e.target.value)}
                      placeholder={p.inputHint}
                      disabled={student.hasExistingAttempt || isPending}
                      autoComplete="off"
                      spellCheck={false}
                      className="w-24 rounded-md border-2 border-numoria-niebla/40 bg-white px-2 py-1.5 text-center font-mono text-sm text-numoria-ink placeholder:text-numoria-niebla/60 focus:border-numoria-orange focus:outline-none disabled:bg-numoria-cloud disabled:text-numoria-mid"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-numoria-mid">
          {filledStudentsCount > 0
            ? t('readyCount', { count: filledStudentsCount })
            : t('emptyHint')}
        </p>
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={() => setShowConfirm(true)}
          disabled={isPending || filledStudentsCount === 0}
        >
          {isPending ? labels.submitting : `📝 ${labels.submitBatch}`}
        </Button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-numoria-ink/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-card">
            <h2 className="font-display text-lg font-bold text-numoria-ink">
              {labels.confirmTitle}
            </h2>
            <p className="mt-2 text-sm text-numoria-mid">
              {labels.confirmBody.replace('{count}', String(filledStudentsCount))}
            </p>
            <div className="mt-5 flex gap-3">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
              >
                {labels.confirmCancel}
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleSubmit}
                disabled={isPending}
              >
                {isPending ? labels.submitting : `📝 ${labels.confirmSubmit}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
