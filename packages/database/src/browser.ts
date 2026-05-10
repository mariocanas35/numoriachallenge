/**
 * Browser-side Supabase client.
 *
 * Usar SOLO en Client Components (con 'use client').
 * Singleton — reusa la misma instancia en toda la sesión del usuario.
 */

import { createBrowserClient as createSSRBrowserClient } from '@supabase/ssr';
import type { Database } from './types.gen';

let browserClient: ReturnType<typeof createSSRBrowserClient<Database>> | undefined;

/**
 * Obtiene (o crea por primera vez) el cliente browser singleton.
 *
 * @example
 * 'use client';
 * import { createBrowserClient } from '@numoria/database/browser';
 *
 * const supabase = createBrowserClient();
 * // ...
 */
export function createBrowserClient() {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment.',
    );
  }

  browserClient = createSSRBrowserClient<Database>(url, key);
  return browserClient;
}
