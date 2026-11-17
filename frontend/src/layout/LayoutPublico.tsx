import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, Outlet } from 'react-router';
import { Menu } from 'lucide-react';
import { LinkButton, Logo } from '@/componentes';
import { cn } from '@/lib/cn';
import { useSesion } from '@/lib/sesion';
import { BotonTema } from './BotonTema';

const ENLACES = [
  { a: '/buscar', t: 'Buscar' },
  { a: '/carreras', t: 'Catálogo' },
  { a: '/comparar', t: 'Comparar' },
];

/** Layout de la portada pública: cabecera transparente sobre el hero que se vuelve sólida al desplazarse; pie con créditos de fotos. */
export function LayoutPublico() {
  const { autenticado } = useSesion();
  const [solida, setSolida] = useState(false);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const revisar = () => setSolida(window.scrollY > 24);
    revisar();
    window.addEventListener('scroll', revisar, { passive: true });
    return () => window.removeEventListener('scroll', revisar);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-superficie focus:px-3 focus:py-2 focus:shadow-2"
      >
        Saltar al contenido
      </a>
      <header
        data-solida={solida}
        className={cn(
          'fixed inset-x-0 top-0 z-30 border-b border-transparent transition-[background-color,border-color,box-shadow] duration-[var(--dur-media)] ease-[var(--ease-salida)]',
          solida && 'border-borde bg-fondo/90 shadow-1 backdrop-blur-md',
        )}
      >
        <div className="mx-auto flex h-16 max-w-[80rem] items-center gap-3 px-4 md:px-8">
          <Link to="/" aria-label="SAN, inicio">
            <Logo />
          </Link>
          <nav aria-label="Principal" className="ml-6 hidden items-center gap-1 md:flex">
            {ENLACES.map((e) => (
              <Link key={e.a} to={e.a} className="rounded-md px-3 py-2 text-sm font-medium text-texto-2 no-underline hover:text-texto">
                {e.t}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <BotonTema />
            {autenticado ? (
              <LinkButton to="/inicio" tamano="sm">
                Ir a mi inicio
              </LinkButton>
            ) : (
              <>
                <LinkButton to="/ingresar" variante="fantasma" tamano="sm">
                  Ingresar
                </LinkButton>
                <LinkButton to="/registro" variante="secundario" tamano="sm" className="hidden sm:inline-flex">
                  Crear cuenta
                </LinkButton>
              </>
            )}
            <button
              type="button"
              popoverTarget="menu-publico"
              aria-label="Abrir menú de navegación"
              className="grid size-9 place-items-center rounded-md text-texto-2 hover:bg-superficie-2 hover:text-texto md:hidden"
            >
              <Menu className="size-[1.15rem]" aria-hidden />
            </button>
          </div>
        </div>
        <div
          ref={menu}
          id="menu-publico"
          popover="auto"
          className="m-0 mt-16 ml-auto mr-2 w-56 rounded-lg border border-borde bg-superficie p-2 text-texto shadow-3 [inset:auto]"
          style={{ position: 'fixed', top: 0, right: 0 }}
        >
          <nav aria-label="Principal (móvil)" className="flex flex-col">
            {ENLACES.map((e) => (
              <Link
                key={e.a}
                to={e.a}
                onClick={() => menu.current?.hidePopover()}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-texto no-underline hover:bg-superficie-2"
              >
                {e.t}
              </Link>
            ))}
            {!autenticado && (
              <Link
                to="/registro"
                onClick={() => menu.current?.hidePopover()}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-texto no-underline hover:bg-superficie-2 sm:hidden"
              >
                Crear cuenta
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main id="contenido" className="flex-1">
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="border-t border-borde px-4 py-8 text-sm text-texto-3 md:px-8">
        <div className="mx-auto flex max-w-[80rem] flex-wrap items-center justify-between gap-3">
          <p>SAN, Sistema Académico de Navegación. Los datos del catálogo son demostrativos.</p>
          <a href="/campus/CREDITOS.md" className="text-texto-2">
            Créditos de las fotos
          </a>
        </div>
      </footer>
    </div>
  );
}
