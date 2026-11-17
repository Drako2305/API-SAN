// Adaptado de amicro (https://amicro.dev/morphing), licencia MIT, (c) Syed Subhan
import { useState } from 'react';
import { motion, type Transition } from 'framer-motion';
import { useReducedMotion } from './use-reduced-motion';

export interface PlayPauseMorphProps {
  /** Estado controlado. Si se omite, el componente maneja su propio estado. */
  reproduciendo?: boolean;
  onCambio?: (reproduciendo: boolean) => void;
  /** Lado en px del boton. */
  tamano?: number;
  /** Color del icono y del borde. Acepta currentColor o variables CSS. */
  color?: string;
  etiquetaReproducir?: string;
  etiquetaPausar?: string;
  className?: string;
}

// Mismo numero de comandos en cada par, para que framer interpole la forma.
const BARRA_IZQ_PAUSA = 'M 6 5 L 10 5 L 10 19 L 6 19 Z';
const BARRA_DER_PAUSA = 'M 14 5 L 18 5 L 18 19 L 14 19 Z';
const TRIANGULO_IZQ_PLAY = 'M 7 5 L 13 8.5 L 13 15.5 L 7 19 Z';
const TRIANGULO_DER_PLAY = 'M 13 8.5 L 19 12 L 19 12 L 13 15.5 Z';

/** Icono que interpola de pausa a reproducir (y al reves) con dos paths. */
export function PlayPauseMorph({
  reproduciendo: controlado,
  onCambio,
  tamano = 40,
  color = 'currentColor',
  etiquetaReproducir = 'Reproducir',
  etiquetaPausar = 'Pausar',
  className = '',
}: PlayPauseMorphProps) {
  const [interno, setInterno] = useState(false);
  const reducir = useReducedMotion();
  const reproduciendo = controlado ?? interno;

  const alternar = () => {
    const siguiente = !reproduciendo;
    if (controlado === undefined) setInterno(siguiente);
    onCambio?.(siguiente);
  };

  const resorte: Transition = reducir
    ? { duration: 0 }
    : { type: 'spring', stiffness: 380, damping: 32, mass: 0.7 };

  return (
    <motion.button
      type="button"
      onClick={alternar}
      aria-label={reproduciendo ? etiquetaPausar : etiquetaReproducir}
      whileHover={reducir ? undefined : { scale: 1.05 }}
      whileTap={reducir ? undefined : { scale: 0.97 }}
      className={`inline-flex cursor-pointer items-center justify-center rounded-full border border-current/20 transition-colors hover:border-current/40 ${className}`}
      style={{ width: tamano, height: tamano, color }}
    >
      <svg viewBox="0 0 24 24" width={tamano * 0.45} height={tamano * 0.45} aria-hidden="true">
        <motion.path
          initial={false}
          animate={{ d: reproduciendo ? BARRA_DER_PAUSA : TRIANGULO_DER_PLAY }}
          transition={resorte}
          fill="currentColor"
        />
        <motion.path
          initial={false}
          animate={{ d: reproduciendo ? BARRA_IZQ_PAUSA : TRIANGULO_IZQ_PLAY }}
          transition={resorte}
          fill="currentColor"
        />
      </svg>
    </motion.button>
  );
}
