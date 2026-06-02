import { createAdminClient } from '@numoria/database/server';

// Estadísticas siempre frescas (sin caché)
export const dynamic = 'force-dynamic';

type ProfileRow = { role: string; country_code: string | null; created_at: string };

/**
 * /admin — Resumen general (estadísticas). Usa el admin client porque la ruta
 * ya está protegida (solo admins llegan aquí vía el layout).
 */
export default async function AdminHomePage() {
  const admin = createAdminClient();

  const { data: profilesData } = await admin
    .from('profiles')
    .select('role, country_code, created_at');
  const profiles = (profilesData as ProfileRow[] | null) ?? [];

  const { count: schoolsCount } = await admin
    .from('schools')
    .select('*', { count: 'exact', head: true });
  const { count: leadsCount } = await admin
    .from('email_captures' as never)
    .select('*', { count: 'exact', head: true });

  const byRole = profiles.reduce<Record<string, number>>((acc, p) => {
    acc[p.role] = (acc[p.role] ?? 0) + 1;
    return acc;
  }, {});

  const byCountry = Object.entries(
    profiles.reduce<Record<string, number>>((acc, p) => {
      const c = p.country_code ?? 'Sin país';
      acc[c] = (acc[c] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const last7 = profiles.filter((p) => new Date(p.created_at).getTime() > weekAgo).length;

  const cards = [
    { label: 'Usuarios totales', value: profiles.length, emoji: '👥' },
    { label: 'Estudiantes', value: byRole.student ?? 0, emoji: '🎓' },
    { label: 'Maestros', value: byRole.teacher ?? 0, emoji: '👩‍🏫' },
    { label: 'Padres', value: byRole.parent ?? 0, emoji: '👨‍👩‍👧' },
    { label: 'Escuelas', value: schoolsCount ?? 0, emoji: '🏫' },
    { label: 'Leads', value: leadsCount ?? 0, emoji: '📨' },
    { label: 'Registros (7 días)', value: last7, emoji: '📈' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-2xl font-bold text-numoria-ink">
          Panel de administración
        </h1>
        <p className="mt-1 text-sm text-numoria-mid">Resumen general de Numoria Challenge.</p>
      </header>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border-2 border-numoria-gray bg-white p-5">
            <p className="text-2xl" aria-hidden="true">
              {c.emoji}
            </p>
            <p className="mt-2 font-display text-3xl font-bold text-numoria-ink">{c.value}</p>
            <p className="text-sm text-numoria-mid">{c.label}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-bold text-numoria-ink">Por país</h2>
        <div className="rounded-xl border-2 border-numoria-gray bg-white p-5">
          {byCountry.length === 0 ? (
            <p className="text-sm text-numoria-mid">Aún no hay datos.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {byCountry.map(([country, count]) => (
                <li key={country} className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-numoria-ink">{country}</span>
                  <span className="text-numoria-mid">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <p className="rounded-xl border border-dashed border-numoria-orange/40 bg-numoria-orange/5 p-4 text-sm text-numoria-mid">
        🚧 Próximamente: usuarios + correos confirmados, moderación (ban/eliminar/nombres),
        competencias (fechas + activación) y leads.
      </p>
    </div>
  );
}
