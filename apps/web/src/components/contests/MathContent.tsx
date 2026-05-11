import katex from 'katex';

interface MathContentProps {
  /** Texto con LaTeX inline ($...$) y/o block ($$...$$) embebidos. */
  text: string;
  /** Clase CSS opcional para el wrapper. */
  className?: string;
}

/**
 * Renderiza texto con LaTeX inline ($x^2 + y^2$) y block ($$ ... $$) usando KaTeX.
 *
 * Server Component-friendly: usa katex.renderToString para generar HTML estático.
 * Solo se inyecta dangerouslySetInnerHTML para las partes math (sanitizadas por KaTeX).
 * El resto del texto se renderiza como texto plano (no HTML).
 *
 * Convenciones:
 * - `$inline$` → `katex.renderToString({ displayMode: false })`
 * - `$$display$$` → `katex.renderToString({ displayMode: true })`
 * - Texto fuera de `$...$` → plain text (escapado por React)
 */
export function MathContent({ text, className }: MathContentProps) {
  // Split por display math ($$...$$) primero, luego por inline ($...$)
  // Regex que captura el delimitador junto al contenido
  const blockPattern = /(\$\$[^$]+?\$\$)/g;
  const inlinePattern = /(\$[^$\n]+?\$)/g;

  const blockSegments = text.split(blockPattern);

  // Pre-procesa todos los segmentos en una lista plana de {type, content} con
  // keys estables basadas en el contenido del segmento (no en índice).
  const flatSegments: Array<{
    type: 'block' | 'inline' | 'text';
    content: string;
    key: string;
  }> = [];
  for (const blockSeg of blockSegments) {
    if (blockSeg.startsWith('$$') && blockSeg.endsWith('$$') && blockSeg.length > 4) {
      flatSegments.push({
        type: 'block',
        content: blockSeg.slice(2, -2),
        key: `blk:${blockSeg}:${flatSegments.length}`,
      });
      continue;
    }
    for (const seg of blockSeg.split(inlinePattern)) {
      if (seg.startsWith('$') && seg.endsWith('$') && seg.length > 2) {
        flatSegments.push({
          type: 'inline',
          content: seg.slice(1, -1),
          key: `inl:${seg}:${flatSegments.length}`,
        });
      } else if (seg) {
        flatSegments.push({
          type: 'text',
          content: seg,
          key: `txt:${seg.slice(0, 20)}:${flatSegments.length}`,
        });
      }
    }
  }

  return (
    <span className={className}>
      {flatSegments.map((seg) => {
        if (seg.type === 'text') {
          return <span key={seg.key}>{seg.content}</span>;
        }
        const html = katex.renderToString(seg.content, {
          throwOnError: false,
          displayMode: seg.type === 'block',
          output: 'html',
        });
        return (
          <span
            key={seg.key}
            className={seg.type === 'block' ? 'my-2 block' : undefined}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: KaTeX output is sanitized
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </span>
  );
}
