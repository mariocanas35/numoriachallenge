import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../lib/cn';

/**
 * Button3D — variante "chunky" con sombra de profundidad estilo Duolingo.
 *
 * Diferencias con `Button`:
 * - `box-shadow` inferior de 6px (vs border-b-4) crea ilusión de
 *   profundidad más pronunciada
 * - `active:translate-y-[4px]` da feedback táctil fuerte ("clic real")
 * - `rounded-2xl` (más redondeado) + `uppercase` para look juguetón
 * - Paleta canónica Numa (naranja primary + acentos del Manual de Marca)
 *
 * Cuándo usar Button3D vs Button:
 * - Button3D — CTA principal de una página, hero, call-to-action grande
 * - Button — botones secundarios, formularios, navegación
 *
 * @example
 * <Button3D variant="primary">Empezar contest</Button3D>
 * <Button3D variant="success" size="lg">Enviar respuestas</Button3D>
 */
const button3dVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-display font-bold uppercase tracking-wide',
    'rounded-2xl select-none',
    'transition-[transform,box-shadow] duration-75',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0',
  ].join(' '),
  {
    variants: {
      variant: {
        // Naranja Numa (primary del Manual de Marca)
        primary: [
          'bg-numoria-orange text-white',
          'shadow-[0_6px_0_0_var(--color-numoria-orange-hover)]',
          'hover:brightness-105',
          'active:translate-y-[4px] active:shadow-[0_2px_0_0_var(--color-numoria-orange-hover)]',
          'focus-visible:ring-numoria-orange',
        ].join(' '),
        // Índigo medianoche — autoridad, secondary
        indigo: [
          'bg-numoria-indigo text-white',
          'shadow-[0_6px_0_0_rgb(13_10_36)]',
          'hover:brightness-110',
          'active:translate-y-[4px] active:shadow-[0_2px_0_0_rgb(13_10_36)]',
          'focus-visible:ring-numoria-indigo',
        ].join(' '),
        // Teal éxito — confirmaciones, "siguiente", "enviar"
        success: [
          'bg-numoria-teal text-white',
          'shadow-[0_6px_0_0_rgb(13_148_136)]',
          'hover:brightness-105',
          'active:translate-y-[4px] active:shadow-[0_2px_0_0_rgb(13_148_136)]',
          'focus-visible:ring-numoria-teal',
        ].join(' '),
        // Dorado medalla — logros, premios
        gold: [
          'bg-numoria-dorado text-numoria-grafito',
          'shadow-[0_6px_0_0_rgb(217_119_6)]',
          'hover:brightness-105',
          'active:translate-y-[4px] active:shadow-[0_2px_0_0_rgb(217_119_6)]',
          'focus-visible:ring-numoria-dorado',
        ].join(' '),
        // Ghost — outline blanco con borde naranja, alternativa secondary
        ghost: [
          'bg-white text-numoria-orange border-2 border-numoria-orange',
          'shadow-[0_6px_0_0_var(--color-numoria-orange-hover)]',
          'hover:bg-numoria-crema',
          'active:translate-y-[4px] active:shadow-[0_2px_0_0_var(--color-numoria-orange-hover)]',
          'focus-visible:ring-numoria-orange',
        ].join(' '),
        // Coral — peligro, eliminar, cerrar sesión
        danger: [
          'bg-numoria-coral text-white',
          'shadow-[0_6px_0_0_rgb(225_29_72)]',
          'hover:brightness-105',
          'active:translate-y-[4px] active:shadow-[0_2px_0_0_rgb(225_29_72)]',
          'focus-visible:ring-numoria-coral',
        ].join(' '),
      },
      size: {
        sm: 'h-9 px-4 text-xs',
        md: 'h-12 px-6 text-sm',
        lg: 'h-14 px-8 text-base',
        xl: 'h-16 px-10 text-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  },
);

export interface Button3DProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button3dVariants> {
  asChild?: boolean;
}

const Button3D = React.forwardRef<HTMLButtonElement, Button3DProps>(
  ({ className, variant, size, fullWidth, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(button3dVariants({ variant, size, fullWidth, className }))}
        {...props}
      />
    );
  },
);
Button3D.displayName = 'Button3D';

export { Button3D, button3dVariants };
