import { useState } from 'react';
import { Link } from 'react-router';
import { Heart } from 'lucide-react';
import { Badge, EmptyState, Skeleton } from '@/componentes';
import { useToast } from '@/componentes/Toast';
import { catalogo, mensajeError, usuarios } from '@/lib/api';
import { ciudadLegible, etiquetaJornada, etiquetaModalidad, formatoCop, nombreLegible } from '@/lib/formato';
import { useCarga } from '@/lib/useCarga';
import { HeartMorph } from '@/morphing';

interface Props {
  usuarioId: string;
  ids: string[];
  onQuitado: (id: string) => void;
}

export function ListaFavoritos({ usuarioId, ids, onQuitado }: Props) {
  const toast = useToast();
  const [quitando, setQuitando] = useState<Set<string>>(new Set());
  // Se cargan una vez por conjunto de ids: al quitar uno no se vuelve a pedir el resto.
  const { datos, cargando } = useCarga(async () => {
    const r = await Promise.allSettled(ids.map((id) => catalogo.oferta(id)));
    return Object.fromEntries(r.flatMap((x, i) => (x.status === 'fulfilled' ? [[ids[i]!, x.value] as const] : [])));
  }, [usuarioId]);

  const quitar = async (id: string) => {
    setQuitando((s) => new Set(s).add(id));
    try {
      await usuarios.quitarFavorito(usuarioId, id);
      // Deja ver el corazón vaciarse antes de retirar la fila.
      window.setTimeout(() => onQuitado(id), 380);
      toast.ok('Quitamos la oferta de tus favoritos.');
    } catch (e) {
      setQuitando((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
      toast.error(mensajeError(e, 'No pudimos quitar el favorito.'));
    }
  };

  if (ids.length === 0) {
    return (
      <EmptyState
        icono={<Heart />}
        titulo="Aún no guardas favoritos"
        texto="Guarda las ofertas que te interesen desde sus fichas para tener tu lista corta a la mano."
        accion={
          <Link to="/buscar" className="font-medium">
            Buscar una carrera
          </Link>
        }
      />
    );
  }

  return (
    <ul className="divide-y divide-borde overflow-hidden rounded-lg border border-borde bg-superficie" aria-busy={cargando}>
      {ids.map((id) => {
        const o = datos?.[id];
        const activo = !quitando.has(id);
        return (
          <li key={id} className="flex items-center gap-3 px-4 py-3">
            {cargando ? (
              <Skeleton className="h-10 flex-1" />
            ) : o ? (
              <Link to={`/ofertas/${id}`} className="min-w-0 flex-1 text-texto no-underline hover:underline">
                <span className="block truncate font-medium">{nombreLegible(o.carrera)}</span>
                <span className="block truncate text-sm text-texto-2">
                  {o.universidad} · {ciudadLegible(o.ciudad)}
                </span>
                <span className="mt-1.5 flex flex-wrap gap-1.5">
                  <Badge>{etiquetaModalidad(o.modalidad)}</Badge>
                  <Badge>{etiquetaJornada(o.jornada)}</Badge>
                  <Badge tono="acento" className="numeros">
                    {formatoCop(o.costo)}
                  </Badge>
                </span>
              </Link>
            ) : (
              <p className="min-w-0 flex-1 text-sm text-texto-2">Esta oferta ya no está disponible.</p>
            )}
            <HeartMorph
              activo={activo}
              onCambio={() => void quitar(id)}
              etiqueta={o ? `Quitar ${nombreLegible(o.carrera)} de ${o.universidad} de favoritos` : 'Quitar de favoritos'}
              color="var(--color-acento)"
              className="size-10 shrink-0 hover:bg-superficie-2"
            />
          </li>
        );
      })}
    </ul>
  );
}
