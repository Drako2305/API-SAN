import { useRef } from 'react';
import { FotoConFallback } from '@/componentes/catalogo';
import { FOTOS_CAMPUS } from '@/lib/campus';
import { gsap, SIN_REDUCCION, useGSAP } from './gsap';

/** Posición y velocidad de parallax (px por cada 100 px de scroll) de cada foto del collage. */
const DISPOSICION = [
  { clase: 'col-span-7 md:col-span-5 aspect-[4/3]', v: -40 },
  { clase: 'col-span-5 md:col-span-3 aspect-[3/4] mt-10 md:mt-24', v: 60 },
  { clase: 'col-span-5 md:col-span-4 aspect-[1/1] md:-mt-4', v: -20 },
  { clase: 'col-span-7 md:col-span-4 aspect-[4/3] mt-6 md:mt-16', v: 40 },
  { clase: 'col-span-12 md:col-span-4 aspect-[16/9] md:aspect-[4/3]', v: -60 },
  { clase: 'col-span-6 md:col-span-4 aspect-[4/5] md:mt-20', v: 30 },
];

/** Collage de campus con parallax por capas (scrub); sin movimiento queda como una cuadrícula estática. */
export function Collage() {
  const raiz = useRef<HTMLElement>(null);
  const fotos = FOTOS_CAMPUS.slice(0, DISPOSICION.length);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(SIN_REDUCCION, () => {
        gsap.utils.toArray<HTMLElement>('[data-capa]', raiz.current).forEach((el) => {
          gsap.fromTo(
            el,
            { y: -Number(el.dataset.capa) },
            { y: Number(el.dataset.capa), ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: raiz },
  );

  return (
    <section ref={raiz} aria-labelledby="titulo-collage" className="pagina-ancho seccion-ritmo overflow-hidden">
      <h2 id="titulo-collage" className="titulo-display mb-10 max-w-[22ch] text-[clamp(1.75rem,3.6vw,3rem)] font-semibold">
        Campus de todo el país, a un clic de distancia.
      </h2>
      <div className="grid grid-cols-12 gap-[var(--gap-grilla)]">
        {fotos.map((f, i) => (
          <figure key={f.slug} data-capa={DISPOSICION[i]!.v * 0.6} className={`relative m-0 ${DISPOSICION[i]!.clase}`}>
            <FotoConFallback
              src={f.src}
              sm={f.sm}
              sizes="(min-width: 768px) 28rem, 60vw"
              width={800}
              height={600}
              alt={`Campus de la ${f.universidad}, ${f.ciudad}`}
              className="size-full aspect-auto! rounded-xl"
            />
            <figcaption className="absolute bottom-2 left-2 rounded-full bg-superficie/90 px-2.5 py-1 text-xs font-medium text-texto backdrop-blur-sm">
              {f.universidad}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
