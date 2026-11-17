// Adaptado de amicro (https://amicro.dev/morphing), licencia MIT, (c) Syed Subhan
import { motion } from 'framer-motion';
import { ContenedorLoader } from './contenedor-loader';
import { useReducedMotion } from './use-reduced-motion';

export interface MorphingShapeProps {
  /** Lado del cuadrado en px. */
  tamano?: number;
  /** Color de relleno. Acepta currentColor o variables CSS, p. ej. var(--color-accent). */
  color?: string;
  etiqueta?: string;
  decorativo?: boolean;
  className?: string;
}

/** Cuadrado que se redondea, gira y pulsa en bucle. Con reduced motion queda estatico. */
export function MorphingShape({
  tamano = 40,
  color = 'currentColor',
  etiqueta = 'Cargando',
  decorativo = false,
  className = '',
}: MorphingShapeProps) {
  const reducir = useReducedMotion();

  return (
    <ContenedorLoader etiqueta={etiqueta} decorativo={decorativo} className={className}>
      <motion.div
        className="shadow-sm"
        style={{ width: tamano, height: tamano, backgroundColor: color }}
        animate={
          reducir
            ? { borderRadius: '10%', rotate: 0, scale: 1 }
            : { borderRadius: ['10%', '50%', '10%'], rotate: [0, 90, 180], scale: [1, 0.8, 1] }
        }
        transition={reducir ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </ContenedorLoader>
  );
}
