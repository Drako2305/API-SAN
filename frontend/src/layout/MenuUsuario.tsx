import { useEffect, useId, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { Heart, LogOut, UserRound } from 'lucide-react';
import { Avatar } from '@/componentes';
import { usuarios } from '@/lib/api';
import { useSesion } from '@/lib/sesion';

/**
 * Menú de la cuenta con `popover` nativo (cierra con Esc y clic fuera sin código extra).
 * El panel se ancla al avatar (`.menu-cuenta` en index.css) para que su borde derecho coincida con él.
 */
export function MenuUsuario() {
  const { usuario, logout, actualizarSesion } = useSesion();
  const navegar = useNavigate();
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  // La foto no viaja en el login: se consulta una vez y queda en la sesión.
  const idUsuario = usuario?.id;
  const sinConsultar = usuario !== null && usuario.avatar === undefined;
  useEffect(() => {
    if (!idUsuario || !sinConsultar) return;
    let vivo = true;
    usuarios
      .obtener(idUsuario)
      .then((d) => vivo && actualizarSesion({ avatar: d.perfil?.avatar ?? null }))
      .catch(() => undefined);
    return () => {
      vivo = false;
    };
  }, [idUsuario, sinConsultar, actualizarSesion]);

  if (!usuario) return null;

  const cerrar = () => ref.current?.hidePopover?.();
  const item = 'flex h-10 w-full items-center gap-2.5 rounded-md px-2.5 text-sm text-texto no-underline hover:bg-superficie-2 focus-visible:bg-superficie-2';

  return (
    <>
      <button
        type="button"
        popoverTarget={id}
        aria-label={`Menú de la cuenta de ${usuario.nombre}`}
        className="rounded-full outline-offset-2 transition-shadow hover:shadow-[0_0_0_3px_var(--c-acento-suave)]"
        style={{ anchorName: '--avatar-cuenta' } as React.CSSProperties}
      >
        <Avatar nombre={usuario.nombre} src={usuario.avatar} />
      </button>
      <div ref={ref} id={id} popover="auto" className="menu-cuenta w-64 rounded-lg border border-borde bg-superficie p-1.5 text-texto shadow-3">
        <div className="flex items-center gap-3 px-2.5 py-2">
          <Avatar nombre={usuario.nombre} src={usuario.avatar} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{usuario.nombre}</p>
            <p className="truncate text-xs text-texto-3">{usuario.correo}</p>
          </div>
        </div>
        <hr className="my-1 border-borde" />
        <Link to="/perfil" viewTransition className={item} onClick={cerrar}>
          <UserRound className="size-4 text-texto-3" aria-hidden /> Mi perfil
        </Link>
        <Link to="/perfil?pestana=favoritos" viewTransition className={item} onClick={cerrar}>
          <Heart className="size-4 text-texto-3" aria-hidden /> Mis favoritos
        </Link>
        <hr className="my-1 border-borde" />
        <button
          type="button"
          className={item}
          onClick={() => {
            cerrar();
            logout();
            navegar('/', { viewTransition: true });
          }}
        >
          <LogOut className="size-4 text-texto-3" aria-hidden /> Cerrar sesión
        </button>
      </div>
    </>
  );
}
