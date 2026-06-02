import { type AdminUserRow, UsersTable } from '@/components/admin/UsersTable';
import { createAdminClient, createServerClient } from '@numoria/database/server';

export const dynamic = 'force-dynamic';

type ProfileRow = {
  id: string;
  display_name: string;
  role: string;
  country_code: string | null;
  school_id: string | null;
};

/**
 * /admin/users — todos los usuarios con correo + estado de confirmación +
 * país + escuela, con buscador y moderación. Usa el admin client (la ruta ya
 * está protegida por el layout) y la API de auth admin para leer los correos.
 */
export default async function AdminUsersPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const currentAdminId = user?.id ?? '';

  const admin = createAdminClient();

  const { data: authData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const authUsers = authData?.users ?? [];

  const { data: profilesData } = await admin
    .from('profiles')
    .select('id, display_name, role, country_code, school_id');
  const profileMap = new Map(((profilesData as ProfileRow[] | null) ?? []).map((p) => [p.id, p]));

  const { data: schoolsData } = await admin.from('schools').select('id, name');
  const schoolMap = new Map(
    ((schoolsData as { id: string; name: string }[] | null) ?? []).map((s) => [s.id, s.name]),
  );

  const now = Date.now();
  const rows: AdminUserRow[] = authUsers
    .map((u) => {
      const p = profileMap.get(u.id);
      const bannedUntil = (u as { banned_until?: string | null }).banned_until ?? null;
      return {
        id: u.id,
        name: p?.display_name ?? '—',
        email: u.email ?? '—',
        confirmed: Boolean(u.email_confirmed_at),
        role: p?.role ?? '—',
        country: p?.country_code ?? null,
        school: p?.school_id ? (schoolMap.get(p.school_id) ?? null) : null,
        lastSignIn: u.last_sign_in_at ?? null,
        banned: bannedUntil ? new Date(bannedUntil).getTime() > now : false,
        createdAt: u.created_at,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-numoria-ink">Usuarios</h1>
        <p className="mt-1 text-sm text-numoria-mid">
          {rows.length} usuarios. Busca, renombra, bloquea o elimina. ✓ = correo confirmado (real).
        </p>
      </header>
      <UsersTable rows={rows} currentAdminId={currentAdminId} />
    </div>
  );
}
