import { useMemo } from 'react';
import { Link } from 'react-router';
import { catalogo } from '@/lib/api';
import { etiquetaArea } from '@/lib/areas';
import { fotoCarrera } from '@/lib/fotos';
import { nombreLegible } from '@/lib/formato';
import { useCarga } from '@/lib/useCarga';
import { Skeleton } from '@/componentes';
import { FotoConFallback } from './FotoConFallback';

/** Las carreras con más ofertas en el catálogo (el conteo sale de la API, no se inventa). */
export function CarrerasPopulares({ cantidad = 6 }: { cantidad?: number }) {
  const carreras = useCarga(() => catalogo.carreras(), []);
  const ofertas = useCarga(() => catalogo.ofertas(), []);

  const top = useMemo(() => {
    if (!carreras.datos || !ofertas.datos) return null;
    const conteo = new Map<string, number>();
    for (const o of ofertas.datos) {
      const k = o.carreraId ?? o.carrera;
      conteo.set(k, (conteo.get(k) ?? 0) + 1);
    }
    return carreras.datos
      .map((c) => ({ c, n: conteo.get(c.id) ?? conteo.get(c.nombre) ?? 0 }))
      .filter((x) => x.n > 0)
      .sort((a, b) => b.n - a.n || a.c.nombre.localeCompare(b.c.nombre, 'es'))
      .slice(0, cantidad);
  }, [carreras.datos, ofertas.datos, cantidad]);

  if (carreras.error || ofertas.error || (top && top.length === 0)) return null;

  return (
    <section aria-labelledby="populares" className="mt-12">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 id="populares" className="text-lg">
          Carreras populares
        </h2>
        <Link to="/carreras" viewTransition className="text-sm font-medium">
          Ver el catálogo
        </Link>
      </div>
      {!top ? (
        <div aria-busy="true" className="rejilla-tarjetas [--min-tarjeta:10rem]">
          {Array.from({ length: cantidad }, (_, i) => (
            <Skeleton key={i} className="h-60 rounded-lg" />
          ))}
        </div>
      ) : (
        <ul className="pista-tarjetas -mx-4 snap-x snap-mandatory overflow-x-auto px-4 pb-2 md:mx-0 md:rejilla-tarjetas md:overflow-visible md:px-0 md:pb-0 md:[--min-tarjeta:10rem]">
          {top.map(({ c, n }) => {
            const foto = fotoCarrera(c);
            return (
              <li key={c.id} className="w-40 shrink-0 snap-start md:w-auto md:shrink">
                <Link
                  to={`/buscar?carrera=${encodeURIComponent(c.nombre)}`}
                  viewTransition
                  className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-borde bg-superficie text-texto no-underline transition-[box-shadow,border-color] duration-[var(--dur-rapida)] hover:border-borde-fuerte hover:shadow-2"
                >
                  <FotoConFallback src={foto.src} sm={foto.sm} sizes="(min-width: 1280px) 11rem, (min-width: 768px) 30vw, 10rem" width={400} height={300} area={c.area} />
                  <span className="flex flex-1 flex-col gap-1 p-3">
                    <span className="line-clamp-2 block min-h-[2.5rem] text-sm leading-5 font-semibold">{nombreLegible(c.nombre)}</span>
                    <span className="numeros mt-auto block truncate text-xs text-texto-3">
                      {c.area ? `${etiquetaArea(c.area)} · ` : ''}
                      {n} {n === 1 ? 'oferta' : 'ofertas'}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
