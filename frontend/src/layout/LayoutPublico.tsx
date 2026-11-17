import { Suspense } from 'react';
import { Link, Outlet } from 'react-router';
import { LinkButton, Logo } from '@/componentes';
import { useSesion } from '@/lib/sesion';
import { BotonTema } from './BotonTema';

/** Layout de la portada pública: cabecera sobre la página, pie con créditos de fotos. */
export function LayoutPublico() {
  const { autenticado } = useSesion();
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex h-16 max-w-[80rem] items-center gap-3 px-4 md:px-8">
          <Link to="/" aria-label="SAN, inicio">
            <Logo />
          </Link>
          <nav aria-label="Principal" className="ml-6 hidden items-center gap-1 md:flex">
            <Link to="/buscar" className="rounded-md px-3 py-2 text-sm font-medium text-texto-2 no-underline hover:text-texto">
              Buscar
            </Link>
            <Link to="/carreras" className="rounded-md px-3 py-2 text-sm font-medium text-texto-2 no-underline hover:text-texto">
              Catálogo
            </Link>
            <Link to="/comparar" className="rounded-md px-3 py-2 text-sm font-medium text-texto-2 no-underline hover:text-texto">
              Comparar
            </Link>
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
          </div>
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
