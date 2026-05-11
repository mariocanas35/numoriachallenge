'use server';

import { createServerClient } from '@numoria/database/server';
import type { Database } from '@numoria/database/types';
import { z } from 'zod';

// Type aliases: workaround del bug de Supabase JS donde args de insert/rpc se infieren como `never`
type TeamInsert = Database['public']['Tables']['teams']['Insert'];
type TeamUpdate = Database['public']['Tables']['teams']['Update'];
type JoinTeamArgs = Database['public']['Functions']['join_team']['Args'];

const SCHOOL_DIVISIONS = ['elementary', 'middle'] as const;
type SchoolDivision = (typeof SCHOOL_DIVISIONS)[number];

// ============================================================
// createTeam — Teacher crea un equipo nuevo
// ============================================================

const createTeamSchema = z.object({
  name: z.string().trim().min(1).max(100),
  division: z.enum(SCHOOL_DIVISIONS),
  max_members: z.coerce.number().int().min(1).max(100).optional(),
});

export interface CreateTeamResult {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  teamId?: string;
  inviteCode?: string;
}

/**
 * Teacher crea un team en su escuela.
 *
 * 1. Valida input con Zod
 * 2. Verifica que el usuario es teacher con school_id
 * 3. Genera invite_code único via RPC generate_team_invite_code
 * 4. Inserta team (RLS valida: is_teacher() + coach_id=auth.uid() + escuela propia)
 */
export async function createTeam(formData: FormData): Promise<CreateTeamResult> {
  const parsed = createTeamSchema.safeParse({
    name: formData.get('name'),
    division: formData.get('division'),
    max_members: formData.get('max_members') || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, division, max_members } = parsed.data;

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: 'No authenticated user' };
  }

  // 1. Verificar role + school_id del teacher
  const rpcProfile = await supabase.rpc('get_my_profile');
  const profile = rpcProfile.data as { role: string; school_id: string | null } | null;

  if (!profile) {
    return { ok: false, message: 'Profile not found' };
  }
  if (profile.role !== 'teacher') {
    return { ok: false, message: 'Only teachers can create teams' };
  }
  if (!profile.school_id) {
    return { ok: false, message: 'You must register a school before creating teams' };
  }

  // 2. Generar invite_code único (RPC retries hasta 100 veces internamente)
  const { data: codeData, error: codeError } = await supabase.rpc('generate_team_invite_code');
  if (codeError || !codeData) {
    console.error('generate_team_invite_code failed:', codeError);
    return { ok: false, message: codeError?.message ?? 'Could not generate invite code' };
  }
  const inviteCode = codeData as string;

  // 3. Insertar team
  const teamInsert: TeamInsert = {
    name,
    division: division as SchoolDivision,
    school_id: profile.school_id,
    coach_id: user.id,
    invite_code: inviteCode,
    max_members: max_members ?? 35,
  };

  const { data: teamRow, error: insertError } = await supabase
    .from('teams')
    .insert(teamInsert as never)
    .select('id, invite_code')
    .single();

  if (insertError || !teamRow) {
    console.error('Team insert failed:', insertError);
    return { ok: false, message: insertError?.message ?? 'Failed to create team' };
  }

  const team = teamRow as { id: string; invite_code: string };
  return { ok: true, teamId: team.id, inviteCode: team.invite_code };
}

// ============================================================
// regenerateInviteCode — rota el código de un team
// ============================================================

const regenerateSchema = z.object({
  team_id: z.string().uuid(),
});

export interface RegenerateCodeResult {
  ok: boolean;
  message?: string;
  inviteCode?: string;
}

/**
 * Rota el invite_code de un team. Solo el coach puede hacerlo.
 * Útil si el código se filtró o el coach quiere "limpiar" inscripciones.
 */
export async function regenerateInviteCode(teamId: string): Promise<RegenerateCodeResult> {
  const parsed = regenerateSchema.safeParse({ team_id: teamId });
  if (!parsed.success) {
    return { ok: false, message: 'Invalid team id' };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: 'No authenticated user' };

  // 1. Generar nuevo código
  const { data: codeData, error: codeError } = await supabase.rpc('generate_team_invite_code');
  if (codeError || !codeData) {
    return { ok: false, message: codeError?.message ?? 'Could not generate new code' };
  }
  const newCode = codeData as string;

  // 2. Update (RLS: coach_id = auth.uid())
  const teamUpdate: TeamUpdate = { invite_code: newCode };
  const { error: updateError } = await supabase
    .from('teams')
    .update(teamUpdate as never)
    .eq('id', parsed.data.team_id)
    .eq('coach_id', user.id);

  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  return { ok: true, inviteCode: newCode };
}

// ============================================================
// joinTeam — Estudiante usa invite_code para unirse
// ============================================================

const joinTeamSchema = z.object({
  invite_code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{8}$/, 'Invalid code format'),
});

export interface JoinTeamResult {
  ok: boolean;
  message?: string;
  teamId?: string;
  teamName?: string;
}

/**
 * Estudiante autenticado (y onboarded) se une a un team via invite_code.
 * El RPC join_team() valida: role=student, código válido y enabled,
 * capacidad disponible, no duplicado.
 */
export async function joinTeam(inviteCode: string): Promise<JoinTeamResult> {
  const parsed = joinTeamSchema.safeParse({ invite_code: inviteCode });
  if (!parsed.success) {
    return { ok: false, message: 'Invalid code format' };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: 'No authenticated user' };

  const args: JoinTeamArgs = { p_invite_code: parsed.data.invite_code };
  const { data, error } = await supabase.rpc('join_team', args as never);

  if (error || !data) {
    return { ok: false, message: error?.message ?? 'Could not join team' };
  }

  const team = data as { id: string; name: string };
  return { ok: true, teamId: team.id, teamName: team.name };
}
