import { LOCALE_COOKIE_NAME, detectLocale, isActiveLocale } from '@numoria/i18n';
import { type CookieOptions, createServerClient } from '@supabase/ssr';
import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

type CookieToSet = { name: string; value: string; options: CookieOptions };

const intlMiddleware = createMiddleware(routing);

/**
 * Paths (locale-relative) que NO requieren onboarding completo.
 * Si user está logueado pero onboarding_completed=false, todos los
 * demás paths redirigen a /onboarding.
 */
const ONBOARDING_EXEMPT_PATHS = ['/onboarding'];

function isExemptFromOnboarding(pathname: string, locale: string): boolean {
  const localePrefix = `/${locale}`;
  const withoutLocale = pathname.startsWith(localePrefix)
    ? pathname.slice(localePrefix.length) || '/'
    : pathname;
  return ONBOARDING_EXEMPT_PATHS.some((p) => withoutLocale.startsWith(p));
}

/**
 * Middleware combinado:
 *
 * 1. Skipea paths de auth (`/auth/*`) — el callback OAuth no usa locale
 *    (configurado en `config.matcher`)
 * 2. Si el path no tiene prefijo de locale → detectar y redirigir
 * 3. Si ya está localizado:
 *    a. next-intl maneja la i18n
 *    b. Supabase refresca la sesión (cookies updated)
 *    c. Si user autenticado + profile.onboarding_completed=false + path
 *       no es /onboarding → redirige a /{locale}/onboarding
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const firstSegment = pathname.split('/')[1] ?? '';

  // Path sin prefijo de locale → detectar y redirigir
  if (!isActiveLocale(firstSegment)) {
    const detected = detectLocale({
      cookieLocale: request.cookies.get(LOCALE_COOKIE_NAME)?.value,
      countryCode:
        request.headers.get('cf-ipcountry') ?? request.headers.get('x-vercel-ip-country'),
      acceptLanguage: request.headers.get('accept-language'),
    });
    const url = request.nextUrl.clone();
    url.pathname = pathname === '/' ? `/${detected}` : `/${detected}${pathname}`;
    return NextResponse.redirect(url);
  }

  // Path ya localizado → next-intl
  const response = intlMiddleware(request);

  // Setup Supabase para refresh + check de onboarding (en un solo client)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        for (const { name, value, options } of cookiesToSet) {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Refresh session (importante: usar getUser, no getSession)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Onboarding check — solo si user logueado y path no exento
  if (user && !isExemptFromOnboarding(pathname, firstSegment)) {
    const rpcResult = await supabase.rpc('get_my_profile');
    const profile = rpcResult.data as { onboarding_completed: boolean } | null;

    if (profile && !profile.onboarding_completed) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = `/${firstSegment}/onboarding`;
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  // Skip API, _next, _vercel, /auth/* (callback OAuth fuera de locale),
  // y archivos estáticos (cualquier path con `.`)
  matcher: ['/((?!api|_next|_vercel|auth|.*\\..*).*)'],
};
