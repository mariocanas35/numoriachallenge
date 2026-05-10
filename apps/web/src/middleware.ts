import { LOCALE_COOKIE_NAME, detectLocale, isActiveLocale } from '@numoria/i18n';
import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

/**
 * Middleware combinado:
 * 1. Si la URL ya viene con prefijo de locale válido → delega a next-intl
 * 2. Si no → detecta locale con nuestra lógica (cookie > geo IP > Accept-Language)
 *    y redirige al path con prefijo correcto
 *
 * Headers de geolocalización soportados:
 * - cf-ipcountry (Cloudflare)
 * - x-vercel-ip-country (Vercel)
 */
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const firstSegment = pathname.split('/')[1] ?? '';

  // Path ya localizado → next-intl maneja
  if (isActiveLocale(firstSegment)) {
    return intlMiddleware(request);
  }

  // Detectar locale del visitante
  const detected = detectLocale({
    cookieLocale: request.cookies.get(LOCALE_COOKIE_NAME)?.value,
    countryCode: request.headers.get('cf-ipcountry') ?? request.headers.get('x-vercel-ip-country'),
    acceptLanguage: request.headers.get('accept-language'),
  });

  // Redirect con prefijo
  const url = request.nextUrl.clone();
  url.pathname = pathname === '/' ? `/${detected}` : `/${detected}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip API, _next, _vercel, archivos estáticos (cualquier path con `.`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
