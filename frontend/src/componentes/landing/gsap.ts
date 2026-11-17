import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import type { RefObject } from 'react';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/** Todo el movimiento de la portada se registra dentro de esta consulta (reduced motion recibe el contenido estático). */
export const SIN_REDUCCION = '(prefers-reduced-motion: no-preference)';
/** Fijado con scrub solo donde hay espacio y puntero; en móvil la galería es scroll nativo. */
export const ESCRITORIO = '(min-width: 768px)';

/** Revelado suave por lotes (opacidad + desplazamiento) de los `[data-revela]` de una sección. Se llama dentro de la consulta de movimiento. */
export function revelarLote(raiz: Element | null, selector = '[data-revela]') {
  const nodos = gsap.utils.toArray<HTMLElement>(selector, raiz);
  if (nodos.length === 0) return () => {};
  gsap.set(nodos, { autoAlpha: 0, y: 20 });
  const disparadores = ScrollTrigger.batch(nodos, {
    start: 'top 92%',
    once: true,
    onEnter: (lote) => gsap.to(lote, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.07, overwrite: true }),
  });
  return () => {
    disparadores.forEach((d) => d.kill());
    gsap.set(nodos, { clearProps: 'opacity,visibility,transform' });
  };
}

/** Hook de revelado: vuelve a armarse cuando cambian las dependencias (por ejemplo, al llegar los datos de la API). */
export function useRevelado(raiz: RefObject<HTMLElement | null>, dependencias: unknown[]) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(SIN_REDUCCION, () => revelarLote(raiz.current));
      return () => mm.revert();
    },
    { scope: raiz, dependencies: dependencias },
  );
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
