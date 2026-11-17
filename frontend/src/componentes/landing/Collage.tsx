import { useRef } from 'react';
import { Link } from 'react-router';
import { Camera } from 'lucide-react';
import { FotoConFallback } from '@/componentes/catalogo';
import { fotoPorSlug, type SlugCampus } from '@/lib/campus';
import { gsap, SIN_REDUCCION, useGSAP } from './gsap';

/**
 * Bento de 12 columnas con cinco campus: una foto grande (6x2) y cuatro iguales (3x1) a su lado.
 * En móvil son 4 columnas: la grande ocupa todo el ancho (4x2) y las cuatro restantes forman 2x2.
 * Todas las celdas son marcos con `overflow-hidden`: la foto interior es más alta que el marco y solo se desplaza con `transform`
 * (parallax), de modo que los bordes del bento no se mueven nunca.
 */
const CELDAS: Array<{ slug: SlugCampus; clase: string }> = [
  { slug: 'andes', clase: 'col-span-4 row-span-2 md:col-span-6' },
  { slug: 'antioquia', clase: 'col-span-2 md:col-span-3' },
  { slug: 'eafit', clase: 'col-span-2 md:col-span-3' },
  { slug: 'valle', clase: 'col-span-2 md:col-span-3' },
  { slug: 'norte', clase: 'col-span-2 md:col-span-3' },
];

/** Parallax de cada foto dentro de su marco (scrub); sin movimiento queda como un bento estático. */
export function Collage() {
  const raiz = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(SIN_REDUCCION, () => {
        gsap.utils.toArray<HTMLElement>('[data-capa]', raiz.current).forEach((el) => {
          // La foto mide 112 % del marco: ±5,4 % de su alto (= ±6 % del marco) se queda siempre dentro del recorte.
          gsap.fromTo(
            el,
            { yPercent: -5.4 },
            { yPercent: 5.4, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: raiz },
  );

  return (
    <section ref={raiz} aria-labelledby="titulo-collage" className="pagina-ancho seccion-ritmo">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 md:mb-8">
        <h2 id="titulo-collage" className="titulo-display max-w-[22ch] text-[clamp(1.5rem,3vw,2.25rem)] font-semibold">
          Campus de todo el país, a un clic de distancia.
        </h2>
        <Link to="/universidades" viewTransition className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium">
          Ver universidades
        </Link>
      </div>
      <div className="grid grid-cols-4 auto-rows-[clamp(8rem,24vw,11rem)] gap-[var(--gap-grilla)] md:grid-cols-12 md:auto-rows-[clamp(9rem,15vw,13.5rem)]">
        {CELDAS.map(({ slug, clase }) => {
          const f = fotoPorSlug(slug);
          return (
            <figure key={slug} className={`relative isolate m-0 overflow-hidden rounded-xl bg-superficie-2 ${clase}`}>
              <div data-capa className="absolute inset-x-0 -top-[6%] h-[112%]">
                <FotoConFallback
                  src={f.src}
                  sm={f.sm}
                  sizes={slug === 'andes' ? '(min-width: 768px) 38rem, 100vw' : '(min-width: 768px) 19rem, 50vw'}
                  width={800}
                  height={600}
                  relleno
                  alt={`Campus de la ${f.universidad}, ${f.ciudad}`}
                  className="size-full"
                />
              </div>
              <figcaption className="absolute bottom-2 left-2 flex max-w-[calc(100%-1rem)] items-center gap-1.5 rounded-full bg-superficie/90 px-2.5 py-1 text-xs font-medium text-texto backdrop-blur-sm">
                <Camera className="size-3.5 shrink-0 text-texto-3" aria-hidden />
                <span className="truncate">{f.universidad}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
