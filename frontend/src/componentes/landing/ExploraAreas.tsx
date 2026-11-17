import { useMemo, useRef } from 'react';
import { Link } from 'react-router';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import { Skeleton } from '@/componentes';
import { FotoConFallback } from '@/componentes/catalogo';
import { iconoArea } from '@/lib/areas';
import { fotoCarrera } from '@/lib/fotos';
import { resumenAreas } from '@/lib/portada';
import { useCatalogoCompleto } from '@/lib/useCatalogoConteos';
import { useRevelado } from './gsap';

const TARJETA =
  'group flex h-full flex-col overflow-hidden rounded-lg border border-borde bg-superficie text-texto no-underline transition-[box-shadow,border-color] duration-[var(--dur-rapida)] hover:border-borde-fuerte hover:shadow-2';

/** "Explora por área": una tarjeta por área (de las carreras de la API) con la foto de su carrera con más ofertas y sus conteos. */
export function ExploraAreas() {
  const { datos, error } = useCatalogoCompleto();
  const raiz = useRef<HTMLElement>(null);
  const areas = useMemo(() => (datos ? resumenAreas(datos.carreras, datos.ofertas) : null), [datos]);
  useRevelado(raiz, [areas]);

  if (error || (areas && areas.length === 0)) return null;
  return (
    <section ref={raiz} aria-labelledby="titulo-areas" className="pagina-ancho seccion-ritmo">
      <h2 id="titulo-areas" className="titulo-display mb-6 text-[clamp(1.5rem,3vw,2.25rem)] font-semibold md:mb-8">
        Explora por área
      </h2>
      <ul className="grid grid-cols-2 gap-[var(--gap-grilla)] p-0 lg:grid-cols-4" aria-busy={!areas}>
        {!areas && Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-56 rounded-lg" />)}
        {areas?.map((a) => {
          const foto = fotoCarrera(a.representativa);
          const Icono = iconoArea(a.area);
          return (
            <li key={a.area} data-revela className="list-none">
              <Link to={`/carreras?area=${encodeURIComponent(a.area)}`} viewTransition className={TARJETA}>
                <div className="relative">
                  <FotoConFallback src={foto.src} sm={foto.sm} sizes="(min-width: 1024px) 18rem, 50vw" width={400} height={250} area={a.area} />
                  <span aria-hidden className="absolute bottom-2 left-2 grid size-9 place-items-center rounded-md bg-superficie/90 text-acento-texto backdrop-blur-sm">
                    <Icono className="size-[1.15rem]" />
                  </span>
                </div>
                <span className="flex flex-1 flex-col gap-1 p-3 md:p-4">
                  <span className="line-clamp-2 block min-h-[2.5rem] font-display text-base leading-5 font-semibold md:text-lg md:leading-6 md:min-h-12">{a.etiqueta}</span>
                  <span className="numeros mt-auto block text-xs text-texto-2 md:text-sm">
                    {a.carreras} {a.carreras === 1 ? 'carrera' : 'carreras'} · {a.ofertas} {a.ofertas === 1 ? 'oferta' : 'ofertas'}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
        {areas && (
          <li data-revela className="list-none">
            <Link to="/carreras" viewTransition className={`${TARJETA} items-start justify-between bg-acento-suave! p-4 md:p-5`}>
              <LayoutGrid className="size-6 text-acento-texto" aria-hidden />
              <span>
                <span className="block font-display text-base leading-5 font-semibold md:text-lg md:leading-6">Todo el catálogo</span>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-acento-texto">
                  Ver las carreras <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
                </span>
              </span>
            </Link>
          </li>
        )}
      </ul>
    </section>
  );
}
