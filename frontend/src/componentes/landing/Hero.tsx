import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button, LinkButton } from '@/componentes';
import { BuscadorCarrera, FotoConFallback } from '@/componentes/catalogo';
import { fotoPorSlug, type SlugCampus } from '@/lib/campus';
import { useSesion } from '@/lib/sesion';
import { FondoConstelacion } from './FondoConstelacion';
import { gsap, SIN_REDUCCION, SplitText, useGSAP } from './gsap';

/**
 * Collage escalonado de cuatro campus de ciudades distintas (sin repetir los del collage del final de la portada).
 * Orden de lectura: columna izquierda (alto, cuadrado) y derecha desplazada hacia abajo (cuadrado, alto).
 */
const CAMPUS_HERO: Array<{ slug: SlugCampus; alto: 'alto' | 'cuadro' }> = [
  { slug: 'nacional', alto: 'alto' },
  { slug: 'javeriana', alto: 'cuadro' },
  { slug: 'uis', alto: 'cuadro' },
  { slug: 'cartagena', alto: 'alto' },
];

/** Hero: titular con revelado por líneas (SplitText), constelación 3D de fondo y la foto de LCP sin carga diferida. */
export function Hero({ onRegistro }: { onRegistro: () => void }) {
  const { autenticado } = useSesion();
  const raiz = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(SIN_REDUCCION, () => {
        const titulo = raiz.current!.querySelector<HTMLElement>('[data-titulo]')!;
        const resto = raiz.current!.querySelectorAll('[data-entra]');
        let cancelado = false;
        let divisor: SplitText | undefined;
        // El titular se oculta antes del primer pintado y se revela cuando la tipografía ya está lista (líneas correctas).
        gsap.set(titulo, { autoAlpha: 0 });
        gsap.set(resto, { autoAlpha: 0, y: 14 });
        const listo = () => {
          if (cancelado) return;
          gsap.set(titulo, { autoAlpha: 1 });
          divisor = SplitText.create(titulo, {
            type: 'lines',
            mask: 'lines',
            linesClass: 'lp-linea',
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, { yPercent: 108, duration: 0.9, ease: 'expo.out', stagger: 0.09 }),
          });
          gsap.to(resto, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08, delay: 0.35 });
        };
        void document.fonts.ready.then(listo);
        return () => {
          cancelado = true;
          divisor?.revert();
        };
      });
    },
    { scope: raiz },
  );

  return (
    <section ref={raiz} className="relative isolate z-10 -mt-[var(--barra)] overflow-x-clip" aria-labelledby="titulo-hero">
      <FondoConstelacion />
      <div className="pagina-ancho relative grid min-h-[min(88dvh,44rem)] items-center gap-8 pt-[calc(var(--barra)+2.5rem)] pb-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12 lg:pt-[calc(var(--barra)+1.5rem)] lg:pb-12">
        <div>
          <h1 id="titulo-hero" data-titulo className="titulo-display max-w-[15ch] text-[clamp(2.5rem,6.4vw,5rem)] leading-[1.03] font-semibold">
            Compara carreras con un puntaje que puedes explicar.
          </h1>
          <p data-entra className="mt-5 max-w-[52ch] text-lg text-texto-2">
            Busca por ciudad, costo, modalidad y jornada. Tú decides cuánto pesa cada criterio y SAN te muestra el porqué de cada resultado.
          </p>
          <div data-entra className="relative z-20 mt-7 max-w-[40rem]">
            <BuscadorCarrera />
          </div>
          <div data-entra className="mt-5 flex flex-wrap items-center gap-3">
            {autenticado ? (
              <LinkButton to="/inicio" viewTransition variante="secundario" icono={<ArrowRight className="size-4" aria-hidden />}>
                Ir a mi inicio
              </LinkButton>
            ) : (
              <Button variante="secundario" onClick={onRegistro} icono={<ArrowRight className="size-4" aria-hidden />}>
                Crear cuenta gratis
              </Button>
            )}
            <LinkButton to="/carreras" viewTransition variante="fantasma">
              Explorar el catálogo
            </LinkButton>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:gap-4" aria-label="Campus del catálogo">
          {[0, 1].map((col) => (
            <div key={col} className={col === 1 ? 'flex flex-col gap-3 lg:gap-4 lg:pt-14' : 'flex flex-col gap-3 lg:gap-4'}>
              {CAMPUS_HERO.filter((_, i) => i % 2 === col).map(({ slug, alto }, i) => {
                const f = fotoPorSlug(slug);
                const primera = col === 0 && i === 0;
                return (
                  <figure key={slug} data-entra className="relative m-0 overflow-hidden rounded-xl bg-superficie-2 shadow-2">
                    <FotoConFallback
                      src={f.src}
                      sm={f.sm}
                      sizes="(min-width: 1024px) 15rem, 50vw"
                      width={800}
                      height={alto === 'alto' ? 1000 : 800}
                      prioridad={primera}
                      alt={`Campus de la ${f.universidad}, ${f.ciudad}`}
                      className={alto === 'alto' ? 'aspect-[4/3] lg:aspect-[4/5]' : 'aspect-[4/3] lg:aspect-square'}
                    />
                    <figcaption className="absolute right-2 bottom-2 left-2 truncate rounded-md bg-superficie/90 px-2 py-1 text-xs font-medium text-texto backdrop-blur-sm sm:right-auto sm:max-w-[calc(100%-1rem)] sm:rounded-full sm:px-2.5">
                      {f.universidad}
                      <span className="text-texto-3"> · {f.ciudad}</span>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
