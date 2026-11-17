import { useEffect, useRef, useState } from 'react';

function webglDisponible(): boolean {
  if (typeof WebGLRenderingContext === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') ?? c.getContext('webgl'));
  } catch {
    return false;
  }
}

function conexionLigera(): boolean {
  const n = navigator as Navigator & { connection?: { saveData?: boolean } };
  return !!n.connection?.saveData;
}

/**
 * Fondo decorativo del hero: degradado estático siempre presente y, si el entorno lo permite, un globo de puntos en Three.js
 * cargado con import dinámico (no entra al LCP). Se omite con reduced motion, ahorro de datos o sin WebGL.
 */
export function FondoConstelacion() {
  const contenedor = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [lista, setLista] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || conexionLigera() || !webglDisponible()) return;
    let cancelado = false;
    let liberar: (() => void) | undefined;
    const arrancar = () => {
      import('./escena')
        .then(({ crearEscena }) => {
          if (cancelado || !canvas.current || !contenedor.current) return;
          liberar = crearEscena(canvas.current, contenedor.current).dispose;
          setLista(true);
        })
        .catch(() => {
          /* sin escena: queda el degradado */
        });
    };
    // Tras el primer pintado: Three.js no compite con el LCP.
    const conIdle = 'requestIdleCallback' in window;
    const espera = conIdle ? window.requestIdleCallback(arrancar, { timeout: 2000 }) : window.setTimeout(arrancar, 300);
    return () => {
      cancelado = true;
      if (conIdle) window.cancelIdleCallback(espera);
      else window.clearTimeout(espera);
      liberar?.();
    };
  }, []);

  return (
    <div ref={contenedor} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 [background:radial-gradient(60rem_34rem_at_78%_38%,var(--c-acento-suave),transparent_70%)]" />
      <canvas
        ref={canvas}
        className="size-full opacity-0 transition-opacity duration-1000 ease-[var(--ease-salida)] data-[lista=true]:opacity-100"
        data-lista={lista}
      />
    </div>
  );
}
