import { useMemo, useRef } from 'react';
import { Link } from 'react-router';
import { ArrowRight, BadgeCheck, MapPin } from 'lucide-react';
import { Badge, Skeleton } from '@/componentes';
import { FotoUniversidad } from '@/componentes/catalogo';
import { ciudadLegible } from '@/lib/formato';
import { universidadesDestacadas } from '@/lib/portada';
import { useCatalogoCompleto } from '@/lib/useCatalogoConteos';
import { useRevelado } from './gsap';

/** "Universidades en el catálogo": 8 tarjetas iguales con foto de campus, ciudad, número de ofertas y cuántas son acreditadas. */
export function UniversidadesCatalogo() {
  const { datos, error } = useCatalogoCompleto();
  const raiz = useRef<HTMLElement>(null);
  const lista = useMemo(() => (datos ? universidadesDestacadas(datos.universidades, datos.ofertas, 8) : null), [datos]);
  useRevelado(raiz, [lista]);

  if (error || (lista && lista.length === 0)) return null;
  return (
    <section ref={raiz} aria-labelledby="titulo-unis" className="pagina-ancho seccion-ritmo">
      <div className="mb-6 flex items-end justify-between gap-4 md:mb-8">
        <h2 id="titulo-unis" className="titulo-display text-[clamp(1.5rem,3vw,2.25rem)] font-semibold">
          Universidades en el catálogo
        </h2>
        <Link to="/universidades" viewTransition className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium">
          Ver todas{datos ? ` (${datos.universidades.length})` : ''} <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      <ul className="grid grid-cols-1 gap-[var(--gap-grilla)] p-0 sm:grid-cols-2 lg:grid-cols-4" aria-busy={!lista}>
        {!lista && Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-60 rounded-lg" />)}
        {lista?.map(({ universidad: u, ofertas, acreditadas }) => (
          <li key={u.id} data-revela className="list-none">
            <Link
              to={`/universidades/${u.id}`}
              viewTransition
              className="group flex h-full flex-col overflow-hidden rounded-lg border border-borde bg-superficie text-texto no-underline transition-[box-shadow,border-color] duration-[var(--dur-rapida)] hover:border-borde-fuerte hover:shadow-2"
            >
              <FotoUniversidad nombre={u.nombre} imagenUrl={u.imagenUrl} sizes="(min-width: 1024px) 18rem, (min-width: 640px) 45vw, 90vw" />
              <span className="flex flex-1 flex-col gap-1 p-4">
                <span className="line-clamp-2 block min-h-12 font-display text-lg leading-6 font-semibold">{u.nombre}</span>
                <span className="flex items-center gap-1.5 text-sm text-texto-2">
                  <MapPin className="size-4 shrink-0 text-texto-3" aria-hidden />
                  <span className="truncate">{ciudadLegible(u.ciudad)}</span>
                </span>
                <span className="mt-auto flex flex-wrap items-center gap-2 pt-3">
                  <span className="numeros text-sm font-medium">
                    {ofertas} {ofertas === 1 ? 'oferta' : 'ofertas'}
                  </span>
                  {acreditadas > 0 && (
                    <Badge tono="ok">
                      <BadgeCheck className="size-3.5" aria-hidden />
                      {acreditadas === ofertas ? 'Todas acreditadas' : `${acreditadas} acreditadas`}
                    </Badge>
                  )}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
