import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/componentes';
import { ciudadLegible, etiquetaJornada, etiquetaModalidad, formatoCop, nombreLegible } from '@/lib/formato';
import type { OfertaAcademica } from '@/lib/modelos';

/** Fila de oferta que enlaza a su ficha. `titulo` decide si encabeza la carrera o la universidad. */
export function OfertaFila({ oferta, titulo }: { oferta: OfertaAcademica; titulo: 'carrera' | 'universidad' }) {
  const principal = titulo === 'carrera' ? nombreLegible(oferta.carrera) : oferta.universidad;
  const secundaria = titulo === 'carrera' ? null : ciudadLegible(oferta.ciudad);
  return (
    <li>
      <Link to={`/ofertas/${oferta.id}`} viewTransition className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 text-texto no-underline hover:bg-superficie-2">
        <span className="min-w-0 flex-1 basis-48">
          <span className="block truncate font-medium">{principal}</span>
          <span className="block truncate text-sm text-texto-3">
            {[secundaria, `${oferta.duracion} periodos`].filter(Boolean).join(' · ')}
          </span>
        </span>
        <span className="flex flex-wrap gap-1.5">
          <Badge>{etiquetaModalidad(oferta.modalidad)}</Badge>
          <Badge>{etiquetaJornada(oferta.jornada)}</Badge>
          {oferta.acreditacion && <Badge tono="ok">Acreditada</Badge>}
        </span>
        <span className="numeros font-display font-semibold">{formatoCop(oferta.costo)}</span>
        <ChevronRight className="size-4 text-texto-3" aria-hidden />
      </Link>
    </li>
  );
}
