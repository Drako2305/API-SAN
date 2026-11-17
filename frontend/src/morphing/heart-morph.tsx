// Adaptado de amicro (https://amicro.dev/morphing), licencia MIT, (c) Syed Subhan
// Corazon tomado del path de ShapesHeartMorph; el relleno se transiciona por CSS y el pulso con framer-motion.
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from './use-reduced-motion';

export interface HeartMorphProps {
  /** Estado controlado (favorito activo). Si se omite, maneja su propio estado. */
  activo?: boolean;
  onCambio?: (activo: boolean) => void;
  /** Lado en px del icono. */
  tamano?: number;
  /** Color del contorno y del relleno activo. Acepta currentColor o variables CSS. */
  color?: string;
  etiqueta?: string;
  className?: string;
}

const CORAZON =
  'M 50 84 C 20 62 8 44 8 28 A 19 19 0 0 1 48 18 L 50 22 L 52 18 A 19 19 0 0 1 92 28 C 92 44 80 62 50 84 Z';

/** Boton de favorito: el corazon pasa de contorno a relleno con un pulso. */
export function HeartMorph({
  activo: controlado,
  onCambio,
  tamano = 24,
  color = 'currentColor',
  etiqueta = 'Favorito',
  className = '',
}: HeartMorphProps) {
  const [interno, setInterno] = useState(false);
  const reducir = useReducedMotion();
  const activo = controlado ?? interno;

  const alternar = () => {
    const siguiente = !activo;
    if (controlado === undefined) setInterno(siguiente);
    onCambio?.(siguiente);
  };

  return (
    <motion.button
      type="button"
      onClick={alternar}
      aria-pressed={activo}
      aria-label={etiqueta}
      whileTap={reducir ? undefined : { scale: 0.9 }}
      className={`inline-flex cursor-pointer items-center justify-center rounded-full ${className}`}
      style={{ color }}
    >
      <motion.svg
        viewBox="0 0 100 100"
        width={tamano}
        height={tamano}
        aria-hidden="true"
        initial={false}
        animate={{ scale: reducir || !activo ? 1 : [1, 1.25, 1] }}
        transition={reducir ? { duration: 0 } : { duration: 0.45, ease: 'easeOut' }}
      >
        <path
          d={CORAZON}
          strokeWidth={8}
          strokeLinejoin="round"
          stroke="currentColor"
          style={{ fill: activo ? 'currentColor' : 'transparent' }}
          className={reducir ? '' : 'transition-[fill] duration-200'}
        />
      </motion.svg>
    </motion.button>
  );
}
