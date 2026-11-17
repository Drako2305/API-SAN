import { GitCompareArrows, X } from 'lucide-react';
import { Button, LinkButton } from '@/componentes';
import { MAX_COMPARAR, MIN_COMPARAR, type OfertaSeleccionada } from '@/lib/seleccionComparar';

/** Barra fija inferior con la selección para comparar. Se oculta si no hay nada elegido. */
export function BarraComparar({ ofertas, onVaciar }: { ofertas: OfertaSeleccionada[]; onVaciar: () => void }) {
  if (ofertas.length === 0) return null;
  const lista = ofertas.length >= MIN_COMPARAR;
  return (
    <div
      role="region"
      aria-label="Ofertas elegidas para comparar"
      className="fixed inset-x-0 bottom-[var(--nav-movil)] z-20 border-t border-borde-fuerte bg-superficie shadow-2 md:bottom-0 md:left-[var(--riel)]"
    >
      <div className="mx-auto flex max-w-[72rem] items-center gap-3 px-4 py-3 md:px-8">
        <p className="min-w-0 flex-1 text-sm">
          <span className="block truncate font-medium">{ofertas.map((o) => o.universidad).join(' · ')}</span>
          <span className="block text-texto-3">
            {lista ? `Máximo ${MAX_COMPARAR} ofertas` : `Elige al menos ${MIN_COMPARAR} ofertas`}
          </span>
        </p>
        <Button variante="fantasma" tamano="sm" onClick={onVaciar} icono={<X className="size-4" aria-hidden />}>
          Vaciar
        </Button>
        <LinkButton
          to="/comparar"
          viewTransition
          icono={<GitCompareArrows className="size-4" aria-hidden />}
          aria-disabled={!lista || undefined}
          tabIndex={lista ? undefined : -1}
          onClick={(e) => !lista && e.preventDefault()}
        >
          Comparar ({ofertas.length})
        </LinkButton>
      </div>
    </div>
  );
}
