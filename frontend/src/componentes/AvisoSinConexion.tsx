import { WifiOff } from 'lucide-react';
import { useConexion } from '@/lib/useConexion';

/** Aviso discreto en la esquina inferior mientras no hay conexión. La región existe siempre para anunciarlo. */
export function AvisoSinConexion() {
  const enLinea = useConexion();
  return (
    <div role="status" className="pointer-events-none fixed bottom-4 left-4 z-40">
      {!enLinea && (
        <p className="flex items-center gap-2 rounded-full border border-borde bg-superficie px-3 py-1.5 text-sm font-medium text-texto shadow-2">
          <WifiOff className="size-4 text-peligro" aria-hidden />
          Sin conexión
        </p>
      )}
    </div>
  );
}
