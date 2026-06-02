'use client';

import { NumaAvatar } from '@numoria/ui';
import { useEffect, useRef, useState } from 'react';

/**
 * Numa en el hero del landing.
 *
 * Muestra el video animado de Numa (`/numa-hero.mp4`, vertical 464×826) enmarcado
 * como una tarjeta redondeada. Mientras el video no esté listo —o si el archivo
 * no existe— se ve el avatar SVG estático centrado en el mismo marco, sin saltos
 * de layout (el espacio queda reservado por `aspect-[464/826]`).
 *
 * Cómo funciona: el avatar estático queda siempre debajo y el video se superpone
 * oculto (opacity-0). Se revela cuando hay datos para reproducir. Si el archivo
 * no existe (404), ese evento nunca ocurre y queda visible el avatar estático.
 *
 * Robustez: además de los eventos `onLoadedData`/`onCanPlay`, revisamos
 * `readyState` al montar. Si el video está cacheado, esos eventos pueden
 * dispararse ANTES de que React adjunte los handlers (carrera de hidratación);
 * el chequeo en el efecto garantiza que el video se revele igual.
 */
export function NumaHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    // readyState >= 2 (HAVE_CURRENT_DATA): ya hay datos del frame actual.
    if (v && v.readyState >= 2) {
      setVideoReady(true);
    }
  }, []);

  return (
    <div className="relative mx-auto aspect-[464/826] w-40 sm:w-48">
      {/* Fallback estático: avatar centrado dentro del marco. */}
      <div className="absolute inset-0 flex items-center justify-center">
        <NumaAvatar pose="wave" size="2xl" animateIn />
      </div>

      {/* Video animado: oculto hasta que pueda reproducirse. */}
      <video
        ref={videoRef}
        src="/numa-hero.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onLoadedData={() => setVideoReady(true)}
        onCanPlay={() => setVideoReady(true)}
        className={`absolute inset-0 h-full w-full rounded-3xl object-cover shadow-card ring-1 ring-numoria-orange/20 transition-opacity duration-500 ${
          videoReady ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
