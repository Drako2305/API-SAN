import { Suspense } from 'react';
import { createBrowserRouter, createRoutesFromElements, Outlet, Route, RouterProvider } from 'react-router';
import { MotionConfig } from 'motion/react';
import { ToastProvider } from '@/componentes';
import { SesionProvider } from '@/lib/sesion';
import { TemaProvider } from '@/lib/tema';
import { rutas } from './rutas';

export function Proveedores({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <TemaProvider>
        <SesionProvider>
          <ToastProvider>{children}</ToastProvider>
        </SesionProvider>
      </TemaProvider>
    </MotionConfig>
  );
}

function Raiz() {
  return (
    <Proveedores>
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </Proveedores>
  );
}

/**
 * Router de datos: con `BrowserRouter` o `<Routes>` la opción `viewTransition` (Link y navigate) se ignora;
 * aquí sí llama a `document.startViewTransition`.
 */
const router = createBrowserRouter(createRoutesFromElements(<Route element={<Raiz />}>{rutas}</Route>));

export default function App() {
  return <RouterProvider router={router} />;
}
