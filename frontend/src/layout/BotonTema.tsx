import { Moon, Sun } from 'lucide-react';
import { useTema } from '@/lib/tema';

export function BotonTema({ className }: { className?: string }) {
  const { efectivo, alternar } = useTema();
  const oscuro = efectivo === 'oscuro';
  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={oscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      className={`grid size-9 place-items-center rounded-md text-texto-2 transition-colors hover:bg-superficie-2 hover:text-texto ${className ?? ''}`}
    >
      {oscuro ? <Sun className="size-[1.15rem]" aria-hidden /> : <Moon className="size-[1.15rem]" aria-hidden />}
    </button>
  );
}
