/**
 * Middleware helper para refresh de sesión Supabase.
 *
 * Se ejecuta en cada request a Next.js y mantiene los tokens válidos.
 * Debe llamarse desde apps/web/src/middleware.ts (compuesto con i18n middleware).
 */

import { type CookieOptions, createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import type { Database } from './types.gen';

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Refresca la sesión Supabase si el access token expiró,
 * actualizando las cookies de la response.
 *
 * Devuelve la response (potencialmente con cookies actualizadas).
 * Si el caller agrega más cosas a la response, debe usar la que retorna.
 */
export async function updateSession(request: NextRequest, response?: NextResponse) {
  const supabaseResponse = response ?? NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // En dev sin .env.local: sigue de largo, no rompas la app
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        for (const { name, value, options } of cookiesToSet) {
          request.cookies.set(name, value);
          supabaseResponse.cookies.set(name, value, options);
        }
      },
    },
  });

  // IMPORTANT: getUser() obliga a refresh si necesario.
  // No reemplazar por getSession() — ese no refresh.
  await supabase.auth.getUser();

  return supabaseResponse;
}
