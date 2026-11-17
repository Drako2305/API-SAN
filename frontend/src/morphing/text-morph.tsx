// Adaptado de amicro (https://amicro.dev/morphing), licencia MIT, (c) Syed Subhan
import { motion } from 'framer-motion';
import { ContenedorLoader } from './contenedor-loader';
import { useReducedMotion } from './use-reduced-motion';

export interface TextMorphProps {
  /** Palabras que se van alternando. Por defecto Cargando / Espera. */
  palabras?: string[];
  /** Segundos que dura cada palabra en pantalla. */
  duracion?: number;
  etiqueta?: string;
  decorativo?: boolean;
  className?: string;
}

/**
 * Keyframes de una palabra dentro de un ciclo de n palabras: aparece desde
 * abajo, se mantiene y sale hacia arriba en su ranura; fuera de ella queda oculta.
 */
function cuadros(i: number, n: number) {
  const ranura = 1 / n;
  const inicio = i * ranura;
  const fin = inicio + ranura;
  const fundido = ranura * 0.25;
  return {
    times: [0, inicio, inicio + fundido, fin - fundido, fin, 1],
    opacity: [0, 0, 1, 1, 0, 0],
    y: [16, 16, 0, 0, -16, -16],
  };
}

/** Texto que se reemplaza con una transicion de desplazamiento vertical. Usa currentColor. */
export function TextMorph({
  palabras = ['Cargando', 'Espera'],
  duracion = 1.5,
  etiqueta = 'Cargando',
  decorativo = false,
  className = '',
}: TextMorphProps) {
  const reducir = useReducedMotion();
  const n = palabras.length;

  if (n === 0) return null;

  // Sizer invisible con la palabra mas larga: da ancho real al contenedor (las palabras reales van absolutas).
  const masLarga = palabras.reduce((a, b) => (b.length > a.length ? b : a), '');

  const contenido =
    reducir || n === 1 ? (
      <span className="absolute whitespace-nowrap">{palabras[0]}</span>
    ) : (
      palabras.map((palabra, i) => {
        const c = cuadros(i, n);
        return (
          <motion.span
            key={`${i}-${palabra}`}
            className="absolute whitespace-nowrap"
            animate={{ opacity: c.opacity, y: c.y }}
            transition={{
              duration: duracion * n,
              repeat: Infinity,
              ease: 'easeInOut',
              times: c.times,
            }}
          >
            {palabra}
          </motion.span>
        );
      })
    );

  return (
    <ContenedorLoader
      etiqueta={etiqueta}
      decorativo={decorativo}
      className={`relative h-6 min-w-24 overflow-hidden text-sm font-medium ${className}`}
    >
      <span className="invisible whitespace-nowrap">{masLarga}</span>
      {contenido}
    </ContenedorLoader>
  );
}
