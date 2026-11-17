import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useSesion } from '@/lib/sesion';

/**
 * Exige sesión (y rol admin con `soloAdmin`). Sin sesión lleva a /ingresar conservando la ruta pedida;
 * con sesión de estudiante en una ruta de admin, vuelve a /inicio.
 */
export function RutaPrivada({ children, soloAdmin = false }: { children: ReactNode; soloAdmin?: boolean }) {
  const { autenticado, esAdmin } = useSesion();
  const ubicacion = useLocation();

  if (!autenticado) {
    const returnUrl = ubicacion.pathname + ubicacion.search;
    return <Navigate to={`/ingresar?returnUrl=${encodeURIComponent(returnUrl)}`} replace />;
  }
  if (soloAdmin && !esAdmin) return <Navigate to="/inicio" replace />;
  return <>{children}</>;
}
