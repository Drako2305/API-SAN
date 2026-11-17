import { useRef } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { FotoConFallback } from '@/componentes/catalogo';
import { CARRERAS_DESTACADAS, rutaCarrera } from './carreras';
import { gsap, ESCRITORIO, SIN_REDUCCION, useGSAP } from './gsap';

const ALTA = '(min-height: 700px)';

/**
 * Galería horizontal: en escritorio con movimiento se fija y avanza con el scroll (scrub) con parallax dentro de cada foto;
 * en móvil y con reduced motion es una tira con scroll nativo y snap.
 */
export function GaleriaCarreras() {
  const raiz = useRef<HTMLElement>(null);
  const pista = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // Solo con espacio para que la sección fijada llene la pantalla: sin huecos en pantallas bajas ni en móvil.
      mm.add(`${SIN_REDUCCION} and ${ESCRITORIO} and ${ALTA}`, () => {
        const el = pista.current!;
        const tarjetas = gsap.utils.toArray<HTMLElement>('[data-tarjeta]', el);
        const recorrido = () => Math.max(0, el.scrollWidth - el.clientWidth);
        // La pista deja de desplazarse sola: la mueve el scroll de la página.
        gsap.set(el, { overflowX: 'visible', scrollSnapType: 'none' });
        const mover = gsap.to(el, {
          x: () => -recorrido(),
          ease: 'none',
          scrollTrigger: {
            trigger: raiz.current,
            start: 'top top+=56',
            // La pista avanza 1,5 veces más rápido que el scroll: menos recorrido vertical fijado.
            end: () => `+=${Math.round(recorrido() / 1.5)}`,
            pin: true,
            scrub: 0.5,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
        tarjetas.forEach((t) => {
          const img = t.querySelector('[data-parallax]');
          if (!img) return;
          gsap.fromTo(
            img,
            { xPercent: -8 },
            {
              xPercent: 8,
              ease: 'none',
              scrollTrigger: { trigger: t, containerAnimation: mover, start: 'left right', end: 'right left', scrub: true },
            },
          );
        });
        // Con el foco por teclado, la página avanza hasta la tarjeta enfocada.
        const alEnfocar = (e: FocusEvent) => {
          const t = (e.target as HTMLElement).closest<HTMLElement>('[data-tarjeta]');
          const st = mover.scrollTrigger;
          if (!t || !st) return;
          const r = recorrido();
          const objetivo = Math.min(r, Math.max(0, t.offsetLeft - (el.clientWidth - t.offsetWidth) / 2));
          window.scrollTo({ top: st.start + (r ? objetivo / r : 0) * (st.end - st.start), behavior: 'instant' });
        };
        el.addEventListener('focusin', alEnfocar);
        return () => el.removeEventListener('focusin', alEnfocar);
      });
      return () => mm.revert();
    },
    { scope: raiz },
  );

  return (
    <section ref={raiz} aria-labelledby="titulo-galeria" className="galeria-fija seccion-ritmo overflow-hidden">
      <div className="pagina-ancho mb-6 flex items-end justify-between gap-4">
        <h2 id="titulo-galeria" className="titulo-display max-w-[20ch] text-[clamp(1.75rem,3.6vw,3rem)] font-semibold">
          Carreras para empezar a explorar
        </h2>
        <Link to="/carreras" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium">
          Ver el catálogo <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      <ul
        ref={pista}
        className="pista-tarjetas snap-x snap-mandatory overflow-x-auto px-[var(--gutter)] pb-4 md:px-[max(var(--gutter),calc((100vw-var(--ancho-portada))/2+var(--gutter)))]"
      >
        {CARRERAS_DESTACADAS.map((c) => {
          const f = rutaCarrera(c.nombre);
          return (
            <li key={c.nombre} data-tarjeta className="w-[72vw] max-w-80 shrink-0 snap-start md:w-[calc(var(--alto-tarjeta)*0.8)] md:max-w-none">
              <Link
                to={`/carreras?nombre=${encodeURIComponent(c.nombre)}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-xl border border-borde bg-superficie-2 text-texto no-underline"
              >
                <div data-parallax className="absolute inset-y-0 -inset-x-[10%]">
                  <FotoConFallback
                    src={f.src}
                    sm={f.sm}
                    sizes="20rem"
                    width={800}
                    height={1000}
                    area={c.area}
                    className="size-full aspect-auto!"
                    imgClassName="transition-transform duration-500 ease-[var(--ease-salida)] group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                </div>
                <span className="line-clamp-2 absolute inset-x-0 bottom-0 bg-gradient-to-t from-panel/90 to-transparent p-4 pt-16 font-display text-lg leading-6 font-semibold text-sobre-panel">
                  {c.nombre}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
