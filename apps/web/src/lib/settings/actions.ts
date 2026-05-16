'use server';

import { createServerClient } from '@numoria/database/server';
import type { Database } from '@numoria/database/types';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

/**
 * Server Actions de /settings (Tarea 2 del plan recalibrado 2026-05-15).
 *
 * Permiten al teacher editar:
 *   - Datos de su escuela: name, address, city, phone, website (y country_code)
 *   - Su propio perfil: display_name, locale
 *
 * El campo `verified` de schools NO es editable desde aquí (RLS lo bloquea
 * por antifraud — solo se actualiza por admin via SQL/dashboard).
 *
 * El upload de logo queda como iteración futura — por ahora es read-only en UI.
 */

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

// ============================================================
// School details
// ============================================================

const updateSchoolSchema = z.object({
  name: z.string().trim().min(2, 'Nombre requerido (mínimo 2 caracteres)'),
  country_code: z.string().length(2, 'País requerido').toUpperCase(),
  city: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((v) => (v?.length ? v : null)),
  address: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v?.length ? v : null)),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((v) => (v?.length ? v : null)),
  website: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v?.length ? v : null))
    .refine((v) => !v || /^https?:\/\//.test(v), 'Debe empezar con http:// o https://'),
});

export async function updateSchoolDetails(formData: FormData): Promise<ActionResult> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'No autenticado' };

  const parsed = updateSchoolSchema.safeParse({
    name: formData.get('name'),
    country_code: formData.get('country_code'),
    city: formData.get('city'),
    address: formData.get('address'),
    phone: formData.get('phone'),
    website: formData.get('website'),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Datos inválidos',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Encuentra la escuela del teacher (asumimos 1 escuela por teacher MVP).
  // RLS schools_select_own_or_member permite leer su propia escuela.
  const { data: schoolRow } = await supabase
    .from('schools')
    .select('id')
    .eq('created_by', user.id)
    .maybeSingle();

  if (!schoolRow) {
    return { ok: false, message: 'No tienes una escuela registrada' };
  }
  const schoolId = (schoolRow as { id: string }).id;

  // SchoolUpdate aún no incluye address/phone/website hasta que se
  // regeneren los tipos post-Migration 0030. Usamos cast a never (el
  // mismo patrón que ya usa el resto del codebase para .update()).
  const update = {
    name: parsed.data.name,
    country_code: parsed.data.country_code,
    city: parsed.data.city,
    address: parsed.data.address,
    phone: parsed.data.phone,
    website: parsed.data.website,
  };

  const { error } = await supabase
    .from('schools')
    .update(update as never)
    .eq('id', schoolId);

  if (error) {
    return { ok: false, message: `No se pudo guardar: ${error.message}` };
  }

  // Refresh dashboards que muestran datos de escuela
  revalidatePath('/[locale]/settings', 'page');
  revalidatePath('/[locale]', 'page');
  return { ok: true };
}

// ============================================================
// User profile (display_name, locale)
// ============================================================

const updateProfileSchema = z.object({
  display_name: z.string().trim().min(1, 'Nombre requerido').max(120),
  locale: z.enum(['es', 'en', 'pt']),
});

export async function updateUserProfile(formData: FormData): Promise<ActionResult> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'No autenticado' };

  const parsed = updateProfileSchema.safeParse({
    display_name: formData.get('display_name'),
    locale: formData.get('locale'),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Datos inválidos',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const update: ProfileUpdate = {
    display_name: parsed.data.display_name,
    locale: parsed.data.locale,
  };

  const { error } = await supabase
    .from('profiles')
    .update(update as never)
    .eq('id', user.id);

  if (error) {
    return { ok: false, message: `No se pudo guardar: ${error.message}` };
  }

  revalidatePath('/[locale]/settings', 'page');
  revalidatePath('/[locale]', 'page');
  return { ok: true };
}
