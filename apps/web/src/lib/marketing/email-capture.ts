'use server';

import { createServerClient } from '@numoria/database/server';

export interface CaptureEmailResult {
  ok: boolean;
  message?: string;
}

/**
 * Captura un email para campaña de marketing (lead generation).
 *
 * Casos de uso:
 *   - Landing pública /summer-bowl → source='summer_bowl_landing'
 *   - Otros funnels en el futuro
 *
 * Características:
 *   - Validación de formato de email (regex)
 *   - Idempotente: si el email ya existe con la misma source, retorna success
 *     sin duplicar (no error al usuario)
 *   - Metadata opcional para enriquecer el lead (locale, referrer, etc.)
 */
export async function captureEmail(input: {
  email: string;
  source: string;
  metadata?: Record<string, string | number | boolean>;
}): Promise<CaptureEmailResult> {
  const { email, source, metadata = {} } = input;

  // Validación básica
  const trimmedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { ok: false, message: 'invalid_email' };
  }

  if (!source || source.length > 50) {
    return { ok: false, message: 'invalid_source' };
  }

  const supabase = await createServerClient();

  // Insertar (si ya existe el par email+source, lo ignoramos silenciosamente).
  // Cast `as never` necesario por edge case de generic propagation en
  // @supabase/ssr — mismo patrón usado en actions.ts y otros server actions.
  const { error } = await supabase.from('email_captures').insert({
    email: trimmedEmail,
    source,
    metadata,
  } as never);

  if (error) {
    // Si el error es por unique constraint (email + source ya existe), tratamos
    // como success silencioso para mejor UX (el usuario no necesita saber que
    // ya estaba en la lista).
    if (error.code === '23505') {
      return { ok: true };
    }
    console.error('[captureEmail] Failed:', error);
    return { ok: false, message: 'db_error' };
  }

  return { ok: true };
}
