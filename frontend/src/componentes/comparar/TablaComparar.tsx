import { type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Badge, Button } from '@/componentes';
import { ciudadLegible, etiquetaModalidad, formatoCop, formatoPuntaje, nombreLegible } from '@/lib/formato';
import type { FilaComparacion } from '@/lib/modelos';
import type { OfertaSeleccionada } from '@/lib/seleccionComparar';
import { cn } from '@/lib/cn';

interface Props {
  filas: FilaComparacion[];
  mejorOfertaId: string;
  seleccion: OfertaSeleccionada[];
  onQuitar: (id: string) => void;
}

const CELDA = 'border-b border-borde px-4 py-3.5 align-top text-sm';
const GANADORA = 'bg-acento-suave';

/** Tabla de comparación: filas = criterios, columnas = ofertas. La columna de la mejor oferta lleva el acento. */
export function TablaComparar({ filas, mejorOfertaId, seleccion, onQuitar }: Props) {
  const datos = filas.map((f) => ({ f, sel: seleccion.find((s) => s.id === f.ofertaId), mejor: f.ofertaId === mejorOfertaId }));

  const criterios: Array<{ t: string; v: (d: (typeof datos)[number]) => ReactNode }> = [
    { t: 'Carrera', v: (d) => (d.sel ? nombreLegible(d.sel.carrera) : '-') },
    { t: 'Ciudad', v: (d) => (d.sel ? ciudadLegible(d.sel.ciudad) : '-') },
    { t: 'Puntaje de comparación', v: (d) => <span className="numeros font-display text-xl font-semibold">{formatoPuntaje(d.f.puntaje)}<span className="text-sm font-normal text-texto-3"> / 100</span></span> },
    { t: 'Costo total', v: (d) => <span className="numeros font-semibold">{formatoCop(d.f.costoTotal)}</span> },
    { t: 'Duración', v: (d) => <span className="numeros">{d.f.duracion} periodos</span> },
    { t: 'Modalidad', v: (d) => etiquetaModalidad(d.f.modalidad) },
    { t: 'Acreditación', v: (d) => <Badge tono={d.f.acreditacion ? 'ok' : 'neutro'}>{d.f.acreditacion ? 'Acreditada' : 'Sin acreditación'}</Badge> },
  ];

  return (
    <div
      role="region"
      aria-labelledby="titulo-tabla-comparar"
      tabIndex={0}
      className="overflow-x-auto rounded-lg border border-borde bg-superficie"
    >
      <table className="w-full min-w-[34rem] border-separate border-spacing-0 text-left">
        <caption id="titulo-tabla-comparar" className="sr-only">
          Comparación de ofertas por criterio. La columna resaltada es la mejor oferta.
        </caption>
        <thead>
          <tr>
            <th scope="col" className="sticky left-0 z-10 w-32 min-w-32 border-b border-borde bg-superficie px-4 py-3.5 text-xs font-medium text-texto-3 sm:w-40">
              Criterio
            </th>
            {datos.map((d) => (
              <th key={d.f.ofertaId} scope="col" className={cn('min-w-44 border-b border-borde px-4 py-3.5 align-top font-normal', d.mejor && GANADORA)}>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-display text-base leading-snug font-semibold">{d.f.universidad}</span>
                  <Button
                    variante="fantasma"
                    tamano="sm"
                    className="-mt-1 -mr-2 size-8 shrink-0 px-0"
                    onClick={() => onQuitar(d.f.ofertaId)}
                    aria-label={`Quitar ${d.f.universidad} de la comparación`}
                  >
                    <X className="size-4" aria-hidden />
                  </Button>
                </div>
                {d.mejor && (
                  <Badge tono="aviso" className="mt-1.5">
                    Mejor oferta
                  </Badge>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {criterios.map((c) => (
            <tr key={c.t}>
              <th scope="row" className="sticky left-0 z-10 border-b border-borde bg-superficie px-4 py-3.5 text-sm font-medium text-texto-2">
                {c.t}
              </th>
              {datos.map((d) => (
                <td key={d.f.ofertaId} className={cn(CELDA, d.mejor && GANADORA)}>
                  {c.v(d)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
