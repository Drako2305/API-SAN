import { GitCompareArrows, Search, TriangleAlert } from 'lucide-react';
import { Button, EmptyState, LinkButton, Skeleton } from '@/componentes';
import { TablaComparar } from '@/componentes/comparar/TablaComparar';
import { comparaciones } from '@/lib/api';
import { formatoCop, formatoPuntaje } from '@/lib/formato';
import { MIN_COMPARAR, useSeleccion } from '@/lib/seleccionComparar';
import { useCarga } from '@/lib/useCarga';

function Dato({ t, v }: { t: string; v: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-sobre-acento/80">{t}</dt>
      <dd className="numeros mt-0.5 truncate font-display text-xl font-semibold">{v}</dd>
    </div>
  );
}

export default function Comparar() {
  const sel = useSeleccion();
  const ids = sel.ofertas.map((o) => o.id);
  const clave = ids.join(',');

  const { datos, cargando, error, recargar } = useCarga(
    () => (ids.length >= MIN_COMPARAR ? comparaciones.crear(ids) : Promise.resolve(null)),
    [clave],
  );

  if (!sel.lista) {
    return (
      <>
        <title>Comparar ofertas · SAN</title>
        <h1 className="mb-6 text-[1.75rem] md:text-3xl">Comparar ofertas</h1>
        <EmptyState
          icono={<GitCompareArrows />}
          titulo={sel.total === 0 ? 'Aún no elegiste ofertas' : 'Elige una oferta más'}
          texto={
            sel.total === 0
              ? 'Marca "Comparar" en los resultados de una búsqueda. Puedes poner de 2 a 4 ofertas lado a lado.'
              : 'Necesitas al menos 2 ofertas para compararlas. Vuelve a los resultados y marca otra.'
          }
          accion={
            <LinkButton to="/buscar" icono={<Search className="size-4" aria-hidden />}>
              Buscar una carrera
            </LinkButton>
          }
        />
      </>
    );
  }

  const filas = datos?.tabla.filter((f) => ids.includes(f.ofertaId)) ?? [];
  const mejor = filas.find((f) => f.ofertaId === datos?.mejorOfertaId);
  const menorCosto = filas.length ? Math.min(...filas.map((f) => f.costoTotal)) : null;

  return (
    <>
      <title>Comparar ofertas · SAN</title>
      <header className="mb-6 overflow-hidden rounded-lg bg-acento text-sobre-acento">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 px-5 pt-6 pb-5 md:px-7">
          <div className="min-w-0">
            <h1 className="text-[1.75rem] text-sobre-acento md:text-3xl">Comparar ofertas</h1>
            <p className="mt-1.5 text-sobre-acento/90">{sel.ofertas.map((o) => o.universidad).join(' · ')}</p>
          </div>
          <Button variante="secundario" tamano="sm" onClick={sel.vaciar}>
            Vaciar comparación
          </Button>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-sobre-acento/25 px-5 py-4 md:grid-cols-3 md:px-7">
          <Dato t="Ofertas comparadas" v={String(sel.total)} />
          <Dato t="Mejor oferta" v={mejor ? mejor.universidad : '-'} />
          <Dato t="Menor costo total" v={menorCosto != null ? formatoCop(menorCosto) : '-'} />
        </dl>
      </header>

      {error ? (
        <EmptyState
          icono={<TriangleAlert />}
          titulo="No pudimos hacer la comparación"
          texto={error}
          accion={<Button onClick={recargar}>Reintentar</Button>}
        />
      ) : cargando && !datos ? (
        <div aria-busy="true" aria-label="Cargando comparación" className="flex flex-col gap-3">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
        </div>
      ) : (
        <>
          <TablaComparar filas={filas} mejorOfertaId={datos?.mejorOfertaId ?? ''} seleccion={sel.ofertas} onQuitar={sel.quitar} />
          {mejor && (
            <p className="mt-4 text-sm text-texto-2">
              El puntaje de la comparación suma 50 puntos si la oferta está acreditada y hasta 50 según su costo total (más barata, más puntos). La mejor oferta es la de
              mayor puntaje{mejor ? `: ${mejor.universidad}, con ${formatoPuntaje(mejor.puntaje)} de 100` : ''}.
            </p>
          )}
        </>
      )}
    </>
  );
}
