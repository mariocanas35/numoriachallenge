/**
 * Server-side Supabase client para Next.js App Router.
 *
 * Usar en:
 * - Server Components
 * - Route Handlers (app/api/...)
 * - Server Actions
 *
 * Lee cookies de la request actual (vía next/headers) para mantener sesión.
 */

import { type CookieOptions, createServerClient as createSSRServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types.gen';

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Tipo del cliente que retorna `createServerClient()`. Usar este alias en
 * función signatures que aceptan el cliente como parámetro — evita generics
 * mismatch entre @supabase/ssr y @supabase/supabase-js.
 *
 * @example
 *   import type { ServerClient } from '@numoria/database/server';
 *   async function myHelper(supabase: ServerClient) { ... }
 */
export type ServerClient = Awaited<ReturnType<typeof createServerClient>>;

/**
 * Cliente Supabase autenticado con la sesión del usuario actual.
 * Respeta RLS — opera con los permisos del usuario logueado.
 */
export async function createServerClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment.',
    );
  }

  return createSSRServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // setAll desde un Server Component genera error — ignorar.
          // El middleware se encarga de refrescar la sesión.
        }
      },
    },
  });
}

/**
 * Cliente Supabase con permisos administrativos (BYPASS RLS).
 *
 * ⚠️ USO RESTRINGIDO:
 * - Solo en Route Handlers o Server Actions verificadas
 * - NUNCA en Server Components que rendean a usuarios finales
 * - Nunca devolver el cliente o sus resultados sin filtrar al cliente
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.',
    );
  }

  return createSSRServerClient<Database>(url, serviceKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        // Admin client no maneja cookies de sesión
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
