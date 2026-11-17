// Adaptado de amicro (https://amicro.dev/morphing), licencia MIT, (c) Syed Subhan
import { motion, type HTMLMotionProps } from 'framer-motion';
import { useReducedMotion } from './use-reduced-motion';

export interface LoaderMorphingProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  /** Lado en px. */
  size?: number;
  /** Color de relleno. Acepta currentColor o variables CSS. */
  color?: string;
  /** Duracion de un ciclo completo en segundos. */
  duration?: number;
  etiqueta?: string;
  decorativo?: boolean;
}

/** Squircle que se transforma en circulo mientras gira. Con reduced motion queda estatico. */
export function LoaderMorphing({
  className = '',
  size = 40,
  color = 'currentColor',
  duration = 2,
  etiqueta = 'Cargando',
  decorativo = false,
  ...props
}: LoaderMorphingProps) {
  const reducir = useReducedMotion();

  return (
    <motion.div
      role={decorativo ? undefined : 'status'}
      aria-hidden={decorativo ? true : undefined}
      className={className}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        display: 'inline-block',
      }}
      animate={
        reducir
          ? { borderRadius: '20%', rotate: 0, scale: 1 }
          : {
              borderRadius: ['20%', '50%', '20%', '50%', '20%'],
              rotate: [0, 90, 180, 270, 360],
              scale: [1, 1.2, 1, 1.2, 1],
            }
      }
      transition={reducir ? { duration: 0 } : { duration, ease: 'easeInOut', repeat: Infinity }}
      {...props}
    >
      {decorativo ? null : <span className="sr-only">{etiqueta}</span>}
    </motion.div>
  );
}
