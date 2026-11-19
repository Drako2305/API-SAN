import { useRef, useState } from 'react';
import { Card, PuntajeBarra } from '@/componentes';
import { CRITERIO_ETIQUETA } from '@/lib/formato';
import { CRITERIOS, type Pesos } from '@/lib/modelos';
import { MorphingRing } from '@/morphing';
import { gsap, ScrollTrigger, SIN_REDUCCION, useGSAP } from './gsap';

/** Se fija con el scroll solo en pantallas anchas y con alto suficiente para verla entera. */
const FIJAR = '(min-width: 1024px) and (min-height: 640px)';

const PASOS = [
  { titulo: 'Elige carrera', texto: 'Parte de lo que quieres estudiar. Filtra por ciudad, costo máximo, modalidad y jornada.' },
  { titulo: 'Ajusta tus pesos', texto: 'De 0 a 5, decide cuánto importa cada criterio. Lo que no cuenta, pesa cero.' },
  { titulo: 'Compara con el porqué', texto: 'Cada oferta trae su puntaje y el desglose por criterio, calculado con tus pesos.' },
];

/** Valores de muestra, solo para ilustrar la mecánica. No son datos del catálogo. */
const PESOS_DEMO: Pesos = { costo: 3, modalidad: 2, ubicacion: 3, acreditacion: 4 };
const DESGLOSE_DEMO: Pesos = { costo: 0.9, modalidad: 0.8, ubicacion: 0.95, acreditacion: 0.82 };
const PUNTAJE_DEMO = 87;
const CERO: Pesos = { costo: 0, modalidad: 0, ubicacion: 0, acreditacion: 0 };

/** "Cómo funciona": al desplazarse (scrub) avanza el paso activo y el puntaje de muestra sube de 0 a 87. En escritorio la sección se fija mientras ocurre. */
export function ComoFunciona() {
  const raiz = useRef<HTMLElement>(null);
  // Estado final por defecto: reduced motion y lectores de pantalla ven el resultado completo.
  const [puntaje, setPuntaje] = useState(PUNTAJE_DEMO);
  const [desglose, setDesglose] = useState<Pesos>(DESGLOSE_DEMO);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ movimiento: SIN_REDUCCION, fijar: FIJAR }, (ctx) => {
        if (!ctx.conditions?.movimiento) return;
        const q = gsap.utils.selector(raiz);
        const pasos = q('[data-paso]');
        const pesos = q('[data-peso]');
        const estado = { p: 0 };
        const pintar = () => {
          setPuntaje(Math.round(estado.p * PUNTAJE_DEMO));
          setDesglose({
            costo: DESGLOSE_DEMO.costo * estado.p,
            modalidad: DESGLOSE_DEMO.modalidad * estado.p,
            ubicacion: DESGLOSE_DEMO.ubicacion * estado.p,
            acreditacion: DESGLOSE_DEMO.acreditacion * estado.p,
          });
        };
        setPuntaje(0);
        setDesglose(CERO);
        gsap.set(pasos, { opacity: 0.4 });
        gsap.set(pesos, { autoAlpha: 0, y: 8 });

        const activar = (i: number) => pasos.forEach((p, n) => p.toggleAttribute('data-activo', n === i));
        activar(0);

        // Escritorio: la sección se fija centrada bajo la barra y el recorrido entero ocurre mientras se ve completa.
        // Móvil (o pantallas bajas): sin fijar, y el recorrido empieza cuando la sección ya llena buena parte de la pantalla.
        const barra = () => document.querySelector<HTMLElement>('.cabecera-san')?.offsetHeight ?? 56;
        const disparador: ScrollTrigger.Vars = ctx.conditions.fijar
          ? { trigger: raiz.current, start: () => `center ${(window.innerHeight + barra()) / 2}px`, end: '+=130%', pin: true, scrub: 0.5, anticipatePin: 1, invalidateOnRefresh: true }
          : { trigger: raiz.current, start: 'top 45%', end: 'bottom 75%', scrub: 0.5 };

        const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: disparador });
        tl.to(pasos[0]!, { opacity: 1, duration: 0.3 }, 0)
          .call(() => activar(0), undefined, 0)
          .call(() => activar(1), undefined, 1)
          .to(pasos[0]!, { opacity: 0.4, duration: 0.2 }, 1)
          .to(pasos[1]!, { opacity: 1, duration: 0.3 }, 1)
          .to(pesos, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.12 }, 1)
          .call(() => activar(2), undefined, 2)
          .to(pasos[1]!, { opacity: 0.4, duration: 0.2 }, 2)
          .to(pasos[2]!, { opacity: 1, duration: 0.3 }, 2)
          .to(estado, { p: 1, duration: 1.3, ease: 'power2.out', onUpdate: pintar }, 2)
          .to({}, { duration: 0.5 });

        // Las secciones de arriba cambian de alto al llegar los datos de la API: se recalculan las posiciones.
        let espera = 0;
        const ro = new ResizeObserver(() => {
          cancelAnimationFrame(espera);
          espera = requestAnimationFrame(() => ScrollTrigger.refresh());
        });
        ro.observe(document.body);
        return () => {
          ro.disconnect();
          cancelAnimationFrame(espera);
          pasos.forEach((p) => p.removeAttribute('data-activo'));
          setPuntaje(PUNTAJE_DEMO);
          setDesglose(DESGLOSE_DEMO);
        };
      });
      return () => mm.revert();
    },
    { scope: raiz },
  );

  return (
    <section ref={raiz} aria-labelledby="titulo-como" className="relative border-y border-borde bg-superficie">
      <div className="pagina-ancho seccion-ritmo grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-16">
        <div>
          <h2 id="titulo-como" className="titulo-display max-w-[18ch] text-[clamp(1.75rem,3.6vw,3rem)] font-semibold">
            Cómo funciona
          </h2>
          <ol className="mt-6 flex flex-col gap-5">
            {PASOS.map((p, i) => (
              <li
                key={p.titulo}
                data-paso
                className="group grid grid-cols-[2.25rem_1fr] gap-4 transition-colors"
              >
                <span
                  aria-hidden
                  className="numeros grid size-9 place-items-center rounded-full border border-borde-fuerte font-display text-sm font-semibold transition-colors group-data-[activo]:border-transparent group-data-[activo]:bg-acento group-data-[activo]:text-sobre-acento"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-xl font-semibold">{p.titulo}</h3>
                  <p className="mt-1 max-w-[46ch] text-texto-2">{p.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <Card variante="elevada" relleno="lg" aria-label="Ejemplo ilustrativo de un resultado">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-lg font-semibold">Oferta de ejemplo</p>
              <p className="text-sm text-texto-3">Valores de muestra para ilustrar; no son del catálogo.</p>
            </div>
            <MorphingRing valor={puntaje} cargando={false} tamano={56} color="var(--color-acento)" etiquetaValor={`Puntaje ${puntaje} de 100`} />
          </div>
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Pesos de ejemplo por criterio">
            {CRITERIOS.map((c) => (
              <li key={c} data-peso className="numeros rounded-full border border-acento-borde bg-acento-suave px-3 py-1 text-xs font-medium text-acento-texto">
                {CRITERIO_ETIQUETA[c]} {PESOS_DEMO[c]}
              </li>
            ))}
          </ul>
          <PuntajeBarra className="mt-6" puntaje={puntaje} desglose={desglose} pesos={PESOS_DEMO} />
        </Card>
      </div>
    </section>
  );
}
