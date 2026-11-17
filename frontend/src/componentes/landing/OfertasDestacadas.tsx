import { useMemo, useRef } from 'react';
import { Link } from 'react-router';
import { BadgeCheck, MapPin } from 'lucide-react';
import { Badge, Skeleton } from '@/componentes';
import { FotoConFallback } from '@/componentes/catalogo';
import { fotoCarrera } from '@/lib/fotos';
import { ciudadLegible, etiquetaModalidad, formatoCop, nombreLegible } from '@/lib/formato';
import type { OfertaAcademica } from '@/lib/modelos';
import { ofertasEconomicasAcreditadas, ofertasVirtuales } from '@/lib/portada';
import { useCatalogoCompleto } from '@/lib/useCatalogoConteos';
import { useRevelado } from './gsap';

function TarjetaOferta({ o }: { o: OfertaAcademica }) {
  const foto = fotoCarrera({ nombre: o.carrera, imagenUrl: o.carreraImagenUrl });
  return (
    <li data-revela className="w-[16.5rem] shrink-0 snap-start list-none">
      <Link
        to={`/ofertas/${o.id}`}
        viewTransition
        className="group flex h-full flex-col overflow-hidden rounded-lg border border-borde bg-superficie text-texto no-underline transition-[box-shadow,border-color] duration-[var(--dur-rapida)] hover:border-borde-fuerte hover:shadow-2"
      >
        <FotoConFallback src={foto.src} sm={foto.sm} sizes="16.5rem" width={400} height={225} />
        <span className="flex flex-1 flex-col gap-1 p-3">
          <span className="line-clamp-2 block min-h-10 text-sm leading-5 font-semibold">{nombreLegible(o.carrera)}</span>
          <span className="block truncate text-xs text-texto-2">{o.universidad}</span>
          <span className="flex items-center gap-1 text-xs text-texto-3">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{ciudadLegible(o.ciudad)}</span>
          </span>
          <span className="mt-auto flex items-end justify-between gap-2 pt-2">
            <span className="numeros font-display text-base font-semibold">
              {formatoCop(o.costo)}
              <span className="ml-1 text-xs font-normal text-texto-3">por periodo</span>
            </span>
          </span>
          <span className="flex h-6 gap-1.5 overflow-hidden">
            <Badge>{etiquetaModalidad(o.modalidad)}</Badge>
                        {o.acreditacion && (
              <Badge tono="ok">
                <BadgeCheck className="size-3.5" aria-hidden />
                Acreditada
              </Badge>
            )}
          </span>
        </span>
      </Link>
    </li>
  );
}

function Riel({ id, titulo, ofertas, enlace }: { id: string; titulo: string; ofertas: OfertaAcademica[]; enlace: { a: string; t: string } }) {
  return (
    <div role="group" aria-labelledby={id}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 id={id} className="text-lg font-semibold md:text-xl">
          {titulo}
        </h3>
        <Link to={enlace.a} viewTransition className="shrink-0 text-sm font-medium">
          {enlace.t}
        </Link>
      </div>
      <ul className="pista-tarjetas -mx-[var(--gutter)] snap-x snap-mandatory scroll-px-[var(--gutter)] overflow-x-auto px-[var(--gutter)] pb-3">
        {ofertas.map((o) => (
          <TarjetaOferta key={o.id} o={o} />
        ))}
      </ul>
    </div>
  );
}

/** "Ofertas destacadas": dos tiras calculadas con las ofertas reales: las acreditadas más económicas y las virtuales más económicas. */
export function OfertasDestacadas() {
  const { datos, error } = useCatalogoCompleto();
  const raiz = useRef<HTMLElement>(null);
  const economicas = useMemo(() => (datos ? ofertasEconomicasAcreditadas(datos.ofertas, 8) : null), [datos]);
  const virtuales = useMemo(() => (datos ? ofertasVirtuales(datos.ofertas, 8) : null), [datos]);
  useRevelado(raiz, [economicas, virtuales]);

  if (error || (datos && !economicas?.length && !virtuales?.length)) return null;
  return (
    <section ref={raiz} aria-labelledby="titulo-ofertas" className="pagina-ancho seccion-ritmo">
      <h2 id="titulo-ofertas" className="titulo-display mb-6 text-[clamp(1.5rem,3vw,2.25rem)] font-semibold md:mb-8">
        Ofertas destacadas
      </h2>
      {!datos ? (
        <div aria-busy="true" className="pista-tarjetas overflow-hidden">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-72 w-[16.5rem] shrink-0 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-8 md:gap-10">
          {!!economicas?.length && <Riel id="riel-economicas" titulo="Más económicas acreditadas" ofertas={economicas} enlace={{ a: '/carreras', t: 'Ver carreras' }} />}
          {!!virtuales?.length && <Riel id="riel-virtuales" titulo="Virtuales" ofertas={virtuales} enlace={{ a: '/carreras', t: 'Ver carreras' }} />}
        </div>
      )}
    </section>
  );
}
