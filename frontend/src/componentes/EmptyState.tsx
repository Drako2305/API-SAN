import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface PropsEstado {
  icono?: ReactNode;
  titulo: string;
  texto?: string;
  accion?: ReactNode;
  className?: string;
}

/** Estado vacío o de error: dice qué pasó y qué hacer a continuación. */
export function EmptyState({ icono, titulo, texto, accion, className }: PropsEstado) {
  return (
    <div className={cn('flex flex-col items-center gap-3 rounded-lg border border-dashed border-borde-fuerte px-6 py-12 text-center', className)}>
      {icono && <div className="grid size-12 place-items-center rounded-full bg-acento-suave text-acento-texto [&>svg]:size-6">{icono}</div>}
      <h3 className="text-lg">{titulo}</h3>
      {texto && <p className="max-w-[44ch] text-sm text-texto-2">{texto}</p>}
      {accion && <div className="mt-1">{accion}</div>}
    </div>
  );
}
