'use client';

import { MathContent } from '@/components/contests/MathContent';
import type { Database } from '@numoria/database/types';

export type AnswerType = Database['public']['Enums']['answer_type'];

export interface ProblemCardData {
  problemId: string;
  position: number;
  stars: 1 | 2 | 3;
  categoryEs: string;
  categoryEn: string;
  bodyEs: string;
  bodyEn: string;
  formatDirectiveEs: string | null;
  formatDirectiveEn: string | null;
  hasDiagram: boolean;
  diagramSvgUrl: string | null;
  diagramCaptionEs: string | null;
  diagramCaptionEn: string | null;
  answerType: AnswerType;
  /** Hint visible para el input según answer_type (e.g., "ej: 42" o "ej: 1.40, 1.60"). */
  inputHint: string;
}

interface ProblemCardProps {
  data: ProblemCardData;
  locale: 'es' | 'en';
  currentAnswer: string;
  onChange: (newAnswer: string) => void;
  /** Si true, deshabilita el input (post-submit). */
  disabled?: boolean;
}

/**
 * Card para un problema individual dentro del contest take view.
 * Color-coded por stars: verde (1), ámbar (2), rojo (3).
 * Bilingüe: muestra body en el locale seleccionado.
 */
export function ProblemCard({ data, locale, currentAnswer, onChange, disabled }: ProblemCardProps) {
  const body = locale === 'es' ? data.bodyEs : data.bodyEn;
  const category = locale === 'es' ? data.categoryEs : data.categoryEn;
  const directive = locale === 'es' ? data.formatDirectiveEs : data.formatDirectiveEn;
  const diagramCaption = locale === 'es' ? data.diagramCaptionEs : data.diagramCaptionEn;

  // Color por stars (verde / ámbar / rojo)
  const starsConfig = {
    1: {
      border: 'border-numoria-green',
      bg: 'bg-numoria-green/5',
      headerBg: 'bg-numoria-green',
      stars: '⭐',
    },
    2: {
      border: 'border-numoria-orange',
      bg: 'bg-numoria-orange/5',
      headerBg: 'bg-numoria-orange',
      stars: '⭐⭐',
    },
    3: {
      border: 'border-numoria-red',
      bg: 'bg-numoria-red/5',
      headerBg: 'bg-numoria-red',
      stars: '⭐⭐⭐',
    },
  } as const;

  const config = starsConfig[data.stars];

  return (
    <article className={`overflow-hidden rounded-xl border-2 ${config.border} ${config.bg}`}>
      {/* Header colored bar */}
      <header className={`flex items-center justify-between gap-3 ${config.headerBg} px-4 py-2`}>
        <p className="text-sm font-bold text-white">
          {locale === 'es' ? 'Problema' : 'Problem'} {data.position} {config.stars}
        </p>
        <p className="text-xs font-bold uppercase tracking-wider text-white/80">{category}</p>
      </header>

      <div className="flex flex-col gap-3 p-5">
        {/* Body con KaTeX */}
        <div className="text-sm leading-relaxed text-numoria-ink">
          <MathContent text={body} />
        </div>

        {/* Directiva de formato (opcional, italic) */}
        {directive && <p className="text-xs italic text-numoria-mid">{directive}</p>}

        {/* Diagrama (opcional) */}
        {data.hasDiagram && (
          <div className="flex flex-col items-center gap-1 rounded-md border-2 border-dashed border-numoria-gray bg-white p-3">
            {data.diagramSvgUrl ? (
              <img
                src={data.diagramSvgUrl}
                alt={diagramCaption ?? 'Diagrama'}
                className="max-h-40 object-contain"
              />
            ) : (
              <div className="flex h-24 items-center justify-center text-2xl text-numoria-gray">
                📐
              </div>
            )}
            {diagramCaption && <p className="text-xs italic text-numoria-mid">{diagramCaption}</p>}
          </div>
        )}

        {/* Input de respuesta */}
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-numoria-ink">
            {locale === 'es' ? 'Respuesta' : 'Answer'}
          </span>
          <input
            type="text"
            value={currentAnswer}
            onChange={(e) => onChange(e.target.value)}
            placeholder={data.inputHint}
            disabled={disabled}
            autoComplete="off"
            spellCheck={false}
            className="rounded-md border-2 border-numoria-gray bg-white px-4 py-3 font-mono text-base text-numoria-ink placeholder:font-sans placeholder:text-numoria-mid focus-visible:border-numoria-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-numoria-blue/30 disabled:bg-numoria-cloud disabled:text-numoria-mid"
            aria-label={`Respuesta al problema ${data.position}`}
          />
        </label>
      </div>
    </article>
  );
}

/**
 * Hint placeholder para el input según answer_type.
 */
export function inputHintForType(type: AnswerType, locale: 'es' | 'en'): string {
  const ej = locale === 'es' ? 'Ej:' : 'E.g.:';
  switch (type) {
    case 'integer':
      return `${ej} 42`;
    case 'pair_integer':
      return `${ej} 3, 5`;
    case 'pair_decimal':
      return `${ej} 1.40, 1.60`;
    case 'decimal_cents':
      return `${ej} 1.40`;
    case 'fraction_simplified':
      return `${ej} 3/8`;
    case 'symbolic_pi':
      return `${ej} 12π`;
    case 'with_units':
      return locale === 'es' ? 'Incluye unidades' : 'Include units';
    case 'multiple_choice':
      return `${ej} A`;
    default:
      return '';
  }
}
