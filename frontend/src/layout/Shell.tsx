import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { Skeleton } from '@/componentes';
import { NavSuperior } from './NavSuperior';

function CargandoPagina() {
  return (
    <div aria-busy="true" aria-label="Cargando" className="flex flex-col gap-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <Skeleton className="mt-4 h-40 w-full" />
    </div>
  );
}

/** Armazón de la aplicación: barra de navegación superior fija y el contenido de cada página en <Outlet />. */
export function Shell() {
  return (
    <div className="min-h-dvh">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-md focus:bg-acento focus:px-3 focus:py-2 focus:text-sobre-acento"
      >
        Saltar al contenido
      </a>
      <NavSuperior />
      <main id="contenido" tabIndex={-1} className="mx-auto w-full max-w-[var(--ancho-pagina)] px-[var(--gutter)] pt-6 pb-16 outline-none md:pt-8">
        <Suspense fallback={<CargandoPagina />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
