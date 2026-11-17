import { Building2 } from 'lucide-react';
import { fotoUniversidad } from '@/lib/fotos';
import { FotoConFallback } from './FotoConFallback';

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

/** Foto de campus 16:9 (ruta derivada del nombre o `imagenUrl`) con respaldo de degradado e ícono. */
export function FotoUniversidad({ nombre, imagenUrl, sizes, prioridad, className, alt = '' }: Props) {
  const f = fotoUniversidad({ nombre, imagenUrl });
  return <FotoConFallback src={f.src} sm={f.sm} anchoCompleto={1920} sizes={sizes} alt={alt} width={800} height={450} icono={Building2} prioridad={prioridad} className={className} />;
}
