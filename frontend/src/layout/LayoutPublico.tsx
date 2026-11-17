import { Suspense } from 'react';
import { Outlet } from 'react-router';

/** Contenido de la portada pública. La cabecera la pone `Marco`; el pie de marca es parte de la propia portada. */
export function LayoutPublico() {
  return (
    <main id="contenido" tabIndex={-1} className="outline-none">
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </main>
  );
}
