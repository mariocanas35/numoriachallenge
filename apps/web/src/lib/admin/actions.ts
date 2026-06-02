'use server';

import { createAdminClient, createServerClient } from '@numoria/database/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

/**
 * Acciones de moderación del panel admin.
 *
 * SEGURIDAD: cada acción verifica que QUIEN LLAMA es admin (no basta el gate
 * de la página, porque las server actions se pueden invocar directo). Usan el
 * admin client (service role) que bypassa RLS, así que el guard es esencial.
 */

export interface AdminActionResult {
  ok: boolean;
  message?: string;
}

async function getAdminCaller(): Promise<{ ok: boolean; id?: string }> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { data } = await supabase.rpc('get_my_profile');
  const profile = data as { role?: string } | null;
  if (profile?.role !== 'admin') return { ok: false };

  return { ok: true, id: user.id };
}

const userIdSchema = z.string().uuid();

// ============================================================
// Bloquear / desbloquear (cancelar acceso, reversible)
// ============================================================
export async function setUserBanned(userId: string, banned: boolean): Promise<AdminActionResult> {
  const caller = await getAdminCaller();
  if (!caller.ok) return { ok: false, message: 'No autorizado' };
  if (!userIdSchema.safeParse(userId).success) return { ok: false, message: 'ID inválido' };
  if (userId === caller.id) return { ok: false, message: 'No puedes bloquearte a ti mismo' };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: banned ? '876000h' : 'none',
  });
  if (error) {
    console.error('setUserBanned failed:', error);
    return { ok: false, message: error.message };
  }
  revalidatePath('/[locale]/admin/users', 'page');
  return { ok: true };
}

// ============================================================
// Eliminar cuenta (permanente — cascada borra profile y datos asociados)
// ============================================================
export async function deleteUserAccount(userId: string): Promise<AdminActionResult> {
  const caller = await getAdminCaller();
  if (!caller.ok) return { ok: false, message: 'No autorizado' };
  if (!userIdSchema.safeParse(userId).success) return { ok: false, message: 'ID inválido' };
  if (userId === caller.id) return { ok: false, message: 'No puedes eliminar tu propia cuenta' };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    console.error('deleteUserAccount failed:', error);
    return { ok: false, message: error.message };
  }
  revalidatePath('/[locale]/admin/users', 'page');
  return { ok: true };
}

// ============================================================
// Renombrar (limpiar nombres obscenos)
// ============================================================
const renameSchema = z.string().trim().min(1).max(120);

export async function renameUser(userId: string, displayName: string): Promise<AdminActionResult> {
  const caller = await getAdminCaller();
  if (!caller.ok) return { ok: false, message: 'No autorizado' };
  if (!userIdSchema.safeParse(userId).success) return { ok: false, message: 'ID inválido' };
  const parsed = renameSchema.safeParse(displayName);
  if (!parsed.success) return { ok: false, message: 'Nombre inválido (1-120 caracteres)' };

  const admin = createAdminClient();
  const { error } = await admin
    .from('profiles')
    .update({ display_name: parsed.data } as never)
    .eq('id', userId);
  if (error) {
    console.error('renameUser failed:', error);
    return { ok: false, message: error.message };
  }
  revalidatePath('/[locale]/admin/users', 'page');
  return { ok: true };
}

// ============================================================
// Cambiar rol (corregir a quien se registró con el rol equivocado)
//
// Restringido a los 3 roles no-admin: conceder 'admin' es deliberado y se
// hace solo por SQL. Reinicia el onboarding (onboarding_completed=false) para
// que el usuario rehaga la configuración de su nuevo rol (ej. un maestro
// nuevo crea su escuela).
// ============================================================
const changeRoleSchema = z.enum(['student', 'parent', 'teacher']);

export async function changeUserRole(userId: string, role: string): Promise<AdminActionResult> {
  const caller = await getAdminCaller();
  if (!caller.ok) return { ok: false, message: 'No autorizado' };
  if (!userIdSchema.safeParse(userId).success) return { ok: false, message: 'ID inválido' };
  if (userId === caller.id) return { ok: false, message: 'No puedes cambiar tu propio rol aquí' };
  const parsed = changeRoleSchema.safeParse(role);
  if (!parsed.success) return { ok: false, message: 'Rol inválido' };

  const admin = createAdminClient();
  const { error } = await admin
    .from('profiles')
    .update({ role: parsed.data, onboarding_completed: false } as never)
    .eq('id', userId);
  if (error) {
    console.error('changeUserRole failed:', error);
    return { ok: false, message: error.message };
  }
  revalidatePath('/[locale]/admin/users', 'page');
  return { ok: true };
}

// ============================================================
// Competencias — editar fecha y cambiar estado (activar)
// ============================================================
const contestIdSchema = z.string().uuid();
const contestStatusSchema = z.enum(['draft', 'scheduled', 'active', 'closed']);

export async function setContestStatus(
  contestId: string,
  status: string,
): Promise<AdminActionResult> {
  const caller = await getAdminCaller();
  if (!caller.ok) return { ok: false, message: 'No autorizado' };
  if (!contestIdSchema.safeParse(contestId).success) return { ok: false, message: 'ID inválido' };
  const parsed = contestStatusSchema.safeParse(status);
  if (!parsed.success) return { ok: false, message: 'Estado inválido' };

  const admin = createAdminClient();
  const { error } = await admin
    .from('contests')
    .update({ status: parsed.data } as never)
    .eq('id', contestId);
  if (error) {
    console.error('setContestStatus failed:', error);
    return { ok: false, message: error.message };
  }
  revalidatePath('/[locale]/admin/contests', 'page');
  return { ok: true };
}

export async function updateContestDate(
  contestId: string,
  scheduledAt: string,
): Promise<AdminActionResult> {
  const caller = await getAdminCaller();
  if (!caller.ok) return { ok: false, message: 'No autorizado' };
  if (!contestIdSchema.safeParse(contestId).success) return { ok: false, message: 'ID inválido' };
  const d = new Date(scheduledAt);
  if (Number.isNaN(d.getTime())) return { ok: false, message: 'Fecha inválida' };

  const admin = createAdminClient();
  const { error } = await admin
    .from('contests')
    .update({ scheduled_at: d.toISOString() } as never)
    .eq('id', contestId);
  if (error) {
    console.error('updateContestDate failed:', error);
    return { ok: false, message: error.message };
  }
  revalidatePath('/[locale]/admin/contests', 'page');
  return { ok: true };
}
