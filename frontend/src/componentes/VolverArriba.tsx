import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from './Button';

/** Píxeles recorridos a partir de los cuales aparece el botón. */
const UMBRAL = 600;

/**
 * Botón flotante que aparece tras un desplazamiento largo. Al subir, el foco pasa al contenido
 * principal (el botón desaparece al llegar arriba). Sin movimiento suave con `prefers-reduced-motion`.
 */
export function VolverArriba() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const revisar = () => setVisible(window.scrollY > UMBRAL);
    revisar();
    window.addEventListener('scroll', revisar, { passive: true });
    return () => window.removeEventListener('scroll', revisar);
  }, []);

  if (!visible) return null;

  const subir = () => {
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reducir ? 'auto' : 'smooth' });
    document.getElementById('contenido')?.focus({ preventScroll: true });
  };

  return (
    <Button
      variante="secundario"
      aria-label="Volver arriba"
      title="Volver arriba"
      onClick={subir}
      icono={<ArrowUp className="size-5" aria-hidden />}
      className="fixed right-4 bottom-4 z-40 size-11 px-0 shadow-2 md:right-6 md:bottom-6"
    />
  );
}
