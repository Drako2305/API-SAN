import { Suspense, useState, type FormEvent } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { Search } from 'lucide-react';
import { Logo, LinkButton, Skeleton } from '@/componentes';
import { cn } from '@/lib/cn';
import { useSesion } from '@/lib/sesion';
import { BotonTema } from './BotonTema';
import { MenuUsuario } from './MenuUsuario';
import { ITEMS_NAV, estaActivo } from './navegacion';

function CargandoPagina() {
  return (
    <div aria-busy="true" aria-label="Cargando" className="flex flex-col gap-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <Skeleton className="mt-4 h-40 w-full" />
    </div>
  );
}

/**
 * Armazón de la aplicación: riel de iconos a la izquierda (escritorio), barra superior con búsqueda,
 * tema y cuenta, y barra inferior en móvil. Las páginas se renderizan en <Outlet />.
 */
export function Shell() {
  const { autenticado, esAdmin } = useSesion();
  const ubicacion = useLocation();
  const navegar = useNavigate();
  const [consulta, setConsulta] = useState('');

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const q = consulta.trim();
    navegar(q ? `/buscar?carrera=${encodeURIComponent(q)}` : '/buscar', { viewTransition: true });
  };

  const items = ITEMS_NAV.filter((i) => !i.soloAdmin || esAdmin);
  const moviles = items.filter((i) => i.movil);

  return (
    <div className="min-h-dvh">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-md focus:bg-acento focus:px-3 focus:py-2 focus:text-sobre-acento"
      >
        Saltar al contenido
      </a>

      {/* Riel (escritorio) */}
      <nav
        aria-label="Principal"
        className="fixed inset-y-0 left-0 z-30 hidden w-[var(--riel)] flex-col items-center gap-1 border-r border-borde bg-superficie py-3 md:flex"
      >
        <Link to={autenticado ? '/inicio' : '/'} className="mb-3 rounded-lg" aria-label="SAN, ir al inicio">
          <Logo conNombre={false} />
        </Link>
        {items.map(({ a, etiqueta, icono: Icono, ...i }) => {
          const activo = estaActivo({ a, etiqueta, icono: Icono, ...i }, ubicacion.pathname, ubicacion.search);
          return (
            <NavLink
              key={a}
              to={a}
              viewTransition
              aria-label={etiqueta}
              aria-current={activo ? 'page' : undefined}
              className={cn(
                'group relative grid size-11 place-items-center rounded-lg transition-colors duration-[var(--dur-rapida)]',
                activo ? 'bg-acento-suave text-acento-texto' : 'text-texto-3 hover:bg-superficie-2 hover:text-texto',
                i.soloAdmin && 'mt-auto',
              )}
            >
              <Icono className="size-[1.3rem]" aria-hidden />
              <span
                role="presentation"
                className="pointer-events-none absolute left-full ml-2 rounded-md bg-texto px-2 py-1 text-xs font-medium whitespace-nowrap text-fondo opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                {etiqueta}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <div className="md:pl-[var(--riel)]">
        {/* Barra superior */}
        <header className="sticky top-0 z-20 flex h-[var(--barra)] items-center gap-3 border-b border-borde bg-fondo/90 px-4 backdrop-blur-md md:px-6">
          <Link to="/" className="md:hidden" aria-label="SAN">
            <Logo conNombre={false} />
          </Link>
          <form role="search" onSubmit={enviar} className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-texto-3" aria-hidden />
            <input
              type="search"
              value={consulta}
              onChange={(e) => setConsulta(e.target.value)}
              placeholder="Buscar una carrera"
              aria-label="Buscar una carrera"
              enterKeyHint="search"
              className="h-9 w-full rounded-full border border-borde bg-superficie pr-4 pl-9 text-sm placeholder:text-texto-3 hover:border-borde-fuerte focus-visible:border-acento"
            />
          </form>
          <div className="ml-auto flex items-center gap-1.5">
            <BotonTema />
            {autenticado ? (
              <MenuUsuario />
            ) : (
              <>
                <LinkButton to="/ingresar" variante="fantasma" tamano="sm" className="hidden sm:inline-flex">
                  Ingresar
                </LinkButton>
                <LinkButton to="/registro" tamano="sm">
                  Crear cuenta
                </LinkButton>
              </>
            )}
          </div>
        </header>

        <main id="contenido" tabIndex={-1} className="mx-auto w-full max-w-[72rem] px-4 pt-6 pb-[calc(var(--nav-movil)+2rem)] outline-none md:px-8 md:pt-8 md:pb-12">
          <Suspense fallback={<CargandoPagina />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      {/* Barra inferior (móvil) */}
      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-30 flex h-[var(--nav-movil)] border-t border-borde bg-superficie pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {moviles.map((item) => {
          const activo = estaActivo(item, ubicacion.pathname, ubicacion.search);
          const Icono = item.icono;
          return (
            <NavLink
              key={item.a}
              to={item.a}
              viewTransition
              aria-current={activo ? 'page' : undefined}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-medium no-underline',
                activo ? 'text-acento-texto' : 'text-texto-3',
              )}
            >
              <Icono className="size-5" aria-hidden />
              {item.etiqueta}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
