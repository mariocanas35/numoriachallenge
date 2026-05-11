import type { LeaderboardEntry } from '@/lib/contests/leaderboard';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  labels: {
    rank: string;
    student: string;
    team: string;
    score: string;
    correct: string;
    time: string;
    status: string;
    submitted: string;
    inProgress: string;
    /** Formato de grado, ej "5° grado" / "Grade 5". {n} → número. */
    gradeFormat: string;
  };
}

/**
 * Tabla de leaderboard server-rendered.
 *
 * Sort fijo (score DESC, time ASC, submitted-first). El filter por team se hace
 * via URL query upstream — esto solo renderiza el subset ya filtrado.
 *
 * Top-3 reciben emoji medal (🥇🥈🥉). Resto: número en mono font.
 * Non-submitted: row con bg dim + status pill "En curso" naranja.
 */
export function LeaderboardTable({ entries, labels }: LeaderboardTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border-2 border-numoria-niebla/30 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-numoria-cloud text-xs font-bold uppercase tracking-wider text-numoria-mid">
          <tr>
            <th className="whitespace-nowrap px-3 py-2 text-left">{labels.rank}</th>
            <th className="px-3 py-2 text-left">{labels.student}</th>
            <th className="px-3 py-2 text-left">{labels.team}</th>
            <th className="whitespace-nowrap px-3 py-2 text-right">{labels.score}</th>
            <th className="whitespace-nowrap px-3 py-2 text-right">{labels.correct}</th>
            <th className="whitespace-nowrap px-3 py-2 text-right">{labels.time}</th>
            <th className="whitespace-nowrap px-3 py-2 text-right">{labels.status}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-numoria-niebla/20">
          {entries.map((e) => {
            const submitted = e.submittedAt !== null;
            const rankBadge =
              submitted && e.rank === 1
                ? '🥇'
                : submitted && e.rank === 2
                  ? '🥈'
                  : submitted && e.rank === 3
                    ? '🥉'
                    : null;
            const timeMin =
              e.timeSpentSeconds !== null ? Math.floor(e.timeSpentSeconds / 60) : null;
            const timeSec = e.timeSpentSeconds !== null ? e.timeSpentSeconds % 60 : null;
            return (
              <tr
                key={e.studentId}
                className={submitted ? 'hover:bg-numoria-cloud/50' : 'bg-numoria-cloud/30'}
              >
                <td className="whitespace-nowrap px-3 py-2 font-mono text-numoria-ink">
                  {rankBadge ?? <span className="text-numoria-mid">#{e.rank}</span>}
                </td>
                <td className="px-3 py-2">
                  <div className="font-medium text-numoria-ink">{e.studentName}</div>
                  {e.studentGrade !== null && (
                    <div className="text-xs text-numoria-mid">
                      {labels.gradeFormat.replace('{n}', String(e.studentGrade))}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2 text-xs text-numoria-mid">{e.teamName}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right">
                  <span
                    className={`font-mono font-bold ${
                      submitted ? 'text-numoria-ink' : 'text-numoria-niebla'
                    }`}
                  >
                    {e.totalScore}{' '}
                    <span className="text-xs text-numoria-mid">/ {e.maxPossibleScore}</span>
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-right font-mono text-numoria-mid">
                  {submitted ? e.totalCorrect : '—'}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-right font-mono text-numoria-mid">
                  {timeMin !== null && timeSec !== null
                    ? `${timeMin}:${String(timeSec).padStart(2, '0')}`
                    : '—'}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-right">
                  {submitted ? (
                    <span className="inline-block rounded-full bg-numoria-teal/15 px-2 py-0.5 text-xs font-bold text-numoria-teal">
                      ✓ {labels.submitted}
                    </span>
                  ) : (
                    <span className="inline-block rounded-full bg-numoria-orange/15 px-2 py-0.5 text-xs font-bold text-numoria-orange">
                      ⏳ {labels.inProgress}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
