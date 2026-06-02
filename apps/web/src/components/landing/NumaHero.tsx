'use client';

import { NumaAvatar } from '@numoria/ui';
import { useState } from 'react';

/**
 * Numa en el hero del landing.
 *
 * Muestra el video animado de Numa (`/numa-hero.mp4`) cuando el archivo existe;
 * mientras no se haya subido, cae limpiamente al avatar SVG estático — sin
 * parpadeos ni estado roto. En cuanto coloques el MP4 en
 * `apps/web/public/numa-hero.mp4` se activa solo (no requiere cambios de código).
 *
 * Cómo funciona: el avatar estático queda siempre debajo y el video se superpone
 * oculto (opacity-0). Solo se revela cuando `onCanPlay` dispara; si el archivo no
 * existe (404), ese evento nunca ocurre y queda visible el avatar estático.
 *
 * Requisitos del video: MP4 H.264, mudo, loop perfecto, fondo transparente o
 * a juego con el hero (cuadrado ~600×600 se ve bien).
 */
export function NumaHero() {
  const [videoReady, setVideoReady] = useState(false);

  return (
    <div className="relative inline-block h-40 w-40 shrink-0">
      {/* Fallback estático: siempre presente debajo del video. */}
      <NumaAvatar pose="wave" size="2xl" animateIn />

      {/* Video animado: oculto hasta que pueda reproducirse. */}
      <video
        src="/numa-hero.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onCanPlay={() => setVideoReady(true)}
        className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ${
          videoReady ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
