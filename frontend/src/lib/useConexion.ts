import { useSyncExternalStore } from 'react';

function suscribir(avisar: () => void): () => void {
  window.addEventListener('online', avisar);
  window.addEventListener('offline', avisar);
  return () => {
    window.removeEventListener('online', avisar);
    window.removeEventListener('offline', avisar);
  };
}

/** `true` mientras el navegador tiene conexión (según `navigator.onLine` y los eventos online/offline). */
export function useConexion(): boolean {
  return useSyncExternalStore(suscribir, () => navigator.onLine, () => true);
}
