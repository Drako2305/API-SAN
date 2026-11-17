// Adaptado de amicro (https://amicro.dev/morphing), licencia MIT, (c) Syed Subhan
import { useEffect, useState } from 'react';

const CONSULTA = '(prefers-reduced-motion: reduce)';

function hayMatchMedia(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

/**
 * Devuelve true si el usuario pidio reducir el movimiento
 * (prefers-reduced-motion: reduce). Se actualiza si la preferencia cambia.
 */
export function useReducedMotion(): boolean {
  const [reducir, setReducir] = useState<boolean>(() =>
    hayMatchMedia() ? window.matchMedia(CONSULTA).matches : false,
  );

  useEffect(() => {
    if (!hayMatchMedia()) return;
    const mq = window.matchMedia(CONSULTA);
    setReducir(mq.matches);
    const alCambiar = (evento: MediaQueryListEvent) => setReducir(evento.matches);
    mq.addEventListener('change', alCambiar);
    return () => mq.removeEventListener('change', alCambiar);
  }, []);

  return reducir;
}
