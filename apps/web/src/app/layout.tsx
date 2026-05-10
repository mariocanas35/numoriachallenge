import type { ReactNode } from 'react';

/**
 * Root layout (passthrough).
 *
 * Next.js requiere un layout en `app/`, pero next-intl con `localePrefix: 'always'`
 * recomienda que sea passthrough — el html+body real lo provee `[locale]/layout.tsx`
 * para rutas localizadas y `auth/layout.tsx` para rutas de auth fuera de locale.
 *
 * https://next-intl-docs.vercel.app/docs/getting-started/app-router/with-i18n-routing
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
