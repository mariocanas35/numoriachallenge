import { updateSession } from '@numoria/database/middleware';
import { LOCALE_COOKIE_NAME, detectLocale, isActiveLocale } from '@numoria/i18n';
import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

/**
 * Middleware combinado:
 *
 * 1. Skipea paths de auth (`/auth/*`) — el callback OAuth no usa locale
 * 2. Si el path no tiene prefijo de locale → detectar locale y redirigir
 * 3. Si ya está localizado → next-intl maneja, después updateSession refresca tokens Supabase
 *
 * Headers de geolocalización soportados:
 * - cf-ipcountry (Cloudflare)
 * - x-vercel-ip-country (Vercel)
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const firstSegment = pathname.split('/')[1] ?? '';

  // Path ya localizado → next-intl + refresh de sesión
  if (isActiveLocale(firstSegment)) {
    const intlResponse = intlMiddleware(request);
    return updateSession(request, intlResponse);
  }

  // Path sin prefijo de locale → detectar y redirigir
  const detected = detectLocale({
    cookieLocale: request.cookies.get(LOCALE_COOKIE_NAME)?.value,
    countryCode: request.headers.get('cf-ipcountry') ?? request.headers.get('x-vercel-ip-country'),
    acceptLanguage: request.headers.get('accept-language'),
  });

  const url = request.nextUrl.clone();
  url.pathname = pathname === '/' ? `/${detected}` : `/${detected}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip API, _next, _vercel, /auth/* (callback OAuth fuera de locale),
  // y archivos estáticos (cualquier path con `.`)
  matcher: ['/((?!api|_next|_vercel|auth|.*\\..*).*)'],
};
