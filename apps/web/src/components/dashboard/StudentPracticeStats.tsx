import type { StudentPracticeStats as StudentPracticeStatsData } from '@/lib/contests/student-stats';

interface StudentPracticeStatsProps {
  stats: StudentPracticeStatsData;
}

/**
 * Sección de estadísticas de prácticas en el dashboard del estudiante.
 *
 * Layout:
 *   - 4 mini-cards arriba: Completadas, Promedio, Total, Mejor
 *   - Comparación con barras: Tú vs Equipo vs Nacional vs Global
 */
export function StudentPracticeStats({ stats }: StudentPracticeStatsProps) {
  const {
    practicesCompleted,
    totalPracticesAvailable,
    myAvgPercent,
    myTotalScore,
    myBestPercent,
    teamAvgPercent,
    nationalAvgPercent,
    globalAvgPercent,
  } = stats;

  // Para escalar las barras: el mayor valor define el 100% visual
  const maxComparePct = Math.max(
    myAvgPercent,
    teamAvgPercent ?? 0,
    nationalAvgPercent ?? 0,
    globalAvgPercent ?? 0,
    1, // evitar division by zero
  );

  return (
    <section className="rounded-xl border-2 border-numoria-indigo/20 bg-numoria-indigo/5 p-6">
      <header className="mb-5 flex items-center gap-2">
        <span className="text-xl" aria-hidden>
          📊
        </span>
        <h2 className="font-display text-lg font-bold text-numoria-ink">
          Tus estadísticas de prácticas
        </h2>
      </header>

      {/* Mini-cards row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatMiniCard
          label="Completadas"
          value={`${practicesCompleted} / ${totalPracticesAvailable}`}
          icon="✅"
          accent="green"
        />
        <StatMiniCard label="Promedio" value={`${myAvgPercent}%`} icon="📈" accent="indigo" />
        <StatMiniCard label="Total puntos" value={String(myTotalScore)} icon="⭐" accent="orange" />
        <StatMiniCard label="Mejor score" value={`${myBestPercent}%`} icon="🏆" accent="dorado" />
      </div>

      {/* Comparación */}
      <div className="mt-6">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-numoria-mid">
          Comparación con otros estudiantes
        </h3>
        <div className="space-y-2">
          <CompareBar label="Tú" percent={myAvgPercent} maxPercent={maxComparePct} isMe />
          <CompareBar
            label="Equipo"
            percent={teamAvgPercent}
            maxPercent={maxComparePct}
            emptyLabel="—"
          />
          <CompareBar
            label="Nacional"
            percent={nationalAvgPercent}
            maxPercent={maxComparePct}
            emptyLabel="—"
          />
          <CompareBar
            label="Global"
            percent={globalAvgPercent}
            maxPercent={maxComparePct}
            emptyLabel="—"
          />
        </div>
      </div>
    </section>
  );
}

type Accent = 'green' | 'indigo' | 'orange' | 'dorado';

function StatMiniCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: string;
  accent: Accent;
}) {
  const accentClasses = {
    green: 'border-numoria-green/30 bg-white',
    indigo: 'border-numoria-indigo/30 bg-white',
    orange: 'border-numoria-orange/30 bg-white',
    dorado: 'border-numoria-dorado/30 bg-white',
  }[accent];

  return (
    <div className={`flex flex-col gap-1 rounded-lg border-2 p-3 ${accentClasses}`}>
      <div className="flex items-center gap-1.5">
        <span className="text-base" aria-hidden>
          {icon}
        </span>
        <p className="text-[10px] font-bold uppercase tracking-wider text-numoria-mid">{label}</p>
      </div>
      <p className="font-display text-xl font-bold text-numoria-ink">{value}</p>
    </div>
  );
}

function CompareBar({
  label,
  percent,
  maxPercent,
  isMe,
  emptyLabel,
}: {
  label: string;
  percent: number | null;
  maxPercent: number;
  isMe?: boolean;
  emptyLabel?: string;
}) {
  const hasData = percent !== null;
  const visualPercent = hasData ? (percent / maxPercent) * 100 : 0;

  return (
    <div className="grid grid-cols-[80px_1fr_50px] items-center gap-3">
      <span
        className={`text-sm font-semibold ${isMe ? 'text-numoria-orange' : 'text-numoria-mid'}`}
      >
        {label}
        {isMe && ' 🦊'}
      </span>
      <div className="h-6 overflow-hidden rounded-full bg-white">
        <div
          className={`h-full rounded-full transition-all ${
            isMe ? 'bg-gradient-to-r from-numoria-orange to-numoria-coral' : 'bg-numoria-indigo/50'
          }`}
          style={{ width: `${visualPercent}%` }}
        />
      </div>
      <span
        className={`text-right font-display text-sm font-bold ${
          isMe ? 'text-numoria-orange' : 'text-numoria-ink'
        }`}
      >
        {hasData ? `${percent}%` : (emptyLabel ?? '—')}
      </span>
    </div>
  );
}
