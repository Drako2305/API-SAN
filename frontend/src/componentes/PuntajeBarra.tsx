import { motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { CRITERIO_ETIQUETA, formatoPuntaje } from '@/lib/formato';
import { CRITERIOS, type Pesos } from '@/lib/modelos';

interface PropsPuntaje {
  /** Puntaje 0-100. */
  puntaje: number;
  /** Desglose 0-1 por criterio. Si falta, solo se muestra el puntaje. */
  desglose?: Pesos;
  /** Pesos 0-5 elegidos por la persona; los criterios con peso 0 se atenúan. */
  pesos?: Pesos;
  /** Una sola fila con el número y una barra (listas densas). */
  compacto?: boolean;
  className?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

function Barra({ valor, atenuada }: { valor: number; atenuada?: boolean }) {
  const v = Math.max(0, Math.min(1, valor));
  return (
    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-superficie-3" aria-hidden>
      <motion.div
        className={cn('h-full origin-left rounded-full', atenuada ? 'bg-borde-fuerte' : 'bg-acento')}
        style={{ width: `${v * 100}%` }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
      />
    </div>
  );
}

/** Puntaje de una oferta con el desglose por criterio: nunca un número sin su porqué. */
export function PuntajeBarra({ puntaje, desglose, pesos, compacto, className }: PropsPuntaje) {
  if (compacto || !desglose) {
    return (
      <div className={cn('flex items-center gap-3', className)} role="img" aria-label={`Puntaje ${formatoPuntaje(puntaje)} de 100`}>
        <span className="numeros font-display text-2xl leading-none font-semibold">{formatoPuntaje(puntaje)}</span>
        <Barra valor={puntaje / 100} />
      </div>
    );
  }
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-baseline gap-1.5">
        <span className="numeros font-display text-4xl leading-none font-semibold">{formatoPuntaje(puntaje)}</span>
        <span className="text-sm text-texto-3">de 100</span>
      </div>
      <ul className="flex flex-col gap-2" aria-label="Desglose del puntaje por criterio">
        {CRITERIOS.map((c) => {
          const sinPeso = pesos ? pesos[c] === 0 : false;
          return (
            <li key={c} className={cn('flex items-center gap-3 text-[0.8125rem]', sinPeso && 'opacity-60')}>
              <span className="w-24 shrink-0 text-texto-2">{CRITERIO_ETIQUETA[c]}</span>
              <Barra valor={desglose[c]} atenuada={sinPeso} />
              <span className="numeros w-10 shrink-0 text-right font-medium">{Math.round(desglose[c] * 100)}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
