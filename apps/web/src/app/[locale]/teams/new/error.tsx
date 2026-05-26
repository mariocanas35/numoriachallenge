'use client';

import { useEffect } from 'react';

/**
 * Error boundary para /teams/new — muestra el mensaje real del error
 * en lugar del genérico "Application error: a server-side exception".
 *
 * En producción Next.js suele esconder el mensaje por seguridad, pero
 * exponerlo aquí (especialmente durante el piloto) ayuda a diagnosticar.
 */
export default function TeamsNewError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to browser console so it's also visible in DevTools
    console.error('[/teams/new] Server error:', error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border-2 border-numoria-coral/40 bg-white p-8 shadow-card sm:p-10">
      <div className="text-center">
        <div className="text-5xl" aria-hidden>
          ⚠️
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-numoria-ink">
          Ups, algo salió mal al cargar la página
        </h1>
        <p className="mt-2 text-sm text-numoria-mid">
          Se produjo un error al cargar el formulario de crear equipo.
        </p>
      </div>

      {/* Mensaje real del error — útil para diagnóstico */}
      <details className="mt-6 rounded-lg bg-numoria-cloud p-4 text-left">
        <summary className="cursor-pointer text-sm font-semibold text-numoria-grafito">
          🔍 Detalles técnicos (para soporte)
        </summary>
        <div className="mt-3 space-y-2 text-xs">
          <p>
            <strong>Mensaje:</strong>{' '}
            <code className="break-all rounded bg-white px-1.5 py-0.5 font-mono text-numoria-coral">
              {error.message || '(sin mensaje)'}
            </code>
          </p>
          {error.digest && (
            <p>
              <strong>Digest:</strong>{' '}
              <code className="rounded bg-white px-1.5 py-0.5 font-mono">{error.digest}</code>
            </p>
          )}
          {error.stack && (
            <details>
              <summary className="cursor-pointer text-numoria-mid">Stack trace</summary>
              <pre className="mt-2 max-h-48 overflow-auto rounded bg-white p-2 font-mono text-[10px] text-numoria-grafito">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </details>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-numoria-orange px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-numoria-orange/90"
        >
          🔄 Intentar de nuevo
        </button>
        <a
          href="/"
          className="rounded-xl border-2 border-numoria-niebla bg-white px-6 py-3 text-sm font-bold text-numoria-ink shadow-sm transition hover:bg-numoria-cloud"
        >
          🏠 Volver al inicio
        </a>
      </div>

      <p className="mt-6 text-center text-xs text-numoria-mid">
        Si el problema persiste, comparte el mensaje y el digest con{' '}
        <a
          href="mailto:mimathonline@gmail.com?subject=Error /teams/new"
          className="text-numoria-orange underline"
        >
          soporte
        </a>
        .
      </p>
    </div>
  );
}
