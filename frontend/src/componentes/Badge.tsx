import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type TonoBadge = 'neutro' | 'acento' | 'ok' | 'aviso' | 'peligro';

const TONOS: Record<TonoBadge, string> = {
  neutro: 'bg-superficie-2 text-texto-2',
  acento: 'bg-acento-suave text-acento-texto',
  ok: 'bg-ok-suave text-ok',
  aviso: 'bg-aviso-suave text-aviso',
  peligro: 'bg-peligro-suave text-peligro',
};

export function Badge({ tono = 'neutro', className, ...resto }: HTMLAttributes<HTMLSpanElement> & { tono?: TonoBadge }) {
  return (
    <span
      className={cn('inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-xs font-medium whitespace-nowrap', TONOS[tono], className)}
      {...resto}
    />
  );
}
