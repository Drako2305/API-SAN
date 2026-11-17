import { Suspense } from 'react';
import { BrowserRouter } from 'react-router';
import { MotionConfig } from 'motion/react';
import { ToastProvider } from '@/componentes';
import { SesionProvider } from '@/lib/sesion';
import { TemaProvider } from '@/lib/tema';
import { Rutas } from './rutas';

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

export default function App() {
  return (
    <BrowserRouter>
      <Proveedores>
        <Suspense fallback={null}>
          <Rutas />
        </Suspense>
      </Proveedores>
    </BrowserRouter>
  );
}
