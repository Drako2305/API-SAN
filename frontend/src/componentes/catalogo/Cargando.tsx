import { Skeleton } from '@/componentes';
import { TextMorph } from '@/morphing';

/** Estado de carga: texto animado y bloques con la forma del contenido. */
export function Cargando({ filas = 3, alto = 'h-24', className = '' }: { filas?: number; alto?: string; className?: string }) {
  return (
    <div aria-busy="true" className={className}>
      <p className="mb-3 text-sm text-texto-3">
        <TextMorph palabras={['Cargando', 'Espera']} />
      </p>
      <div className="grid gap-3">
        {Array.from({ length: filas }, (_, i) => (
          <Skeleton key={i} className={`${alto} rounded-lg`} />
        ))}
      </div>
    </div>
  );
}
