import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { AvisoSinConexion, Skeleton, VolverArriba } from '@/componentes';

function CargandoPagina() {
  return (
    <div aria-busy="true" aria-label="Cargando contenido" className="flex flex-col gap-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <Skeleton className="mt-4 h-40 w-full" />
    </div>
  );
}

/** Contenido de la aplicación bajo la cabecera común (`Marco`): mismo ancho y márgenes que la portada. */
export function Shell() {
  return (
    <>
      <main id="contenido" tabIndex={-1} className="pagina-ancho pt-6 pb-16 outline-none md:pt-10">
        <Suspense fallback={<CargandoPagina />}>
          <Outlet />
        </Suspense>
      </main>
      <VolverArriba />
      <AvisoSinConexion />
    </>
  );
}
