import { cn } from '@/lib/cn';
import { fotoDeUniversidad } from '@/lib/campus';
import { iniciales } from '@/lib/formato';

interface Props {
  nombre: string;
  imagenUrl?: string | null;
  /** Atributo `sizes` según el ancho que ocupa en el diseño. */
  sizes: string;
  /** Imagen principal de la pantalla (LCP): carga inmediata y prioridad alta. */
  prioridad?: boolean;
  className?: string;
  /** Texto alternativo; vacío cuando el nombre ya está al lado. */
  alt?: string;
}

/** Foto de campus 16:9 con srcset, dimensiones fijas (sin saltos de diseño) y respaldo con iniciales. */
export function FotoUniversidad({ nombre, imagenUrl, sizes, prioridad, className, alt = '' }: Props) {
  const f = fotoDeUniversidad(nombre);
  const carga = prioridad ? ({ loading: 'eager', fetchPriority: 'high' } as const) : ({ loading: 'lazy' } as const);
  return (
    <div className={cn('relative aspect-[16/9] overflow-hidden bg-superficie-2', className)}>
      {f ? (
        <img src={f.sm} srcSet={`${f.sm} 800w, ${f.src} 1920w`} sizes={sizes} alt={alt} width={800} height={450} {...carga} className="size-full object-cover" />
      ) : imagenUrl ? (
        <img src={imagenUrl} alt={alt} width={800} height={450} {...carga} className="size-full object-cover" />
      ) : (
        <div aria-hidden className="grid size-full place-items-center bg-acento-suave font-display text-3xl font-semibold text-acento-texto">
          {iniciales(nombre)}
        </div>
      )}
    </div>
  );
}
