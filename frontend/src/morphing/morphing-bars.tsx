// Adaptado de amicro (https://amicro.dev/morphing), licencia MIT, (c) Syed Subhan
import { motion } from 'framer-motion';
import { ContenedorLoader } from './contenedor-loader';
import { useReducedMotion } from './use-reduced-motion';

export interface MorphingBarsProps {
  /** Altura en px de las barras. */
  altura?: number;
  /** Color de las barras. Acepta currentColor o variables CSS. */
  color?: string;
  etiqueta?: string;
  decorativo?: boolean;
  className?: string;
}

/**
 * Tres barras que cambian de altura y de separacion (gap animado, sin space-x
 * para que el espacio se mueva con la animacion). Con reduced motion queda estatico.
 */
export function MorphingBars({
  altura = 32,
  color = 'currentColor',
  etiqueta = 'Cargando',
  decorativo = false,
  className = '',
}: MorphingBarsProps) {
  const reducir = useReducedMotion();

  return (
    <ContenedorLoader etiqueta={etiqueta} decorativo={decorativo} className={className}>
      <motion.div
        className="flex items-center"
        style={{ height: altura }}
        animate={reducir ? { gap: '4px' } : { gap: ['4px', '0px', '4px'] }}
        transition={reducir ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 rounded-sm"
            style={{ backgroundColor: color, height: altura }}
            animate={reducir ? { height: altura } : { height: [altura, altura / 2, altura] }}
            transition={reducir ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </motion.div>
    </ContenedorLoader>
  );
}
