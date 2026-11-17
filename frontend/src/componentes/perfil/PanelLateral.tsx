import { Link, useNavigate } from 'react-router';
import { ArrowUpRight, LogOut } from 'lucide-react';
import { Avatar, Button, Skeleton } from '@/componentes';
import { busquedas } from '@/lib/api';
import { ciudadLegible, nombreLegible } from '@/lib/formato';
import { busquedasRecientes } from '@/lib/recientes';
import { useSesion } from '@/lib/sesion';
import { useCarga } from '@/lib/useCarga';

const RESUMEN = 'group border-b border-borde last:border-b-0';
const TITULO =
  'flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold marker:hidden [&::-webkit-details-marker]:hidden ' +
  'after:size-2 after:rotate-45 after:border-r-2 after:border-b-2 after:border-texto-3 after:transition-transform after:duration-[var(--dur-rapida)] group-open:after:-rotate-135 motion-reduce:after:transition-none';

function Actividad() {
  const ids = busquedasRecientes().slice(0, 5);
  const { datos, cargando } = useCarga(async () => {
    const r = await Promise.allSettled(ids.map((id) => busquedas.resumen(id)));
    return r.flatMap((x) => (x.status === 'fulfilled' ? [x.value] : []));
  }, []);

  if (ids.length === 0) return <p className="px-4 pb-4 text-sm text-texto-2">Tus búsquedas recientes aparecerán aquí.</p>;
  return (
    <ul className="pb-2" aria-busy={cargando}>
      {cargando && ids.map((id) => <li key={id} className="px-4 py-2"><Skeleton className="h-9" /></li>)}
      {!cargando && (datos?.length ?? 0) === 0 && <li className="px-4 pb-3 text-sm text-texto-2">No pudimos recuperar tus búsquedas.</li>}
      {datos?.map((b) => (
        <li key={b.id}>
          <Link to={`/busquedas/${b.id}`} className="flex items-center gap-2 px-4 py-2 text-sm text-texto no-underline hover:bg-superficie-2">
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{nombreLegible(b.filtros.carrera)}</span>
              <span className="block truncate text-xs text-texto-3">
                {b.filtros.ciudad ? ciudadLegible(b.filtros.ciudad) : 'Todas las ciudades'} · {b.total} {b.total === 1 ? 'resultado' : 'resultados'}
              </span>
            </span>
            <ArrowUpRight className="size-4 text-texto-3" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Panel lateral con secciones plegables nativas (`<details>`). */
export function PanelLateral() {
  const { usuario, logout } = useSesion();
  const navegar = useNavigate();
  if (!usuario) return null;
  return (
    <aside aria-label="Panel de cuenta" className="self-start overflow-hidden rounded-lg border border-borde bg-superficie">
      <details className={RESUMEN} open>
        <summary className={TITULO}>Actividad</summary>
        <Actividad />
      </details>
      <details className={RESUMEN}>
        <summary className={TITULO}>Cuenta</summary>
        <div className="flex flex-col gap-3 px-4 pb-4">
          <div className="flex items-center gap-3">
            <Avatar nombre={usuario.nombre} tamano="sm" />
            <p className="min-w-0 truncate text-sm text-texto-2">{usuario.correo}</p>
          </div>
          <Button
            variante="secundario"
            icono={<LogOut className="size-4" aria-hidden />}
            onClick={() => {
              logout();
              navegar('/');
            }}
          >
            Cerrar sesión
          </Button>
        </div>
      </details>
    </aside>
  );
}
