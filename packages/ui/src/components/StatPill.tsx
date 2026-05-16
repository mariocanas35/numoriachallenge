import type * as React from 'react';
import { cn } from '../lib/cn';

/**
 * StatPill — píldora inline con ícono (emoji o ReactNode) + texto.
 *
 * Pensada para mostrar estadísticas glanceables en headers/heroes
 * sin ocupar el espacio de stat cards completas. Variantes con tinte
 * suave del color principal + texto del mismo tono más saturado.
 *
 * @example
 * <StatPill icon="🔥" variant="coral">12 días</StatPill>
 * <StatPill icon="🏆" variant="dorado">4 contests</StatPill>
 * <StatPill icon="⭐" variant="teal">87 estudiantes</StatPill>
 */
export interface StatPillProps {
  /** Ícono (emoji o componente) que aparece a la izquierda */
  icon?: React.ReactNode;
  /** Color base del pill */
  variant?: 'orange' | 'indigo' | 'teal' | 'dorado' | 'coral';
  /** Contenido textual */
  children: React.ReactNode;
  /** Tamaño visual */
  size?: 'sm' | 'md';
  className?: string;
}

const variantClasses = {
  orange: 'bg-numoria-orange/10 text-numoria-orange',
  indigo: 'bg-numoria-indigo/10 text-numoria-indigo',
  teal: 'bg-numoria-teal/15 text-[#0d8278]', // teal oscuro para legibilidad
  dorado: 'bg-numoria-dorado/15 text-[#a86e08]', // dorado oscuro
  coral: 'bg-numoria-coral/15 text-[#c1245c]', // coral oscuro
} as const;

const sizeClasses = {
  sm: 'px-2.5 py-1 text-xs gap-1',
  md: 'px-3.5 py-1.5 text-sm gap-1.5',
} as const;

export function StatPill({
  icon,
  variant = 'orange',
  children,
  size = 'md',
  className,
}: StatPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-sans font-bold',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {icon && <span aria-hidden>{icon}</span>}
      {children}
    </span>
  );
}
