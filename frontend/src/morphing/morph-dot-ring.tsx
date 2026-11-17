// Adaptado de amicro (https://amicro.dev/morphing), licencia MIT, (c) Syed Subhan
import { motion } from 'framer-motion';
import { ContenedorLoader } from './contenedor-loader';
import { useReducedMotion } from './use-reduced-motion';

export interface MorphDotRingProps {
  /** Lado en px del conjunto de 4 puntos. */
  tamano?: number;
  /** Color de los puntos. Acepta currentColor o variables CSS. */
  color?: string;
  etiqueta?: string;
  decorativo?: boolean;
  className?: string;
}

/** Cuatro puntos que se juntan y se separan mientras giran. Con reduced motion queda estatico. */
export function MorphDotRing({
  tamano = 24,
  color = 'currentColor',
  etiqueta = 'Cargando',
  decorativo = false,
  className = '',
}: MorphDotRingProps) {
  const reducir = useReducedMotion();

  return (
    <ContenedorLoader etiqueta={etiqueta} decorativo={decorativo} className={className}>
      <motion.div
        className="grid grid-cols-2"
        style={{ width: tamano, height: tamano }}
        animate={reducir ? { rotate: 0, gap: '4px' } : { rotate: 180, gap: ['4px', '0px', '4px'] }}
        transition={reducir ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-full w-full rounded-full" style={{ backgroundColor: color }} />
        ))}
      </motion.div>
    </ContenedorLoader>
  );
}
