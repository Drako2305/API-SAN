import { Moon, Sun } from 'lucide-react';
import { useTema } from '@/lib/tema';

/** Alterna claro/oscuro: ícono siempre y, desde 1280 px, también el texto de la acción. */
export function BotonTema({ className }: { className?: string }) {
  const { efectivo, alternar } = useTema();
  const oscuro = efectivo === 'oscuro';
  const Icono = oscuro ? Sun : Moon;
  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={oscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-md px-2.5 text-sm font-medium text-texto-2 transition-colors hover:bg-superficie-2 hover:text-texto ${className ?? ''}`}
    >
      <Icono className="size-[1.15rem]" aria-hidden />
      <span aria-hidden className="hidden xl:inline">
        {oscuro ? 'Claro' : 'Oscuro'}
      </span>
    </button>
  );
}
