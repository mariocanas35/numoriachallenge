import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes safely.
 *
 * Combina condicionales (clsx) con resolución de conflictos Tailwind (twMerge).
 * Última clase gana en caso de utilidades del mismo grupo.
 *
 * @example
 * cn('p-4', condition && 'p-8') // → 'p-8' si condition es true
 * cn('bg-numoria-blue', userClassName) // → respeta override del consumidor
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
