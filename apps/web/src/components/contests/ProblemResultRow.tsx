import { MathContent } from '@/components/contests/MathContent';

export interface ProblemResultData {
  problemId: string;
  position: number;
  stars: 1 | 2 | 3;
  pointsMax: number;
  // Localized content — el row picks el locale al render
  titleEs: string;
  titleEn: string;
  bodyEs: string;
  bodyEn: string;
  explanationEs: string | null;
  explanationEn: string | null;
  diagramCaptionEs: string | null;
  diagramCaptionEn: string | null;
  // Diagram
  hasDiagram: boolean;
  diagramSvgUrl: string | null;
  // Answer state
  expectedAnswer: string;
  answerSubmitted: string | null;
  /** null = el student dejó en blanco; true/false = corrected */
  isCorrect: boolean | null;
  pointsEarned: number;
}

interface ProblemResultRowProps {
  data: ProblemResultData;
  locale: 'es' | 'en';
  /** Labels traducidos — el row es server component (no usa useTranslations). */
  labels: {
    problemLabel: string;
    yourAnswer: string;
    correctAnswer: string;
    unanswered: string;
    explanationLabel: string;
    statusCorrect: string;
    statusWrong: string;
    statusUnanswered: string;
  };
}

/**
 * Row con el resultado de un problema post-submit.
 *
 * Server Component — usa MathContent (que también es server, vía katex.renderToString)
 * y no necesita interactividad. Color-coded por estado:
 *
 *   - ✅ Correcto → border teal, header teal, area tinted
 *   - ❌ Incorrecto → border coral, header coral, area tinted
 *   - — Sin responder → border niebla, header niebla, area cloud
 *
 * Cada row muestra: enunciado (con KaTeX), diagrama opcional, tu respuesta vs
 * respuesta correcta lado a lado en mono font, y la explicación con KaTeX.
 *
 * El field `pointsEarned / pointsMax` aparece en el header derecho como badge.
 */
export function ProblemResultRow({ data, locale, labels }: ProblemResultRowProps) {
  const body = locale === 'es' ? data.bodyEs : data.bodyEn;
  const explanation = locale === 'es' ? data.explanationEs : data.explanationEn;
  const diagramCaption = locale === 'es' ? data.diagramCaptionEs : data.diagramCaptionEn;
  const titleCategory = locale === 'es' ? data.titleEs : data.titleEn;

  const status: 'correct' | 'wrong' | 'unanswered' =
    data.isCorrect === null ? 'unanswered' : data.isCorrect ? 'correct' : 'wrong';

  const config = {
    correct: {
      border: 'border-numoria-teal',
      bg: 'bg-numoria-teal/5',
      headerBg: 'bg-numoria-teal',
      icon: '✅',
      label: labels.statusCorrect,
    },
    wrong: {
      border: 'border-numoria-coral',
      bg: 'bg-numoria-coral/5',
      headerBg: 'bg-numoria-coral',
      icon: '❌',
      label: labels.statusWrong,
    },
    unanswered: {
      border: 'border-numoria-niebla/40',
      bg: 'bg-numoria-cloud',
      headerBg: 'bg-numoria-niebla',
      icon: '—',
      label: labels.statusUnanswered,
    },
  } as const;

  const c = config[status];
  const starsLabel = '⭐'.repeat(data.stars);

  return (
    <article className={`overflow-hidden rounded-xl border-2 ${c.border} ${c.bg}`}>
      {/* Header colored — left: posición + stars + categoría; right: status + puntos */}
      <header
        className={`flex flex-col gap-2 ${c.headerBg} px-4 py-2 sm:flex-row sm:items-center sm:justify-between`}
      >
        <div className="flex items-center gap-3">
          <p className="text-sm font-bold text-white">
            {labels.problemLabel} {data.position} {starsLabel}
          </p>
          <p className="text-xs font-bold uppercase tracking-wider text-white/80">
            {titleCategory}
          </p>
        </div>
        <p className="font-mono text-sm font-bold text-white">
          {c.icon} {c.label} · {data.pointsEarned} / {data.pointsMax}
        </p>
      </header>

      <div className="flex flex-col gap-4 p-5">
        {/* Body del problema (recap) */}
        <div className="text-sm leading-relaxed text-numoria-mid">
          <MathContent text={body} />
        </div>

        {/* Diagrama opcional */}
        {data.hasDiagram && data.diagramSvgUrl && (
          <div className="flex flex-col items-center gap-1 rounded-md border-2 border-dashed border-numoria-niebla/40 bg-white p-3">
            <img
              src={data.diagramSvgUrl}
              alt={diagramCaption ?? 'Diagrama'}
              className="max-h-40 object-contain"
            />
            {diagramCaption && <p className="text-xs italic text-numoria-mid">{diagramCaption}</p>}
          </div>
        )}

        {/* Tu respuesta vs Correcta */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border-2 border-numoria-niebla/30 bg-white p-3">
            <p className="text-xs font-bold uppercase tracking-wider text-numoria-mid">
              {labels.yourAnswer}
            </p>
            <p
              className={`mt-1 break-words font-mono text-base ${
                status === 'unanswered'
                  ? 'italic text-numoria-niebla'
                  : status === 'correct'
                    ? 'font-bold text-numoria-teal'
                    : 'text-numoria-coral line-through decoration-2'
              }`}
            >
              {data.answerSubmitted ?? labels.unanswered}
            </p>
          </div>
          <div className="rounded-md border-2 border-numoria-teal/30 bg-numoria-teal/5 p-3">
            <p className="text-xs font-bold uppercase tracking-wider text-numoria-mid">
              {labels.correctAnswer}
            </p>
            <p className="mt-1 break-words font-mono text-base font-bold text-numoria-teal">
              {data.expectedAnswer}
            </p>
          </div>
        </div>

        {/* Explicación con KaTeX */}
        {explanation && (
          <div className="rounded-md border-2 border-numoria-orange/20 bg-white p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-numoria-orange">
              💡 {labels.explanationLabel}
            </p>
            <div className="text-sm leading-relaxed text-numoria-ink">
              <MathContent text={explanation} />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
