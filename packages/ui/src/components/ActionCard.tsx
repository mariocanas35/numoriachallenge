import * as React from 'react';
import { cn } from '../lib/cn';

/**
 * ActionCard — card con bloque de color superior + ícono circular
 * flotante sobre el bloque + body con título/descripción/metadata.
 *
 * Patrón visual estándar de apps móviles modernas (Duolingo, Khan
 * Academy). Más memorable y escaneable que una card plana con texto.
 *
 * Variantes de color usan los acentos canónicos del Manual de Marca
 * Numoria (mismas tintes que StatPill).
 *
 * Para navegación, envuelve con un Link externo (next-intl, next/link):
 *
 * @example
 * <Link href="/contests" className="block">
 *   <ActionCard
 *     variant="teal"
 *     title="Prácticas"
 *     description="5 tests disponibles ahora"
 *     icon="🎯"
 *     metadata="3 activas hoy"
 *   />
 * </Link>
 */
export interface ActionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Color del bloque superior */
  variant?: 'orange' | 'indigo' | 'teal' | 'dorado' | 'coral';
  /** Ícono dentro del círculo flotante (emoji o ReactNode) */
  icon: React.ReactNode;
  /** Título principal */
  title: string;
  /** Descripción 1-2 líneas */
  description?: string;
  /** Texto pequeño abajo (ej: "3 activos hoy") */
  metadata?: string;
}

const blockColors = {
  orange: 'bg-numoria-orange',
  indigo: 'bg-numoria-indigo',
  teal: 'bg-numoria-teal',
  dorado: 'bg-numoria-dorado',
  coral: 'bg-numoria-coral',
} as const;

const borderColors = {
  orange: 'border-numoria-orange',
  indigo: 'border-numoria-indigo',
  teal: 'border-numoria-teal',
  dorado: 'border-numoria-dorado',
  coral: 'border-numoria-coral',
} as const;

const metadataColors = {
  orange: 'text-numoria-orange',
  indigo: 'text-numoria-indigo',
  teal: 'text-[#0d8278]',
  dorado: 'text-[#a86e08]',
  coral: 'text-[#c1245c]',
} as const;

export const ActionCard = React.forwardRef<HTMLDivElement, ActionCardProps>(
  ({ variant = 'orange', icon, title, description, metadata, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'group block overflow-hidden rounded-2xl bg-white shadow-sm',
          'transition-all duration-150',
          'hover:-translate-y-0.5 hover:shadow-lg',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-numoria-orange focus-visible:ring-offset-2',
          className,
        )}
        {...props}
      >
        {/* Color block superior */}
        <div className={cn('h-14 w-full', blockColors[variant])} />

        {/* Body */}
        <div className="p-5">
          {/* Ícono circular flotando sobre el block */}
          <div
            className={cn(
              'mb-3 -mt-10 flex h-14 w-14 items-center justify-center rounded-full',
              'border-2 bg-white text-2xl shadow-sm',
              borderColors[variant],
            )}
            aria-hidden
          >
            {icon}
          </div>

          {/* Título */}
          <h3 className="font-display text-lg font-bold text-numoria-grafito">{title}</h3>

          {/* Descripción opcional */}
          {description && (
            <p className="mt-1 text-sm text-numoria-mid line-clamp-2">{description}</p>
          )}

          {/* Metadata footer opcional */}
          {metadata && (
            <p
              className={cn(
                'mt-3 text-xs font-bold uppercase tracking-wide',
                metadataColors[variant],
              )}
            >
              {metadata}
            </p>
          )}
        </div>
      </div>
    );
  },
);
ActionCard.displayName = 'ActionCard';
