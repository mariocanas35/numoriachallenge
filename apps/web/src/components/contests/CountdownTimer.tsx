'use client';

import { useEffect, useRef, useState } from 'react';

interface CountdownTimerProps {
  /** ISO string del momento en que el contest debe terminar. */
  endsAt: string;
  /** Callback cuando llega a 0 (auto-submit, ej.). */
  onTimeout?: () => void;
  /** Threshold (segundos) bajo el cual el timer se pone rojo y alerta. */
  warningSeconds?: number;
}

/**
 * Display MM:SS contando regresivamente hasta `endsAt`.
 * - Color base: ink
 * - <5 min: amarillo (warning)
 * - <1 min: rojo (critical, animación pulse)
 * - 0: invoca onTimeout una sola vez
 */
export function CountdownTimer({ endsAt, onTimeout, warningSeconds = 300 }: CountdownTimerProps) {
  const endsAtMs = new Date(endsAt).getTime();
  const [remainingMs, setRemainingMs] = useState(() => Math.max(0, endsAtMs - Date.now()));
  const timeoutInvoked = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, endsAtMs - Date.now());
      setRemainingMs(remaining);
      if (remaining === 0 && !timeoutInvoked.current && onTimeout) {
        timeoutInvoked.current = true;
        onTimeout();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAtMs, onTimeout]);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;
  const formatted = `${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;

  const isCritical = totalSeconds < 60;
  const isWarning = totalSeconds < warningSeconds && totalSeconds >= 60;

  const colorClass = isCritical
    ? 'text-numoria-red animate-pulse'
    : isWarning
      ? 'text-numoria-orange'
      : 'text-numoria-ink';

  return (
    <div className="flex flex-col items-center" aria-live="polite" aria-atomic="true">
      <span className="text-xs font-semibold uppercase tracking-wider text-numoria-mid">
        ⏱️ Tiempo
      </span>
      <span className={`font-mono text-3xl font-bold tabular-nums ${colorClass}`}>{formatted}</span>
    </div>
  );
}
