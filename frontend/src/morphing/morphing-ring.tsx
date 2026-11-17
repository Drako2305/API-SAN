// Adaptado de amicro (https://amicro.dev/morphing), licencia MIT, (c) Syed Subhan
import { motion } from 'framer-motion';
import { useReducedMotion } from './use-reduced-motion';

export interface MorphingRingProps {
  /** Puntaje 0-100 que se muestra en el centro del anillo. Se limita al rango. */
  valor?: number;
  /** Mientras es true el anillo se deforma y gira; al pasar a false se asienta en circulo. */
  cargando?: boolean;
  /** Lado en px. */
  tamano?: number;
  /** Color del borde y del texto. Acepta currentColor o variables CSS. */
  color?: string;
  /** Etiqueta para lectores de pantalla mientras cargando. */
  etiqueta?: string;
  /** Texto accesible del puntaje ya asentado. Por defecto "Puntaje N de 100". */
  etiquetaValor?: string;
  decorativo?: boolean;
  className?: string;
}

/**
 * Anillo de puntaje (p. ej. afinidad). Se deforma mientras carga y luego se
 * asienta en un circulo mostrando el valor. Con reduced motion no se anima.
 */
export function MorphingRing({
  valor,
  cargando = true,
  tamano = 40,
  color = 'currentColor',
  etiqueta = 'Cargando',
  etiquetaValor,
  decorativo = false,
  className = '',
}: MorphingRingProps) {
  const reducir = useReducedMotion();
  const v =
    valor === undefined || !Number.isFinite(valor)
      ? undefined
      : Math.round(Math.min(100, Math.max(0, valor)));
  const morfeando = cargando && !reducir;

  // Un unico elemento raiz en todos los estados: asi el anillo conserva su forma al asentarse.
  const esStatus = cargando && !decorativo;
  const esImagen = !cargando && v !== undefined && !decorativo;
  const ocultar = decorativo || (!cargando && v === undefined);

  return (
    <div
      role={esStatus ? 'status' : esImagen ? 'img' : undefined}
      aria-label={esImagen ? (etiquetaValor ?? `Puntaje ${v} de 100`) : undefined}
      aria-hidden={ocultar ? true : undefined}
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: tamano, height: tamano }}
    >
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 border-[3px]"
        style={{ borderColor: color }}
        initial={cargando ? undefined : false}
        animate={
          morfeando
            ? { rotate: 180, borderRadius: ['10%', '50%', '10%'] }
            : { rotate: 0, borderRadius: '50%' }
        }
        transition={
          morfeando
            ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
            : reducir
              ? { duration: 0 }
              : { type: 'spring', stiffness: 160, damping: 20 }
        }
      />
      {v !== undefined && (
        <span aria-hidden="true" className="relative font-semibold tabular-nums" style={{ fontSize: tamano * 0.32 }}>
          {v}
        </span>
      )}
      {esStatus && <span className="sr-only">{etiqueta}</span>}
    </div>
  );
}
