import { Link } from 'react-router';
import { Pencil } from 'lucide-react';
import { Card, LinkButton } from '@/componentes';
import { CRITERIO_ETIQUETA, ciudadLegible, etiquetaJornada, etiquetaModalidad, formatoCop, nombreLegible } from '@/lib/formato';
import { CRITERIOS, type BusquedaResumen, type Pesos } from '@/lib/modelos';

/** URL de /buscar con los criterios de una búsqueda ya hecha, para ajustarlos. */
export function urlEditar(f: BusquedaResumen['filtros'], pesos?: Pesos): string {
  const q = new URLSearchParams();
  q.set('carrera', f.carrera);
  if (f.ciudad) q.set('ciudad', f.ciudad);
  if (f.costoMax != null) q.set('costoMax', String(f.costoMax));
  if (f.modalidad) q.set('modalidad', f.modalidad);
  if (f.jornada) q.set('jornada', f.jornada);
  if (pesos) q.set('pesos', [pesos.costo, pesos.modalidad, pesos.ubicacion, pesos.acreditacion].join(','));
  return `/buscar?${q.toString()}`;
}

function Dato({ t, v }: { t: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 py-2 text-sm">
      <dt className="text-texto-2">{t}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );
}

/** Columna izquierda: criterios de la búsqueda y pesos usados. */
export function ResumenBusqueda({ resumen, pesos }: { resumen: BusquedaResumen; pesos?: Pesos }) {
  const f = resumen.filtros;
  return (
    <Card className="lg:sticky lg:top-[calc(var(--barra)+1.5rem)]" relleno="md">
      <h2 className="text-base">Tu búsqueda</h2>
      <dl className="mt-2 divide-y divide-borde">
        <Dato t="Carrera" v={nombreLegible(f.carrera)} />
        <Dato t="Ciudad" v={f.ciudad ? ciudadLegible(f.ciudad) : 'Cualquiera'} />
        <Dato t="Costo máximo" v={f.costoMax != null ? formatoCop(f.costoMax) : 'Sin límite'} />
        <Dato t="Modalidad" v={f.modalidad ? etiquetaModalidad(f.modalidad) : 'Cualquiera'} />
        <Dato t="Jornada" v={f.jornada ? etiquetaJornada(f.jornada) : 'Cualquiera'} />
      </dl>
      {pesos && (
        <>
          <h3 className="mt-5 text-sm">Tus pesos</h3>
          <ul className="mt-2 flex flex-col gap-1.5">
            {CRITERIOS.map((c) => (
              <li key={c} className="flex items-center gap-3 text-sm">
                <span className="w-24 shrink-0 text-texto-2">{CRITERIO_ETIQUETA[c]}</span>
                <span className="flex flex-1 gap-0.5" aria-hidden>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className={`h-1.5 flex-1 rounded-full ${n <= pesos[c] ? 'bg-acento' : 'bg-superficie-3'}`} />
                  ))}
                </span>
                <span className="numeros w-8 text-right font-medium">{pesos[c]}/5</span>
              </li>
            ))}
          </ul>
        </>
      )}
      <LinkButton to={urlEditar(f, pesos)} variante="secundario" tamano="sm" className="mt-5 w-full" icono={<Pencil className="size-4" aria-hidden />}>
        Editar búsqueda
      </LinkButton>
      <p className="mt-3 text-xs text-texto-3">
        Los resultados salen ordenados por puntaje. <Link to="/buscar">Nueva búsqueda</Link>
      </p>
    </Card>
  );
}
