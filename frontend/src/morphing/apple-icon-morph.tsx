// Adaptado de amicro (https://amicro.dev/morphing), licencia MIT, (c) Syed Subhan
import { motion } from 'framer-motion';
import { ContenedorLoader } from './contenedor-loader';
import { useReducedMotion } from './use-reduced-motion';

export interface AppleIconMorphProps {
  /** Lado en px. */
  tamano?: number;
  /** Color de relleno. Acepta currentColor o variables CSS. */
  color?: string;
  etiqueta?: string;
  decorativo?: boolean;
  className?: string;
}

/** Forma que pasa de cuadrado a circulo girando en cuatro pasos. Con reduced motion queda estatico. */
export function AppleIconMorph({
  tamano = 32,
  color = 'currentColor',
  etiqueta = 'Cargando',
  decorativo = false,
  className = '',
}: AppleIconMorphProps) {
  const reducir = useReducedMotion();

  return (
    <ContenedorLoader etiqueta={etiqueta} decorativo={decorativo} className={className}>
      <motion.div
        style={{ width: tamano, height: tamano, backgroundColor: color }}
        animate={
          reducir
            ? { borderRadius: '20%', rotate: 0 }
            : { borderRadius: ['20%', '50%', '50%', '20%'], rotate: [0, 90, 180, 270] }
        }
        transition={reducir ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </ContenedorLoader>
  );
}
