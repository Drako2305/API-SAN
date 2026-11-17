import { useId, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { Heart, LogOut, Shield, UserRound } from 'lucide-react';
import { Avatar } from '@/componentes';
import { useSesion } from '@/lib/sesion';

/** Menú de la cuenta con `popover` nativo (cierra con Esc y clic fuera sin código extra). */
export function MenuUsuario() {
  const { usuario, esAdmin, logout } = useSesion();
  const navegar = useNavigate();
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  if (!usuario) return null;

  const cerrar = () => ref.current?.hidePopover?.();
  const item = 'flex h-10 w-full items-center gap-2.5 rounded-md px-2.5 text-sm text-texto no-underline hover:bg-superficie-2';

  return (
    <>
      <button
        type="button"
        popoverTarget={id}
        aria-label={`Menú de la cuenta de ${usuario.nombre}`}
        className="rounded-full outline-offset-2 transition-shadow hover:shadow-[0_0_0_3px_var(--c-acento-suave)]"
      >
        <Avatar nombre={usuario.nombre} />
      </button>
      <div
        ref={ref}
        id={id}
        popover="auto"
        className="fixed inset-auto top-[calc(var(--barra)-0.25rem)] right-3 m-0 w-60 rounded-lg border border-borde bg-superficie p-1.5 text-texto shadow-3"
      >
        <div className="px-2.5 py-2">
          <p className="truncate text-sm font-semibold">{usuario.nombre}</p>
          <p className="truncate text-xs text-texto-3">{usuario.correo}</p>
        </div>
        <hr className="my-1 border-borde" />
        <Link to="/perfil" className={item} onClick={cerrar}>
          <UserRound className="size-4 text-texto-3" aria-hidden /> Mi perfil
        </Link>
        <Link to="/perfil?pestana=favoritos" className={item} onClick={cerrar}>
          <Heart className="size-4 text-texto-3" aria-hidden /> Favoritos
        </Link>
        {esAdmin && (
          <Link to="/admin" className={item} onClick={cerrar}>
            <Shield className="size-4 text-texto-3" aria-hidden /> Administración
          </Link>
        )}
        <hr className="my-1 border-borde" />
        <button
          type="button"
          className={item}
          onClick={() => {
            cerrar();
            logout();
            navegar('/');
          }}
        >
          <LogOut className="size-4 text-texto-3" aria-hidden /> Cerrar sesión
        </button>
      </div>
    </>
  );
}
