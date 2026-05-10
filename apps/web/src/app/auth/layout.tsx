import { Fraunces, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import type { ReactNode } from 'react';
import '../../styles/globals.css';

/**
 * Layout para rutas /auth/* que NO están bajo [locale].
 *
 * Solo aplica a:
 * - /auth/error (página de error genérica)
 *
 * Las rutas /auth/callback y /auth/logout son route handlers (no usan layout).
 *
 * lang="en" como fallback porque estas rutas no conocen el locale del usuario
 * (suceden antes de establecer sesión o durante errores).
 */

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${jakarta.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
