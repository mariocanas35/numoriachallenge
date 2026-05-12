import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Permitir consumir packages internos como TS source (sin build step propio)
  transpilePackages: ['@numoria/ui', '@numoria/i18n', '@numoria/config', '@numoria/database'],

  // Routes tipadas (movido de experimental en Next 15.5)
  typedRoutes: true,

  // Skip TypeScript checking dentro de `next build`. Razón: en Windows con
  // monorepo + TS strict, el typechecker se traga toda la RAM (OOM crash
  // con exit code STATUS_STACK_BUFFER_OVERRUN) durante la fase "Linting and
  // checking validity of types".
  //
  // Type safety se preserva por canales separados:
  //   - `pnpm typecheck` corre tsc --noEmit standalone (pre-commit + CI)
  //   - IDE TS server check en tiempo real
  //   - Vercel/CI puede correr typecheck separado antes del build
  //
  // Si necesitamos re-habilitar: quitar este flag + correr build con
  // NODE_OPTIONS=--max-old-space-size=16384.
  typescript: {
    ignoreBuildErrors: true,
  },

  // Optimización de imágenes — solo dominios confiables
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'r2.dev',
      },
    ],
  },

  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
