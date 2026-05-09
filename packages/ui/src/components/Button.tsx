import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '../lib/cn';

/**
 * Button del design system Numoria.
 *
 * Variantes inspiradas en Duolingo: bordes redondeados, sombras suaves,
 * shadow inferior tipo "tarjeta empujable" en variants principales.
 *
 * @example
 * <Button variant="primary" size="lg">Empieza gratis</Button>
 * <Button asChild><Link href="/login">Entrar</Link></Button>
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-sans font-bold uppercase tracking-wide',
    'rounded-md transition-all duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'select-none',
    'active:translate-y-[1px]',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'bg-numoria-blue text-white border-b-4 border-numoria-blue-hover',
          'hover:bg-numoria-blue-hover hover:border-numoria-blue-hover',
          'focus-visible:ring-numoria-blue',
          'active:border-b-2',
        ].join(' '),
        secondary: [
          'bg-numoria-orange text-white border-b-4 border-numoria-orange-hover',
          'hover:bg-numoria-orange-hover hover:border-numoria-orange-hover',
          'focus-visible:ring-numoria-orange',
          'active:border-b-2',
        ].join(' '),
        success: [
          'bg-numoria-green text-white border-b-4 border-numoria-green-hover',
          'hover:bg-numoria-green-hover hover:border-numoria-green-hover',
          'focus-visible:ring-numoria-green',
          'active:border-b-2',
        ].join(' '),
        destructive: [
          'bg-numoria-red text-white border-b-4 border-numoria-red-hover',
          'hover:bg-numoria-red-hover hover:border-numoria-red-hover',
          'focus-visible:ring-numoria-red',
          'active:border-b-2',
        ].join(' '),
        ghost: [
          'bg-transparent text-numoria-ink',
          'hover:bg-numoria-cloud',
          'focus-visible:ring-numoria-mid',
        ].join(' '),
        outline: [
          'bg-white text-numoria-ink border-2 border-numoria-gray',
          'hover:bg-numoria-cloud hover:border-numoria-mid',
          'focus-visible:ring-numoria-mid',
        ].join(' '),
        link: [
          'bg-transparent text-numoria-blue underline-offset-4',
          'hover:underline',
          'focus-visible:ring-numoria-blue',
          'h-auto p-0',
        ].join(' '),
      },
      size: {
        sm: 'h-9 px-3 text-xs',
        md: 'h-11 px-5 text-sm',
        lg: 'h-14 px-8 text-base',
        xl: 'h-16 px-10 text-lg',
        icon: 'h-11 w-11 p-0',
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

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
