import { useEffect } from 'react';

/** Fija el título de la pestaña como "<titulo> · SAN" mientras la página está montada. */
export function useTituloPagina(titulo: string): void {
  useEffect(() => {
    document.title = `${titulo} · SAN`;
  }, [titulo]);
}
