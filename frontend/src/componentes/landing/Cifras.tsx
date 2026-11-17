import { useRef } from 'react';
import { Skeleton } from '@/componentes';
import { useCatalogoConteos } from '@/lib/useCatalogoConteos';
import { gsap, ScrollTrigger, SIN_REDUCCION, useGSAP } from './gsap';

const formato = new Intl.NumberFormat('es-CO');

/** Cifras reales del catálogo (conteos de la API) que suben desde 0 al entrar en pantalla. */
export function Cifras() {
  const { datos, cargando, error } = useCatalogoConteos();
  const raiz = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!datos) return;
      const mm = gsap.matchMedia();
      mm.add(SIN_REDUCCION, () => {
        const nodos = gsap.utils.toArray<HTMLElement>('[data-contar]', raiz.current);
        const finales = nodos.map((n) => Number(n.dataset.contar));
        nodos.forEach((n) => (n.textContent = '0'));
        const st = ScrollTrigger.create({
          trigger: raiz.current,
          start: 'top 85%',
          once: true,
          onEnter: () =>
            nodos.forEach((n, i) => {
              const v = { n: 0 };
              gsap.to(v, {
                n: finales[i]!,
                duration: 1.6,
                ease: 'power3.out',
                onUpdate: () => (n.textContent = formato.format(Math.round(v.n))),
                onComplete: () => (n.textContent = formato.format(finales[i]!)),
              });
            }),
        });
        return () => {
          st.kill();
          nodos.forEach((n, i) => (n.textContent = formato.format(finales[i]!)));
        };
      });
      return () => mm.revert();
    },
    { scope: raiz, dependencies: [datos] },
  );

  if (error) return null;
  const items = datos
    ? [
        { n: datos.carreras, t: datos.carreras === 1 ? 'carrera' : 'carreras' },
        { n: datos.universidades, t: datos.universidades === 1 ? 'universidad' : 'universidades' },
        { n: datos.ofertas, t: datos.ofertas === 1 ? 'oferta académica' : 'ofertas académicas' },
        { n: datos.ciudades.length, t: datos.ciudades.length === 1 ? 'ciudad' : 'ciudades' },
      ]
    : [];
  return (
    <section ref={raiz} aria-label="El catálogo en cifras" className="border-b border-borde">
      <dl className="mx-auto grid min-h-28 max-w-[80rem] grid-cols-2 gap-6 px-4 py-8 md:grid-cols-4 md:px-8" aria-busy={cargando}>
        {cargando && [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}
        {items.map((c) => (
          <div key={c.t} className="flex items-baseline gap-2.5">
            <dd className="numeros relative font-display text-4xl font-semibold">
              <span className="sr-only">{formato.format(c.n)}</span>
              {/* El número animado es decorativo; el invisible reserva el ancho final (sin saltos de diseño). */}
              <span aria-hidden className="invisible">
                {formato.format(c.n)}
              </span>
              <span aria-hidden data-contar={c.n} className="absolute inset-0">
                {formato.format(c.n)}
              </span>
            </dd>
            <dt className="text-sm text-texto-2">{c.t}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
