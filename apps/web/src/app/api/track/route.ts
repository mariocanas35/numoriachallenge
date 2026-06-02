import { createAdminClient } from '@numoria/database/server';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * /api/track — Ingesta de analitica de visitas (first-party, anonima).
 *
 * No requiere auth (lo llama cualquier visitante). Escribe con service_role a
 * `page_views`, que tiene RLS sin policies (privada). Validamos y limitamos los
 * campos para evitar basura. NO guardamos datos personales.
 *
 * Eventos:
 *  - { type: 'view', sessionId, path, referrer?, query? } -> inserta una vista
 *  - { type: 'leave', sessionId, path, durationSeconds }  -> setea la duracion
 *    de la ultima vista (best-effort, via sendBeacon al salir de la pagina)
 */

const MAX_PATH = 256;
const MAX_REF = 512;

function clampInt(value: unknown, min: number, max: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function deviceFromUA(ua: string): 'mobile' | 'tablet' | 'desktop' {
  if (/ipad|tablet/i.test(ua)) return 'tablet';
  if (/mobile|android|iphone|ipod/i.test(ua)) return 'mobile';
  return 'desktop';
}

/** Agrupa el origen del visitante en una fuente legible. */
function deriveSource(referrer: string | null, query: string): string {
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(query.startsWith('?') ? query.slice(1) : query);
  } catch {
    params = new URLSearchParams();
  }

  const utm = params.get('utm_source');
  if (utm) return utm.toLowerCase().slice(0, 40);
  if (params.has('fbclid')) return 'facebook';
  if (params.has('gclid')) return 'google';

  if (referrer) {
    let host = '';
    try {
      host = new URL(referrer).hostname.replace(/^www\./, '').toLowerCase();
    } catch {
      host = '';
    }
    if (!host) return 'directo';
    if (/facebook|fb\.|fbcdn/.test(host)) return 'facebook';
    if (host.includes('instagram')) return 'instagram';
    if (host.includes('google')) return 'google';
    if (host.includes('whatsapp')) return 'whatsapp';
    if (/t\.co|twitter|x\.com/.test(host)) return 'twitter';
    if (host.includes('youtube')) return 'youtube';
    if (host.includes('tiktok')) return 'tiktok';
    if (host.includes('numoriachallenge.com')) return 'directo'; // navegacion interna
    return host;
  }
  return 'directo';
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const sessionId = typeof body.sessionId === 'string' ? body.sessionId : '';
  const path = typeof body.path === 'string' ? body.path.slice(0, MAX_PATH) : '';

  // Validacion minima: ignoramos silenciosamente lo invalido (sin romper la pagina).
  if (sessionId.length < 8 || sessionId.length > 64 || path.length === 0) {
    return new NextResponse(null, { status: 204 });
  }

  const admin = createAdminClient();

  if (body.type === 'leave') {
    const duration = clampInt(body.durationSeconds, 0, 3600);
    const { data } = await admin
      .from('page_views' as never)
      .select('id')
      .eq('session_id', sessionId)
      .eq('path', path)
      .is('duration_seconds', null)
      .order('created_at', { ascending: false })
      .limit(1);
    const row = (data as { id: string }[] | null)?.[0];
    if (row) {
      await admin
        .from('page_views' as never)
        .update({ duration_seconds: duration } as never)
        .eq('id', row.id);
    }
    return new NextResponse(null, { status: 204 });
  }

  // type === 'view'
  const referrer =
    typeof body.referrer === 'string' ? body.referrer.slice(0, MAX_REF) || null : null;
  const query = typeof body.query === 'string' ? body.query : '';
  const country = req.headers.get('x-vercel-ip-country') ?? req.headers.get('cf-ipcountry') ?? null;
  const device = deviceFromUA(req.headers.get('user-agent') ?? '');
  const source = deriveSource(referrer, query);

  await admin.from('page_views' as never).insert({
    session_id: sessionId,
    path,
    referrer,
    source,
    country,
    device,
  } as never);

  return new NextResponse(null, { status: 204 });
}
