'use server';

import { createAdminClient, createServerClient } from '@numoria/database/server';
import type { Database, TablesUpdate } from '@numoria/database/types';
import { headers } from 'next/headers';
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

// ============================================================
// PARENT ONBOARDING
// ============================================================

const childSchema = z.object({
  display_name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email(),
  birth_year: z.coerce.number().int().min(1990).max(2030),
  birth_month: z.coerce.number().int().min(1).max(12),
  grade: z.coerce.number().int().min(1).max(12),
});

const parentOnboardingSchema = z.object({
  country_code: z.string().length(2),
  children: z.array(childSchema).min(1).max(4),
});

export interface ParentOnboardingResult extends OnboardingResult {
  /** Cuántos hijos se crearon exitosamente (puede ser menor que enviados si alguno falló). */
  childrenCreated?: number;
  /** Errores específicos por hijo, si alguno falló. */
  childErrors?: Array<{ email: string; error: string }>;
}

/**
 * Onboarding del padre/madre:
 * 1. Marca su propio onboarding como completo (RPC complete_onboarding)
 * 2. Para cada hijo: crea auth.user via admin.inviteUserByEmail con metadata
 *    (display_name, role='student', parent_id, country_code, birth_year/month, grade)
 * 3. El trigger handle_new_user (extendido en migration 0010) crea el profile
 *    del hijo con todos los datos. El hijo recibe email invitation.
 * 4. Cuando hijo abre el invite → callback → middleware lo manda a
 *    /onboarding/student → form pre-llenado → solo confirmar.
 */
export async function completeParentOnboarding(input: {
  country_code: string;
  children: Array<{
    display_name: string;
    email: string;
    birth_year: number;
    birth_month: number;
    grade: number;
  }>;
}): Promise<ParentOnboardingResult> {
  const parsed = parentOnboardingSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { country_code, children } = parsed.data;

  const supabase = await createServerClient();
  const {
    data: { user: parentUser },
  } = await supabase.auth.getUser();

  if (!parentUser) {
    return { ok: false, message: 'No authenticated parent user' };
  }

  // Step 1: Completar onboarding del padre
  const parentArgs: CompleteOnboardingArgs = {
    p_country_code: country_code,
  };
  const { error: parentRpcError } = await supabase.rpc('complete_onboarding', parentArgs as never);

  if (parentRpcError) {
    console.error('Parent complete_onboarding failed:', parentRpcError);
    return { ok: false, message: parentRpcError.message };
  }

  // Step 2: Crear cada hijo via admin API
  const admin = createAdminClient();
  const h = await headers();
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const host = h.get('host') ?? 'localhost:3000';
  const redirectTo = `${proto}://${host}/auth/callback`;

  const childErrors: Array<{ email: string; error: string }> = [];
  let childrenCreated = 0;

  for (const child of children) {
    const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(child.email, {
      data: {
        display_name: child.display_name,
        role: 'student',
        parent_id: parentUser.id,
        country_code,
        birth_year: child.birth_year,
        birth_month: child.birth_month,
        grade: child.grade,
        locale: 'es',
      },
      redirectTo,
    });

    if (inviteError) {
      console.error(`Failed to invite child ${child.email}:`, inviteError);
      childErrors.push({ email: child.email, error: inviteError.message });
    } else {
      childrenCreated++;
    }
  }

  // Step 3: Resultado
  if (childrenCreated === 0) {
    return {
      ok: false,
      message: 'No children could be invited',
      childErrors,
      childrenCreated: 0,
    };
  }

  return {
    ok: true,
    childrenCreated,
    childErrors: childErrors.length > 0 ? childErrors : undefined,
  };
}
