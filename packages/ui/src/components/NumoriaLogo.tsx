import * as React from 'react';
import { cn } from '../lib/cn';

/**
 * Wordmark oficial Numoria Challenge — Manual de Marca v1.0 §02
 *
 * Composición:
 *   Numoria.        ← Fraunces Black, tracking -3%, dot en Naranja Numa
 *   C H A L L E N G E ← Plus Jakarta Sans, uppercase, tracking amplio
 *
 * Variantes:
 * - 'horizontal' (default): para web header, factura, firma de correo
 * - 'stacked': para app launch, certificado, póster
 * - 'wordmark-only': solo "Numoria." sin tagline (espacios reducidos)
 *
 * El tamaño se controla por la clase wrapper (text-2xl, text-3xl, etc.)
 *
 * @example
 * <NumoriaLogo />                          // default horizontal
 * <NumoriaLogo variant="stacked" />        // para hero
 * <NumoriaLogo variant="wordmark-only" />  // sin "CHALLENGE"
 * <NumoriaLogo className="text-3xl" />     // tamaño custom
 */

export type NumoriaLogoVariant = 'horizontal' | 'stacked' | 'wordmark-only';

export interface NumoriaLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: NumoriaLogoVariant;
  /** Color del wordmark. Default: heredado del padre (currentColor en text-numoria-grafito). */
  inverse?: boolean;
}

const NumoriaLogo = React.forwardRef<HTMLDivElement, NumoriaLogoProps>(
  ({ variant = 'horizontal', inverse = false, className, ...props }, ref) => {
    const wordmarkColor = inverse ? 'text-numoria-bone' : 'text-numoria-grafito';

    return (
      <div
        ref={ref}
        className={cn('inline-flex flex-col leading-none', className)}
        aria-label="Numoria Challenge"
        {...props}
      >
        {/* Wordmark "Numoria." */}
        <span
          className={cn(
            'font-display font-extrabold tracking-tight',
            wordmarkColor,
            // Tracking -3% según Manual §02
            '[letter-spacing:-0.03em]',
          )}
        >
          Numoria<span className="text-numoria-orange">.</span>
        </span>

        {/* Tagline "CHALLENGE" — solo en variantes con tagline */}
        {variant !== 'wordmark-only' && (
          <span
            className={cn(
              'mt-0.5 font-sans text-[0.4em] font-medium uppercase',
              // Tracking amplio para distinguir del wordmark
              '[letter-spacing:0.4em]',
              inverse ? 'text-numoria-bone/70' : 'text-numoria-niebla',
            )}
          >
            Challenge
          </span>
        )}
      </div>
    );
  },
);
NumoriaLogo.displayName = 'NumoriaLogo';

export { NumoriaLogo };
