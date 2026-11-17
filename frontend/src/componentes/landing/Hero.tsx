import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button, LinkButton } from '@/componentes';
import { BuscadorCarrera, FotoConFallback } from '@/componentes/catalogo';
import { fotoPorSlug } from '@/lib/campus';
import { useSesion } from '@/lib/sesion';
import { FondoConstelacion } from './FondoConstelacion';
import { gsap, SIN_REDUCCION, SplitText, useGSAP } from './gsap';

/** Hero: titular con revelado por líneas (SplitText), constelación 3D de fondo y la foto de LCP sin carga diferida. */
export function Hero({ onRegistro }: { onRegistro: () => void }) {
  const { autenticado } = useSesion();
  const raiz = useRef<HTMLElement>(null);
  const foto = fotoPorSlug('nacional');

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
    <section ref={raiz} className="relative isolate -mt-[var(--barra)] overflow-hidden" aria-labelledby="titulo-hero">
      <FondoConstelacion />
      <div className="pagina-ancho relative grid min-h-[min(88dvh,44rem)] items-center gap-8 pt-[calc(var(--barra)+2.5rem)] pb-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12 lg:pt-[calc(var(--barra)+1.5rem)] lg:pb-12">
        <div>
          <h1 id="titulo-hero" data-titulo className="titulo-display max-w-[15ch] text-[clamp(2.5rem,6.4vw,5rem)] leading-[1.03] font-semibold">
            Compara carreras con un puntaje que puedes explicar.
          </h1>
          <p data-entra className="mt-5 max-w-[52ch] text-lg text-texto-2">
            Busca por ciudad, costo, modalidad y jornada. Tú decides cuánto pesa cada criterio y SAN te muestra el porqué de cada resultado.
          </p>
          <div data-entra className="mt-7 max-w-[40rem]">
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

        <figure data-entra className="relative m-0 w-full max-w-72 justify-self-start lg:max-w-80 lg:justify-self-end">
          <FotoConFallback
            src={foto.src}
            sm={foto.sm}
            sizes="(min-width: 1024px) 20rem, 18rem"
            width={800}
            height={1000}
            prioridad
            alt={`Campus de la ${foto.universidad}, ${foto.ciudad}`}
            className="rounded-xl shadow-3"
          />
          <figcaption className="absolute bottom-2 left-2 rounded-full bg-superficie/90 px-2.5 py-1 text-xs font-medium text-texto backdrop-blur-sm">
            {foto.universidad}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
