import * as React from 'react';
import { cn } from '../lib/cn';

/**
 * Numa — la mascota oficial de Numoria Challenge.
 *
 * Zorro/coyote naranja inteligente y amigable. 4 poses iniciales en MVP.
 *
 * NOTA: SVGs actuales son PLACEHOLDERS inline simplificados.
 * Se reemplazarán por arte refinado (IA/artista) post-piloto.
 *
 * @example
 * <NumaAvatar pose="wave" size="xl" />
 * <NumaAvatar pose="celebrate" aria-label="Numa celebrando que ganaste" />
 */

export type NumaPose = 'wave' | 'think' | 'celebrate' | 'sad';
export type NumaSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const sizeMap: Record<NumaSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
  '2xl': 'w-40 h-40',
};

const poseLabels: Record<NumaPose, string> = {
  wave: 'Numa saludando',
  think: 'Numa pensando',
  celebrate: 'Numa celebrando',
  sad: 'Numa animándote a seguir',
};

export interface NumaAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  pose?: NumaPose;
  size?: NumaSize;
  /** Override del aria-label por defecto (útil para i18n). */
  'aria-label'?: string;
  /** Animación de entrada al montar el componente. */
  animateIn?: boolean;
}

const NumaAvatar = React.forwardRef<HTMLDivElement, NumaAvatarProps>(
  (
    { pose = 'wave', size = 'md', className, animateIn = false, 'aria-label': ariaLabel, ...props },
    ref,
  ) => {
    const label = ariaLabel ?? poseLabels[pose];
    return (
      <div
        ref={ref}
        role="img"
        aria-label={label}
        className={cn(
          'inline-block shrink-0',
          sizeMap[size],
          animateIn && 'animate-numa-bounce-in',
          className,
        )}
        {...props}
      >
        <NumaSVG pose={pose} />
      </div>
    );
  },
);
NumaAvatar.displayName = 'NumaAvatar';

/* ============================================
 * SVG renderer — un componente por pose (placeholders)
 * ============================================ */

function NumaSVG({ pose }: { pose: NumaPose }) {
  switch (pose) {
    case 'wave':
      return <NumaWave />;
    case 'think':
      return <NumaThink />;
    case 'celebrate':
      return <NumaCelebrate />;
    case 'sad':
      return <NumaSad />;
  }
}

// Colores oficiales del Manual de Marca v1.0
const FUR = '#F97316'; // Naranja Numa (Manual §03)
const FUR_DARK = '#EA580C';
const BELLY = '#FFFFFF';
const INK = '#1E1B4B'; // Índigo Medianoche — Manual §05: "Ojos grandes, expresivos, índigo"

function NumaBase({ children }: { children?: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
      focusable="false"
    >
      {/* Ears */}
      <polygon points="22,30 35,48 18,52" fill={FUR} />
      <polygon points="78,30 65,48 82,52" fill={FUR} />
      <polygon points="24,33 32,46 22,49" fill={BELLY} />
      <polygon points="76,33 68,46 78,49" fill={BELLY} />
      {/* Head */}
      <circle cx="50" cy="55" r="32" fill={FUR} stroke={FUR_DARK} strokeWidth="1.5" />
      {/* Belly/snout area */}
      <ellipse cx="50" cy="65" rx="18" ry="14" fill={BELLY} />
      {children}
    </svg>
  );
}

function NumaWave() {
  // Arte refinado de Numa (zorrito saludando) — reemplazó el SVG placeholder
  // el 2026-05-22. Archivo: apps/web/public/numa-wave.jpg
  return (
    <img
      src="/numa-wave.jpg"
      alt=""
      aria-hidden="true"
      className="h-full w-full object-contain"
      loading="lazy"
      decoding="async"
    />
  );
}

function NumaThink() {
  // Arte refinado de Numa (zorrito pensando con libro) — reemplazó el SVG
  // placeholder el 2026-05-25. Archivo: apps/web/public/numa-think.png
  return (
    <img
      src="/numa-think.png"
      alt=""
      aria-hidden="true"
      className="h-full w-full object-contain"
      loading="lazy"
      decoding="async"
    />
  );
}

function NumaCelebrate() {
  // Arte refinado de Numa (zorrito celebrando con medalla) — reemplazó el SVG
  // placeholder el 2026-05-25. Archivo: apps/web/public/numa-celebrate.png
  return (
    <img
      src="/numa-celebrate.png"
      alt=""
      aria-hidden="true"
      className="h-full w-full object-contain"
      loading="lazy"
      decoding="async"
    />
  );
}

function NumaSad() {
  return (
    <NumaBase>
      {/* Eyes — half-closed, sad */}
      <path
        d="M 36 52 Q 40 50 44 52"
        stroke={INK}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 56 52 Q 60 50 64 52"
        stroke={INK}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Eyebrows down */}
      <path
        d="M 32 45 Q 40 47 46 45"
        stroke={INK}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 54 45 Q 60 47 68 45"
        stroke={INK}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Nose */}
      <ellipse cx="50" cy="60" rx="2.5" ry="1.8" fill={INK} />
      {/* Sad mouth */}
      <path
        d="M 44 70 Q 50 65 56 70"
        stroke={INK}
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
      {/* Tear — teal (Manual §03 acento triste) */}
      <path d="M 40 56 Q 38 62 40 65 Q 42 62 40 56 Z" fill="#14B8A6" opacity="0.85" />
    </NumaBase>
  );
}

export { NumaAvatar };
