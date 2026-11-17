import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface PropsCard extends HTMLAttributes<HTMLDivElement> {
  /** `plana`: solo borde. `elevada`: con sombra suave. `hundida`: fondo secundario, sin borde. */
  variante?: 'plana' | 'elevada' | 'hundida';
  relleno?: 'ninguno' | 'sm' | 'md' | 'lg';
}

const REL = { ninguno: '', sm: 'p-3', md: 'p-5', lg: 'p-6' };
const VAR = {
  plana: 'bg-superficie border border-borde',
  elevada: 'bg-superficie border border-borde shadow-2',
  hundida: 'bg-superficie-2',
};

export function Card({ variante = 'plana', relleno = 'md', className, ...resto }: PropsCard) {
  return <div className={cn('rounded-lg', VAR[variante], REL[relleno], className)} {...resto} />;
}
