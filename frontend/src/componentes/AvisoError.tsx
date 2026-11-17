import type { ReactNode } from 'react';
import { TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Error de formulario o de carga: frambuesa (no el rojo de marca) y siempre con ícono y texto, nunca solo color. */
export function AvisoError({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p role="alert" className={cn('flex items-start gap-2 rounded-md bg-peligro-suave px-3 py-2 text-sm font-medium text-peligro', className)}>
      <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}
