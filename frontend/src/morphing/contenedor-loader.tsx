// Adaptado de amicro (https://amicro.dev/morphing), licencia MIT, (c) Syed Subhan
import type { CSSProperties, ReactNode } from 'react';

export interface ContenedorLoaderProps {
  /** Texto para lectores de pantalla (solo visible para AT). */
  etiqueta?: string;
  /** Si es true, el loader es solo decorativo: aria-hidden y sin etiqueta. */
  decorativo?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * Envoltorio accesible para los loaders: role="status" + etiqueta oculta
 * visualmente, o aria-hidden cuando el loader es decorativo.
 */
export function ContenedorLoader({
  etiqueta = 'Cargando',
  decorativo = false,
  className = '',
  style,
  children,
}: ContenedorLoaderProps) {
  const base = `inline-flex items-center justify-center ${className}`;

  if (decorativo) {
    return (
      <div aria-hidden="true" className={base} style={style}>
        {children}
      </div>
    );
  }

  return (
    <div role="status" className={base} style={style}>
      <span className="sr-only">{etiqueta}</span>
      <div aria-hidden="true" className="contents">
        {children}
      </div>
    </div>
  );
}
