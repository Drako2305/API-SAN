import type { ReactNode } from 'react';

/** Título de pantalla con descripción opcional y acciones a la derecha. Un solo <h1> por página. */
export function EncabezadoPagina({ titulo, descripcion, acciones }: { titulo: string; descripcion?: string; acciones?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        <h1 className="text-[1.75rem] md:text-3xl">{titulo}</h1>
        {descripcion && <p className="mt-1.5 max-w-[65ch] text-texto-2">{descripcion}</p>}
      </div>
      {acciones && <div className="flex items-center gap-2">{acciones}</div>}
    </header>
  );
}
