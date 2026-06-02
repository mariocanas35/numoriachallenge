'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

/**
 * Tracker de analitica first-party (anonimo). Se monta una vez en el layout y:
 *  - Registra una "vista" cada vez que cambia la ruta.
 *  - Mide el tiempo en cada pagina y lo envia al salir (sendBeacon).
 *  - IGNORA el panel de admin (/admin) para no ensuciar las metricas con las
 *    visitas del propio fundador.
 *
 * `session_id` es un id aleatorio guardado en sessionStorage (se reinicia al
 * cerrar la pestania). No hay cookies de seguimiento ni datos personales.
 */

const SID_KEY = 'nm_sid';

function isAdminPath(path: string): boolean {
  // rutas tipo /es/admin, /en/admin/...
  return /^\/[a-z]{2}\/admin(\/|$)/.test(path) || path.startsWith('/admin');
}

export function SiteAnalytics() {
  const pathname = usePathname();
  const sessionIdRef = useRef<string | null>(null);
  const enterRef = useRef<number>(0);
  const trackedPathRef = useRef<string | null>(null);
  const leftRef = useRef<boolean>(false);

  // Inicializa el session_id una sola vez.
  useEffect(() => {
    try {
      let sid = sessionStorage.getItem(SID_KEY);
      if (!sid) {
        sid =
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        sessionStorage.setItem(SID_KEY, sid);
      }
      sessionIdRef.current = sid;
    } catch {
      // sessionStorage no disponible (modo restringido) -> no rastreamos.
    }
  }, []);

  // Envia la duracion de la pagina actual (best-effort, una sola vez por vista).
  // Solo usa refs, por eso es estable (deps vacias).
  const flushLeave = useCallback(() => {
    if (leftRef.current) return;
    const sid = sessionIdRef.current;
    const path = trackedPathRef.current;
    if (!sid || !path) return;
    leftRef.current = true;
    const durationSeconds = Math.round((Date.now() - enterRef.current) / 1000);
    const payload = JSON.stringify({ type: 'leave', sessionId: sid, path, durationSeconds });
    try {
      navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' }));
    } catch {
      // ignore: la analitica nunca debe romper la pagina
    }
  }, []);

  // Registra una vista en cada cambio de ruta.
  useEffect(() => {
    const sid = sessionIdRef.current;
    if (!sid) return;

    // Cierra la pagina anterior (duracion) antes de registrar la nueva.
    flushLeave();

    if (isAdminPath(pathname)) {
      trackedPathRef.current = null;
      return;
    }

    enterRef.current = Date.now();
    trackedPathRef.current = pathname;
    leftRef.current = false;

    const payload = JSON.stringify({
      type: 'view',
      sessionId: sid,
      path: pathname,
      referrer: document.referrer || null,
      query: window.location.search,
    });
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // silencioso: la analitica nunca debe romper la pagina
    });
  }, [pathname, flushLeave]);

  // Listeners para capturar la salida (cerrar pestania / cambiar de app).
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flushLeave();
    };
    window.addEventListener('pagehide', flushLeave);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', flushLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [flushLeave]);

  return null;
}
