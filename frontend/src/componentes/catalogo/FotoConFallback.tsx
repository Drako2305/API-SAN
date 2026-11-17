import { useState, type ComponentType } from 'react';
import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/cn';
import { iconoArea } from '@/lib/areas';

interface Props {
  src: string;
  /** Versión de ~800 px; con ella se arma el `srcset`. */
  sm?: string;
  /** Ancho real de `src` para el descriptor `w` del srcset. */
  anchoCompleto?: number;
  alt?: string;
  sizes?: string;
  width: number;
  height: number;
  /** Área de la carrera: define el ícono del respaldo. */
  area?: string | null;
  /** Ícono propio para el respaldo (por ejemplo, una universidad). */
  icono?: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  /** El tamaño lo da el contenedor (clases), sin `aspect-ratio` propio. */
  relleno?: boolean;
  /** Si falla la imagen no dibuja nada (para fondos decorativos que ya tienen su propio color). */
  ocultarSiFalla?: boolean;
  prioridad?: boolean;
  className?: string;
  imgClassName?: string;
}

/**
 * Imagen con `srcset`, dimensiones fijas (sin saltos de diseño) y carga diferida. Si la foto falta o falla,
 * muestra el patrón de esquirlas de marca (tinte suave) con el ícono del área en lugar de una imagen rota.
 */
export function FotoConFallback({
  src,
  sm,
  anchoCompleto = 1600,
  alt = '',
  sizes,
  width,
  height,
  area,
  icono,
  prioridad,
  ocultarSiFalla,
  relleno,
  className,
  imgClassName,
}: Props) {
  // El fallo se asocia a la ruta: si cambia `src`, se vuelve a intentar sin efectos.
  const [fallida, setFallida] = useState<string | null>(null);
  const Icono = icono ?? (area ? iconoArea(area) : GraduationCap);
  const carga = prioridad ? ({ loading: 'eager', fetchPriority: 'high' } as const) : ({ loading: 'lazy' } as const);

  return (
    <div className={cn('relative overflow-hidden bg-superficie-2', className)} style={relleno ? undefined : { aspectRatio: `${width} / ${height}` }}>
      {fallida === src && ocultarSiFalla ? null : fallida === src ? (
        <div
          data-fallback
          role={alt ? 'img' : undefined}
          aria-label={alt || undefined}
          aria-hidden={alt ? undefined : true}
          className="fondo-esquirlas-suave esquirlas grid size-full place-items-center text-acento-texto"
        >
          <Icono className="size-[28%] max-h-12 min-h-5" aria-hidden />
        </div>
      ) : (
        <img
          src={sm ?? src}
          srcSet={sm && sm !== src ? `${sm} 800w, ${src} ${anchoCompleto}w` : undefined}
          sizes={sm && sm !== src ? sizes : undefined}
          alt={alt}
          width={width}
          height={height}
          {...carga}
          decoding="async"
          onError={() => setFallida(src)}
          className={cn('size-full object-cover', imgClassName)}
        />
      )}
    </div>
  );
}
