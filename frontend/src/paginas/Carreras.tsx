import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ChevronDown, GraduationCap, LayoutGrid, List, Search } from 'lucide-react';
import { Avatar, EmptyState, EncabezadoPagina, Input, claseBoton } from '@/componentes';
import { Cargando } from '@/componentes/catalogo';
import { catalogo } from '@/lib/api';
import { cn } from '@/lib/cn';
import { ciudadLegible, formatoCop, nombreLegible } from '@/lib/formato';
import type { Carrera, OfertaAcademica } from '@/lib/modelos';
import { useCarga } from '@/lib/useCarga';

type Vista = 'cuadricula' | 'lista';

function TarjetaCarrera({ carrera, ofertas, vista }: { carrera: Carrera; ofertas: OfertaAcademica[] | null; vista: Vista }) {
  const nombre = nombreLegible(carrera.nombre);
  const n = ofertas?.length;
  return (
    <li className={cn('rounded-lg border border-borde bg-superficie', vista === 'lista' && 'overflow-hidden')}>
      <article className={cn('flex flex-col gap-3 p-4', vista === 'lista' && 'sm:flex-row sm:items-center')}>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar nombre={nombre} tamano="lg" />
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold">{nombre}</h2>
            <p className="numeros text-sm text-texto-3">
              {n === undefined ? ' ' : n === 0 ? 'Sin ofertas por ahora' : `${n} ${n === 1 ? 'oferta' : 'ofertas'}`}
            </p>
          </div>
        </div>
        <Link to={`/buscar?carrera=${encodeURIComponent(carrera.nombre)}`} viewTransition className={claseBoton('secundario', 'sm', 'no-underline')}>
          <Search className="size-4" aria-hidden />
          Buscar <span className="sr-only">{nombre}</span>
        </Link>
      </article>
      {!!n && (
        <details className="group border-t border-borde">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-4 text-sm font-medium text-acento-texto [&::-webkit-details-marker]:hidden">
            Ver las {n} {n === 1 ? 'oferta' : 'ofertas'}
            <ChevronDown className="size-4 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
          </summary>
          <ul className="divide-y divide-borde border-t border-borde">
            {ofertas!.map((o) => (
              <li key={o.id}>
                <Link to={`/ofertas/${o.id}`} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-texto no-underline hover:bg-superficie-2">
                  <span className="min-w-0 truncate">
                    {o.universidad} <span className="text-texto-3">· {ciudadLegible(o.ciudad)}</span>
                  </span>
                  <span className="numeros shrink-0 text-texto-2">{formatoCop(o.costo)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </details>
      )}
    </li>
  );
}

export default function Carreras() {
  const [params, setParams] = useSearchParams();
  const nombre = params.get('nombre') ?? '';
  const [texto, setTexto] = useState(nombre);
  const [vista, setVista] = useState<Vista>('cuadricula');

  // Búsqueda con retardo: la URL (?nombre) se actualiza cuando la persona deja de escribir.
  useEffect(() => {
    const t = setTimeout(() => {
      const limpio = texto.trim();
      if (limpio === nombre) return;
      setParams(limpio ? { nombre: limpio } : {}, { replace: true });
    }, 300);
    return () => clearTimeout(t);
  }, [texto, nombre, setParams]);

  const carreras = useCarga(() => catalogo.carreras(nombre || undefined), [nombre]);
  const ofertas = useCarga(() => catalogo.ofertas(), []);

  const porCarrera = useMemo(() => {
    const m = new Map<string, OfertaAcademica[]>();
    for (const o of ofertas.datos ?? []) {
      const k = o.carreraId ?? o.carrera;
      m.set(k, [...(m.get(k) ?? []), o]);
    }
    return m;
  }, [ofertas.datos]);
  const deCarrera = (c: Carrera) => (ofertas.datos ? (porCarrera.get(c.id) ?? porCarrera.get(c.nombre) ?? []) : null);

  const lista = carreras.datos;
  const BOTON = 'grid size-10 place-items-center rounded-md border transition-colors';

  return (
    <>
      <title>Carreras · SAN</title>
      <EncabezadoPagina titulo="Carreras" descripcion="Explora las carreras del catálogo y entra a las ofertas que tiene cada una." />

      <div className="mb-5 flex flex-wrap items-end gap-3">
        <search className="min-w-0 flex-1 basis-64">
          <Input etiqueta="Buscar carrera" type="search" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Por ejemplo, Psicología" autoComplete="off" />
        </search>
        <div role="group" aria-label="Vista" className="flex gap-1.5">
          {([['cuadricula', LayoutGrid, 'Cuadrícula'], ['lista', List, 'Lista']] as const).map(([v, Icono, etiqueta]) => (
            <button
              key={v}
              type="button"
              aria-pressed={vista === v}
              aria-label={etiqueta}
              title={etiqueta}
              onClick={() => setVista(v)}
              className={cn(BOTON, vista === v ? 'border-acento-borde bg-acento-suave text-acento-texto' : 'border-borde bg-superficie text-texto-2 hover:bg-superficie-2')}
            >
              <Icono className="size-4" aria-hidden />
            </button>
          ))}
        </div>
      </div>

      <p className="sr-only" role="status">
        {lista && !carreras.cargando ? `${lista.length} carreras` : ''}
      </p>

      {carreras.error ? (
        <EmptyState icono={<GraduationCap />} titulo="No pudimos cargar las carreras" texto={carreras.error} accion={<button type="button" className="font-medium text-acento-texto" onClick={carreras.recargar}>Intentar de nuevo</button>} />
      ) : !lista ? (
        <Cargando filas={4} alto="h-20" />
      ) : lista.length === 0 ? (
        <EmptyState icono={<GraduationCap />} titulo="Ninguna carrera coincide" texto={`No hay carreras que contengan "${nombre}". Prueba con otra palabra.`} accion={<button type="button" className="font-medium text-acento-texto" onClick={() => setTexto('')}>Ver todas las carreras</button>} />
      ) : (
        <ul aria-busy={carreras.cargando} className={cn('grid items-start gap-3', vista === 'cuadricula' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}>
          {lista.map((c) => (
            <TarjetaCarrera key={c.id} carrera={c} ofertas={deCarrera(c)} vista={vista} />
          ))}
        </ul>
      )}
    </>
  );
}
