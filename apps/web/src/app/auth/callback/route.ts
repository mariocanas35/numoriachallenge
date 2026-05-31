import { createServerClient } from '@numoria/database/server';
import { LOCALE_COOKIE_NAME, defaultLocale, detectLocale } from '@numoria/i18n';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Auth callback — recibe el `code` de Supabase después de:
 * - Magic link: usuario hizo click en email
 * - Google OAuth: completó autorización
 *
 * Intercambia el code por una sesión, setea cookies, y redirige
 * al destino final (locale-aware).
 *
 * Esta ruta está FUERA del [locale] segment porque los providers
 * externos (Google) no conocen nuestros locales. El handler detecta
 * el locale del usuario (cookie > Accept-Language) y redirige al
 * path correcto.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/error?reason=no_code`);
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('Auth callback exchangeCodeForSession failed:', {
      code: error.code,
      status: error.status,
      message: error.message,
    });
    return NextResponse.redirect(`${origin}/auth/error?reason=exchange_failed`);
  }

  // Determinar locale del usuario
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  const locale = detectLocale({
    cookieLocale,
    countryCode: request.headers.get('cf-ipcountry') ?? request.headers.get('x-vercel-ip-country'),
    acceptLanguage: request.headers.get('accept-language'),
  });

  // Redirigir al destino final con prefijo de locale
  const safeNext = next.startsWith('/') ? next : '/';
  const finalPath =
    safeNext === '/'
      ? `/${locale}`
      : `/${locale}${safeNext.startsWith('/') ? safeNext : `/${safeNext}`}`;

  // Si la ruta destino YA tiene prefijo de locale, no duplicar
  const segments = safeNext.split('/').filter(Boolean);
  const alreadyLocalized =
    segments[0] === 'es' || segments[0] === 'en' || segments[0] === defaultLocale;
  const target = alreadyLocalized ? safeNext : finalPath;

  return NextResponse.redirect(`${origin}${target}`);
}
