import { cn } from '../lib/cn';

/**
 * ProgressRing — anillo SVG de progreso con número/etiqueta al centro.
 *
 * Metáfora visual estándar (Apple Watch, Duolingo daily goal). Más
 * motivante que una barra horizontal: la animación de "cerrarse" da
 * sensación de cumplimiento.
 *
 * @example
 * <ProgressRing value={3} max={5} label="prácticas" />
 * <ProgressRing value={420} max={1000} variant="indigo" size={120} />
 */
export interface ProgressRingProps {
  /** Valor actual de progreso */
  value: number;
  /** Valor máximo (denominador) */
  max: number;
  /** Diámetro del ring en px (default 100) */
  size?: number;
  /** Grosor del trazo en px (default 8) */
  strokeWidth?: number;
  /** Color del trazo */
  variant?: 'orange' | 'indigo' | 'teal' | 'dorado' | 'coral';
  /** Texto pequeño debajo del valor (ej: "XP", "prácticas") */
  label?: string;
  /** Si false, muestra solo el value (no "value/max") */
  showMax?: boolean;
  className?: string;
}

const strokeColors = {
  orange: 'var(--color-numoria-orange)',
  indigo: 'var(--color-numoria-indigo)',
  teal: 'var(--color-numoria-teal)',
  dorado: 'var(--color-numoria-dorado)',
  coral: 'var(--color-numoria-coral)',
} as const;

export function ProgressRing({
  value,
  max,
  size = 100,
  strokeWidth = 8,
  variant = 'orange',
  label,
  showMax = true,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeMax = Math.max(max, 1);
  const clampedValue = Math.max(0, Math.min(value, safeMax));
  const percentage = clampedValue / safeMax;
  const dashOffset = circumference * (1 - percentage);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        role="img"
        aria-label={`${value} de ${max} ${label ?? ''}`.trim()}
      >
        {/* Track (background ring) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-numoria-gray)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColors[variant]}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      {/* Centro: número grande + label opcional */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display font-bold text-numoria-grafito"
          style={{ fontSize: size * 0.24 }}
        >
          {showMax ? `${value}/${max}` : value}
        </span>
        {label && (
          <span
            className="font-sans uppercase tracking-wide text-numoria-niebla"
            style={{ fontSize: size * 0.1 }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
