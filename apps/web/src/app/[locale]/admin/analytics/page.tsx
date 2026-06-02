import { createAdminClient } from '@numoria/database/server';

// Siempre fresco
export const dynamic = 'force-dynamic';

type ViewRow = {
  session_id: string;
  path: string;
  source: string | null;
  country: string | null;
  device: string | null;
  duration_seconds: number | null;
  created_at: string;
};

type SessionAgg = {
  firstSource: string;
  firstCountry: string | null;
  device: string | null;
  views: number;
  duration: number;
};

const DAY_MS = 86_400_000;

/** Quita el prefijo de locale: /es -> "/", /es/summer-bowl -> "/summer-bowl". */
function stripLocale(path: string): string {
  const m = path.match(/^\/[a-z]{2}(\/.*)?$/);
  if (m) return m[1] || '/';
  return path;
}

function fmtDuration(sec: number): string {
  if (sec <= 0) return '0s';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function sourceLabel(source: string): string {
  const map: Record<string, string> = {
    facebook: '📘 Facebook',
    instagram: '📸 Instagram',
    google: '🔍 Google',
    whatsapp: '💬 WhatsApp',
    twitter: '🐦 Twitter/X',
    youtube: '▶️ YouTube',
    tiktok: '🎵 TikTok',
    directo: '🔗 Directo',
  };
  return map[source] ?? `🌐 ${source}`;
}

function deviceLabel(device: string): string {
  const map: Record<string, string> = {
    mobile: '📱 Móvil',
    desktop: '💻 Escritorio',
    tablet: '📲 Tablet',
  };
  return map[device] ?? `❓ ${device}`;
}

/**
 * /admin/analytics — "Visitas". Analítica propia (first-party, anónima) de los
 * últimos 30 días. Agrega en JS porque a la escala actual es trivial; si crece
 * mucho, conviene mover los conteos a SQL/RPC.
 */
export default async function AdminAnalyticsPage() {
  const admin = createAdminClient();

  const since = new Date(Date.now() - 30 * DAY_MS).toISOString();
  const { data } = await admin
    .from('page_views' as never)
    .select('session_id, path, source, country, device, duration_seconds, created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: true })
    .limit(100_000);
  const rows = (data as ViewRow[] | null) ?? [];

  const now = Date.now();
  const t24 = now - DAY_MS;
  const t7 = now - 7 * DAY_MS;

  // --- Conteos de vistas por ventana ---
  let views24 = 0;
  let views7 = 0;
  for (const r of rows) {
    const t = new Date(r.created_at).getTime();
    if (t > t24) views24 += 1;
    if (t > t7) views7 += 1;
  }
  const views30 = rows.length;

  // --- Sesiones (visitas) ---
  const sessions = new Map<string, SessionAgg & { firstTime: number }>();
  for (const r of rows) {
    const t = new Date(r.created_at).getTime();
    let s = sessions.get(r.session_id);
    if (!s) {
      s = {
        firstSource: r.source ?? 'directo',
        firstCountry: r.country,
        device: r.device,
        views: 0,
        duration: 0,
        firstTime: t,
      };
      sessions.set(r.session_id, s);
    }
    s.views += 1;
    s.duration += r.duration_seconds ?? 0;
  }
  const sessionArr = [...sessions.values()];
  const uniqueVisitors = sessionArr.length;
  const uniq24 = sessionArr.filter((s) => s.firstTime > t24).length;
  const uniq7 = sessionArr.filter((s) => s.firstTime > t7).length;

  const avgDuration = uniqueVisitors
    ? Math.round(sessionArr.reduce((a, s) => a + s.duration, 0) / uniqueVisitors)
    : 0;
  const bounces = sessionArr.filter((s) => s.views === 1).length;
  const bounceRate = uniqueVisitors ? Math.round((bounces / uniqueVisitors) * 100) : 0;

  // --- Rankings ---
  const tally = (entries: (string | null)[], fallback: string) => {
    const m = new Map<string, number>();
    for (const e of entries) {
      const k = e ?? fallback;
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };

  const topPages = tally(
    rows.map((r) => stripLocale(r.path)),
    '/',
  ).slice(0, 10);
  const topSources = tally(
    sessionArr.map((s) => s.firstSource),
    'directo',
  ).slice(0, 8);
  const topCountries = tally(
    sessionArr.map((s) => s.firstCountry),
    '—',
  ).slice(0, 8);
  const devices = tally(
    sessionArr.map((s) => s.device),
    'desconocido',
  );

  // --- Visitas por día (14 días) ---
  const dayCounts = new Map<string, number>();
  for (const r of rows) {
    const key = r.created_at.slice(0, 10); // YYYY-MM-DD
    dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
  }
  const last14: { label: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const key = new Date(now - i * DAY_MS).toISOString().slice(0, 10);
    last14.push({ label: key.slice(5), count: dayCounts.get(key) ?? 0 });
  }
  const maxDay = Math.max(1, ...last14.map((d) => d.count));

  const cards = [
    { label: 'Visitas (24 h)', value: views24, emoji: '👁️' },
    { label: 'Visitas (7 días)', value: views7, emoji: '📅' },
    { label: 'Visitas (30 días)', value: views30, emoji: '📊' },
    { label: 'Visitantes únicos (30d)', value: uniqueVisitors, emoji: '🧑‍🤝‍🧑' },
    { label: 'Únicos (7 días)', value: uniq7, emoji: '✨' },
    { label: 'Únicos (24 h)', value: uniq24, emoji: '🆕' },
    { label: 'Tiempo prom. / visita', value: fmtDuration(avgDuration), emoji: '⏱️' },
    { label: 'Tasa de rebote', value: `${bounceRate}%`, emoji: '↩️' },
  ];

  const empty = rows.length === 0;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-2xl font-bold text-numoria-ink">Visitas</h1>
        <p className="mt-1 text-sm text-numoria-mid">
          Analítica propia y anónima de los últimos 30 días. (No cuenta tus visitas al panel de
          admin.)
        </p>
      </header>

      {empty ? (
        <p className="rounded-xl border border-dashed border-numoria-orange/40 bg-numoria-orange/5 p-6 text-center text-sm text-numoria-mid">
          Aún no hay visitas registradas. Aparecerán aquí en cuanto la gente entre al sitio (puede
          tardar unos minutos tras publicar el cambio).
        </p>
      ) : (
        <>
          {/* Tarjetas */}
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {cards.map((c) => (
              <div key={c.label} className="rounded-xl border-2 border-numoria-gray bg-white p-5">
                <p className="text-2xl" aria-hidden="true">
                  {c.emoji}
                </p>
                <p className="mt-2 font-display text-2xl font-bold text-numoria-ink">{c.value}</p>
                <p className="text-sm text-numoria-mid">{c.label}</p>
              </div>
            ))}
          </section>

          {/* Visitas por día */}
          <section>
            <h2 className="mb-3 font-display text-lg font-bold text-numoria-ink">
              Visitas por día (14 días)
            </h2>
            <div className="rounded-xl border-2 border-numoria-gray bg-white p-5">
              <div className="flex h-32 items-end gap-1">
                {last14.map((d) => (
                  <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-numoria-mid">{d.count || ''}</span>
                    <div
                      className="w-full rounded-t bg-numoria-blue"
                      style={{ height: `${Math.max(2, (d.count / maxDay) * 100)}%` }}
                    />
                    <span className="text-[9px] text-numoria-mid">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Fuentes + Páginas */}
          <div className="grid gap-6 md:grid-cols-2">
            <RankSection title="Fuentes de tráfico" hint="De dónde llegan tus visitantes">
              {topSources.map(([key, count]) => (
                <Row key={key} label={sourceLabel(key)} count={count} total={uniqueVisitors} />
              ))}
            </RankSection>

            <RankSection title="Páginas más visitadas">
              {topPages.map(([key, count]) => (
                <Row key={key} label={key} count={count} total={views30} mono />
              ))}
            </RankSection>
          </div>

          {/* Países + Dispositivos */}
          <div className="grid gap-6 md:grid-cols-2">
            <RankSection title="Países (visitantes)">
              {topCountries.map(([key, count]) => (
                <Row key={key} label={key} count={count} total={uniqueVisitors} />
              ))}
            </RankSection>

            <RankSection title="Dispositivos">
              {devices.map(([key, count]) => (
                <Row key={key} label={deviceLabel(key)} count={count} total={uniqueVisitors} />
              ))}
            </RankSection>
          </div>
        </>
      )}
    </div>
  );
}

function RankSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-1 font-display text-lg font-bold text-numoria-ink">{title}</h2>
      {hint ? <p className="mb-2 text-xs text-numoria-mid">{hint}</p> : null}
      <div className="rounded-xl border-2 border-numoria-gray bg-white p-5">
        <ul className="flex flex-col gap-3">{children}</ul>
      </div>
    </section>
  );
}

function Row({
  label,
  count,
  total,
  mono,
}: {
  label: string;
  count: number;
  total: number;
  mono?: boolean;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <li className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-sm">
        <span
          className={`truncate font-semibold text-numoria-ink ${mono ? 'font-mono text-xs' : ''}`}
        >
          {label}
        </span>
        <span className="ml-2 shrink-0 text-numoria-mid">
          {count} · {pct}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-numoria-cloud">
        <div className="h-full rounded-full bg-numoria-orange" style={{ width: `${pct}%` }} />
      </div>
    </li>
  );
}
