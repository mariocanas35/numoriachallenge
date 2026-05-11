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
  return (
    <NumaBase>
      {/* Eyes — open, looking forward */}
      <circle cx="40" cy="50" r="4" fill={INK} />
      <circle cx="60" cy="50" r="4" fill={INK} />
      <circle cx="41.5" cy="48.5" r="1.3" fill={BELLY} />
      <circle cx="61.5" cy="48.5" r="1.3" fill={BELLY} />
      {/* Nose */}
      <ellipse cx="50" cy="60" rx="2.5" ry="1.8" fill={INK} />
      {/* Smile */}
      <path
        d="M 44 67 Q 50 72 56 67"
        stroke={INK}
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
      {/* Waving paw */}
      <ellipse
        cx="86"
        cy="32"
        rx="6.5"
        ry="9"
        fill={FUR}
        stroke={FUR_DARK}
        strokeWidth="1.5"
        transform="rotate(-25 86 32)"
      />
      <ellipse cx="86" cy="29" rx="3" ry="4" fill={BELLY} transform="rotate(-25 86 29)" />
    </NumaBase>
  );
}

function NumaThink() {
  return (
    <NumaBase>
      {/* Eyes — looking up-right (thinking) */}
      <circle cx="42" cy="49" r="4" fill={INK} />
      <circle cx="62" cy="49" r="4" fill={INK} />
      <circle cx="44" cy="47" r="1.3" fill={BELLY} />
      <circle cx="64" cy="47" r="1.3" fill={BELLY} />
      {/* Eyebrow raised */}
      <path
        d="M 56 42 Q 62 39 68 42"
        stroke={INK}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Nose */}
      <ellipse cx="50" cy="60" rx="2.5" ry="1.8" fill={INK} />
      {/* Slight pucker mouth (thinking) */}
      <ellipse cx="50" cy="68" rx="3" ry="2" fill={INK} />
      {/* Paw on chin */}
      <ellipse
        cx="62"
        cy="78"
        rx="6"
        ry="8"
        fill={FUR}
        stroke={FUR_DARK}
        strokeWidth="1.5"
        transform="rotate(-15 62 78)"
      />
      {/* Thought bubble */}
      <circle cx="80" cy="22" r="3" fill={BELLY} stroke={INK} strokeWidth="1" opacity="0.8" />
      <circle cx="86" cy="14" r="5" fill={BELLY} stroke={INK} strokeWidth="1" opacity="0.8" />
    </NumaBase>
  );
}

function NumaCelebrate() {
  return (
    <NumaBase>
      {/* Eyes — squinted with joy (^_^) */}
      <path
        d="M 36 50 Q 40 46 44 50"
        stroke={INK}
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 56 50 Q 60 46 64 50"
        stroke={INK}
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Nose */}
      <ellipse cx="50" cy="60" rx="2.5" ry="1.8" fill={INK} />
      {/* Big open mouth */}
      <path
        d="M 42 66 Q 50 78 58 66 Q 50 71 42 66 Z"
        fill={INK}
        stroke={INK}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path d="M 47 70 Q 50 73 53 70" fill="#FF6B7A" />
      {/* Both paws raised */}
      <ellipse
        cx="18"
        cy="28"
        rx="6"
        ry="9"
        fill={FUR}
        stroke={FUR_DARK}
        strokeWidth="1.5"
        transform="rotate(-30 18 28)"
      />
      <ellipse
        cx="82"
        cy="28"
        rx="6"
        ry="9"
        fill={FUR}
        stroke={FUR_DARK}
        strokeWidth="1.5"
        transform="rotate(30 82 28)"
      />
      {/* Sparkles */}
      <text x="14" y="14" fontSize="10" fill="#FBBF24">
        ✦
      </text>
      <text x="78" y="14" fontSize="10" fill="#FBBF24">
        ✦
      </text>
      <text x="50" y="10" fontSize="8" fill="#FBBF24">
        ✦
      </text>
    </NumaBase>
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
