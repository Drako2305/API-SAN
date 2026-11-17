import { Outlet, useLocation } from 'react-router';
import { NavSuperior } from './NavSuperior';

/**
 * Marco común de portada y aplicación: la cabecera vive aquí, por encima de las rutas, así no se desmonta
 * (la portada y /inicio llevan su propio buscador en el contenido, así que la cabecera no repite el suyo) al pasar de la portada a /inicio (solo cambia el contenido) y su `view-transition-name` la deja fija durante el fundido.
 */
export function Marco() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-dvh">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-md focus:bg-acento focus:px-3 focus:py-2 focus:text-sobre-acento"
      >
        Saltar al contenido
      </a>
      <NavSuperior variante={pathname === '/' || pathname === '/inicio' ? 'portada' : 'app'} />
      <Outlet />
    </div>
  );
}
