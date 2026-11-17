import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Building2, MapPin } from 'lucide-react';
import { EmptyState, EncabezadoPagina } from '@/componentes';
import { Cargando, FotoUniversidad } from '@/componentes/catalogo';
import { catalogo } from '@/lib/api';
import { cn } from '@/lib/cn';
import { ciudadLegible } from '@/lib/formato';
import { useCarga } from '@/lib/useCarga';

const CHIP = 'inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors';

export default function Universidades() {
  const [params, setParams] = useSearchParams();
  const ciudad = params.get('ciudad') ?? '';

  const todas = useCarga(() => catalogo.universidades(), []);
  const lista = useCarga(() => catalogo.universidades(ciudad || undefined), [ciudad]);
  const ofertas = useCarga(() => catalogo.ofertas(), []);

  const ciudades = useMemo(() => [...new Set((todas.datos ?? []).map((u) => u.ciudad))].sort((a, b) => a.localeCompare(b, 'es')), [todas.datos]);
  const conteo = useMemo(() => {
    const m = new Map<string, number>();
    for (const o of ofertas.datos ?? []) if (o.universidadId) m.set(o.universidadId, (m.get(o.universidadId) ?? 0) + 1);
    return m;
  }, [ofertas.datos]);

  const elegir = (c: string) => setParams(c ? { ciudad: c } : {}, { replace: true });
  const datos = lista.datos;

  return (
    <>
      <title>Universidades · SAN</title>
      <EncabezadoPagina titulo="Universidades" descripcion="Instituciones del catálogo, con su ciudad y las ofertas que tienen disponibles." />

      <div role="group" aria-label="Filtrar por ciudad" className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
        {[['', 'Todas'], ...ciudades.map((c) => [c, ciudadLegible(c)])].map(([valor, etiqueta]) => {
          const activo = valor === ciudad;
          return (
            <button
              key={valor}
              type="button"
              aria-pressed={activo}
              onClick={() => elegir(valor!)}
              className={cn(CHIP, 'shrink-0', activo ? 'border-acento-borde bg-acento-suave text-acento-texto' : 'border-borde bg-superficie text-texto-2 hover:bg-superficie-2')}
            >
              {etiqueta}
            </button>
          );
        })}
        {/* Ciudad de la URL que no está en el catálogo: se muestra para poder quitarla. */}
        {ciudad && todas.datos && !ciudades.includes(ciudad) && (
          <button type="button" aria-pressed onClick={() => elegir('')} className={cn(CHIP, 'shrink-0 border-acento-borde bg-acento-suave text-acento-texto')}>
            {ciudadLegible(ciudad)}
          </button>
        )}
      </div>

      <p className="sr-only" role="status">
        {datos && !lista.cargando ? `${datos.length} universidades` : ''}
      </p>

      {lista.error ? (
        <EmptyState icono={<Building2 />} titulo="No pudimos cargar las universidades" texto={lista.error} accion={<button type="button" className="font-medium text-acento-texto" onClick={lista.recargar}>Intentar de nuevo</button>} />
      ) : !datos ? (
        <Cargando filas={3} alto="h-56" />
      ) : datos.length === 0 ? (
        <EmptyState icono={<Building2 />} titulo="No hay universidades en esa ciudad" texto="Prueba con otra ciudad o mira todo el catálogo." accion={<button type="button" className="font-medium text-acento-texto" onClick={() => elegir('')}>Ver todas</button>} />
      ) : (
        <ul aria-busy={lista.cargando} className="rejilla-tarjetas">
          {datos.map((u) => {
            const n = ofertas.datos ? (conteo.get(u.id) ?? 0) : null;
            return (
              <li key={u.id}>
                <Link to={`/universidades/${u.id}`} viewTransition className="group flex h-full flex-col overflow-hidden rounded-lg border border-borde bg-superficie text-texto no-underline transition-[box-shadow,border-color] duration-[var(--dur-rapida)] hover:border-borde-fuerte hover:shadow-2">
                  <FotoUniversidad nombre={u.nombre} imagenUrl={u.imagenUrl} sizes="(min-width: 1280px) 22rem, (min-width: 640px) 45vw, 100vw" />
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <h2 className="line-clamp-2 min-h-[2.75rem] text-base font-semibold">{u.nombre}</h2>
                    <p className="mt-auto flex items-center justify-between gap-2 text-sm text-texto-3">
                      <span className="inline-flex min-w-0 items-center gap-1">
                        <MapPin className="size-3.5" aria-hidden />
                        <span className="truncate">{ciudadLegible(u.ciudad)}</span>
                      </span>
                      <span className="numeros shrink-0">{n === null ? '' : `${n} ${n === 1 ? 'oferta' : 'ofertas'}`}</span>
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-6 text-xs text-texto-3">
        Fotos de Wikimedia Commons con licencia libre. <a href="/campus/CREDITOS.md" className="text-texto-2">Ver créditos</a>
      </p>
    </>
  );
}
