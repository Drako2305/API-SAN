import { useCallback, useEffect, useRef, useState } from 'react';
import { mensajeError } from './api';

export interface EstadoCarga<T> {
  datos: T | null;
  cargando: boolean;
  error: string | null;
  recargar(): void;
}

/**
 * Carga asíncrona con estados `cargando`/`error`. `fn` recibe un AbortSignal;
 * se vuelve a ejecutar cuando cambia `deps`.
 */
export function useCarga<T>(fn: (signal: AbortSignal) => Promise<T>, deps: unknown[] = []): EstadoCarga<T> {
  const [estado, setEstado] = useState<{ datos: T | null; cargando: boolean; error: string | null }>({
    datos: null,
    cargando: true,
    error: null,
  });
  const [version, setVersion] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    const ac = new AbortController();
    setEstado((e) => ({ ...e, cargando: true, error: null }));
    fnRef.current(ac.signal).then(
      (datos) => !ac.signal.aborted && setEstado({ datos, cargando: false, error: null }),
      (err) => !ac.signal.aborted && setEstado({ datos: null, cargando: false, error: mensajeError(err) }),
    );
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);
  return { ...estado, recargar };
}
