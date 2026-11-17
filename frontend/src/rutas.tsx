import { lazy } from 'react';
import { Route } from 'react-router';
import { LayoutPublico } from '@/layout/LayoutPublico';
import { Marco } from '@/layout/Marco';
import { RutaPrivada } from '@/layout/RutaPrivada';
import { Shell } from '@/layout/Shell';

const Landing = lazy(() => import('@/paginas/Landing'));
const Ingresar = lazy(() => import('@/paginas/auth/Ingresar'));
const Registro = lazy(() => import('@/paginas/auth/Registro'));
const Inicio = lazy(() => import('@/paginas/Inicio'));
const Buscar = lazy(() => import('@/paginas/Buscar'));
const Busqueda = lazy(() => import('@/paginas/Busqueda'));
const Carreras = lazy(() => import('@/paginas/Carreras'));
const Universidades = lazy(() => import('@/paginas/Universidades'));
const UniversidadDetalle = lazy(() => import('@/paginas/UniversidadDetalle'));
const Oferta = lazy(() => import('@/paginas/Oferta'));
const Comparar = lazy(() => import('@/paginas/Comparar'));
const Perfil = lazy(() => import('@/paginas/Perfil'));
const Admin = lazy(() => import('@/paginas/Admin'));
const NoEncontrado = lazy(() => import('@/paginas/NoEncontrado'));

/**
 * Árbol de rutas (fragmento de `<Route>`; `App.tsx` lo monta en un router de datos para que `viewTransition` funcione).
 * Para agregar una página: crea `paginas/X.tsx` (export default) y regístrala aquí.
 */
export const rutas = (
  <>
      <Route path="ingresar" element={<Ingresar />} />
      <Route path="registro" element={<Registro />} />

      <Route element={<Marco />}>
        <Route element={<LayoutPublico />}>
          <Route index element={<Landing />} />
        </Route>
        <Route element={<Shell />}>
          <Route path="inicio" element={<RutaPrivada><Inicio /></RutaPrivada>} />
          <Route path="buscar" element={<Buscar />} />
          <Route path="busquedas/:id" element={<Busqueda />} />
          <Route path="carreras" element={<Carreras />} />
          <Route path="universidades" element={<Universidades />} />
          <Route path="universidades/:id" element={<UniversidadDetalle />} />
          <Route path="ofertas/:id" element={<Oferta />} />
          <Route path="comparar" element={<Comparar />} />
          <Route path="perfil" element={<RutaPrivada><Perfil /></RutaPrivada>} />
          <Route path="admin" element={<RutaPrivada soloAdmin><Admin /></RutaPrivada>} />
          <Route path="*" element={<NoEncontrado />} />
        </Route>
      </Route>
  </>
);
