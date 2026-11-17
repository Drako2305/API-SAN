// Adaptado de amicro (https://amicro.dev/morphing), licencia MIT, (c) Syed Subhan
import { motion } from 'framer-motion';
import { ContenedorLoader } from './contenedor-loader';
import { useReducedMotion } from './use-reduced-motion';

export interface MorphLoaderProps {
  /** Lado en px del contenedor del loader. */
  size?: number;
  /** Color de relleno. Acepta currentColor o variables CSS. */
  color?: string;
  className?: string;
  etiqueta?: string;
  decorativo?: boolean;
}

/** Cuadrado redondeado que cambia de forma y gira. Con reduced motion queda estatico. */
export function MorphLoader({
  size = 40,
  color = 'currentColor',
  className = '',
  etiqueta = 'Cargando',
  decorativo = false,
}: MorphLoaderProps) {
  const reducir = useReducedMotion();

  return (
    <ContenedorLoader
      etiqueta={etiqueta}
      decorativo={decorativo}
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <motion.div
        className="rounded-2xl shadow-lg"
        style={{ width: size, height: size, backgroundColor: color }}
        animate={
          reducir
            ? { borderRadius: '25%', rotate: 0, scale: 1 }
            : {
                borderRadius: ['25%', '50%', '50%', '25%', '25%'],
                rotate: [0, 90, 180, 270, 360],
                scale: [1, 0.8, 1.1, 0.8, 1],
              }
        }
        transition={reducir ? { duration: 0 } : { duration: 2.2, ease: 'easeInOut', repeat: Infinity }}
      />
    </ContenedorLoader>
  );
}
