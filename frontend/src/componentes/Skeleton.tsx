import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

/** Bloque de carga. Decorativo: quien lo usa anuncia el estado con aria-busy en el contenedor. */
export function Skeleton({ className, ...resto }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden className={cn('san-skeleton h-4 rounded-md', className)} {...resto} />;
}
