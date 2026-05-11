'use server';

import { createServerClient } from '@numoria/database/server';
import type { Database, TablesUpdate } from '@numoria/database/types';
import { z } from 'zod';

// Supabase JS type inference quirk: from().update() y rpc() args se infieren
// como `never` aunque Database está bien tipado. Usamos casts explícitos.
type ProfileUpdate = TablesUpdate<'profiles'>;
type CompleteOnboardingArgs = Database['public']['Functions']['complete_onboarding']['Args'];
type JoinTeamArgs = Database['public']['Functions']['join_team']['Args'];

/**
 * Server Actions del flow de onboarding.
 *
 * Cada función:
 * 1. Valida input con Zod
 * 2. Llama RPC complete_onboarding() para marcar profile como onboarded
 * 3. Opcionalmente acciones adicionales (ej. join_team para students)
 * 4. Devuelve resultado tipado
 */

const studentOnboardingSchema = z.object({
  country_code: z.string().length(2),
  birth_year: z.coerce.number().int().min(1990).max(2030),
  birth_month: z.coerce.number().int().min(1).max(12),
  grade: z.coerce.number().int().min(1).max(12),
  invite_code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{8}$/, 'Invalid code format')
    .optional()
    .or(z.literal('')),
});

export interface OnboardingResult {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Completa el onboarding del estudiante.
 *
 * 1. Update profile con birth_year + birth_month (directo, no via RPC)
 * 2. RPC complete_onboarding() con country_code, grade
 * 3. Si invite_code: RPC join_team()
 * 4. La sesión queda activa, user puede ir a /
 */
export async function completeStudentOnboarding(formData: FormData): Promise<OnboardingResult> {
  const parsed = studentOnboardingSchema.safeParse({
    country_code: formData.get('country_code'),
    birth_year: formData.get('birth_year'),
    birth_month: formData.get('birth_month'),
    grade: formData.get('grade'),
    invite_code: formData.get('invite_code') || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { country_code, birth_year, birth_month, grade, invite_code } = parsed.data;

  const supabase = await createServerClient();

  // Step 1: Update birth_year + birth_month (RLS UPDATE policy permite estos campos)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: 'No authenticated user' };
  }

  const profileUpdate: ProfileUpdate = { birth_year, birth_month };
  const { error: updateError } = await supabase
    .from('profiles')
    .update(profileUpdate as never)
    .eq('id', user.id);

  if (updateError) {
    console.error('Profile birth date update failed:', updateError);
    return { ok: false, message: updateError.message };
  }

  // Step 2: RPC complete_onboarding (atómico: country, grade, onboarding_completed, terms_accepted_at)
  const completeArgs: CompleteOnboardingArgs = {
    p_country_code: country_code,
    p_grade: grade,
  };
  const { error: rpcError } = await supabase.rpc('complete_onboarding', completeArgs as never);

  if (rpcError) {
    console.error('complete_onboarding RPC failed:', rpcError);
    return { ok: false, message: rpcError.message };
  }

  // Step 3 (opcional): join_team si hay invite_code
  if (invite_code && invite_code.length === 8) {
    const joinArgs: JoinTeamArgs = { p_invite_code: invite_code };
    const { error: joinError } = await supabase.rpc('join_team', joinArgs as never);

    if (joinError) {
      // El onboarding ya está completo — solo fallar el join no es bloqueante
      console.error('join_team failed:', joinError);
      return {
        ok: true, // onboarding sí se completó
        message: `Onboarding completed but team join failed: ${joinError.message}`,
      };
    }
  }

  return { ok: true };
}
