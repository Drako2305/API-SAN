import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface PropsDialog {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  descripcion?: string;
  children: ReactNode;
  /** Clic fuera cierra (closedby="any"); desactívalo en formularios con datos sin guardar. */
  cerrarAlClicFuera?: boolean;
  className?: string;
  /** Oculta el botón de cerrar (úsalo solo si el contenido ofrece su propia salida). */
  sinCerrar?: boolean;
}

const fuera = (e: PointerEvent, d: HTMLDialogElement) => {
  const r = d.getBoundingClientRect();
  return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
};

/**
 * Diálogo modal sobre el elemento nativo <dialog>: showModal() da foco contenido, capa superior,
 * Esc y gesto atrás; el navegador devuelve el foco al disparador. `closedby="any"` activa el cierre
 * por clic fuera, con respaldo por puntero donde no existe.
 */
export function Dialog({ abierto, onCerrar, titulo, descripcion, children, cerrarAlClicFuera = true, className, sinCerrar }: PropsDialog) {
  const ref = useRef<HTMLDialogElement>(null);
  const idTitulo = useRef(`dlg-${Math.random().toString(36).slice(2, 8)}`).current;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierto && !d.open) {
      if (typeof d.showModal === 'function') d.showModal();
      else d.setAttribute('open', ''); // entornos sin <dialog> completo (jsdom)
    } else if (!abierto && d.open) {
      if (typeof d.close === 'function') d.close();
      else d.removeAttribute('open');
    }
  }, [abierto]);

  // Respaldo de light dismiss donde falta `closedby` (Safari).
  useEffect(() => {
    const d = ref.current;
    if (!d || !cerrarAlClicFuera || 'closedBy' in HTMLDialogElement.prototype) return;
    let presionadoFuera = false;
    const abajo = (e: PointerEvent) => (presionadoFuera = fuera(e, d));
    const arriba = (e: PointerEvent) => {
      if (presionadoFuera && fuera(e, d)) d.close();
    };
    d.addEventListener('pointerdown', abajo);
    d.addEventListener('pointerup', arriba);
    return () => {
      d.removeEventListener('pointerdown', abajo);
      d.removeEventListener('pointerup', arriba);
    };
  }, [cerrarAlClicFuera]);

  const atributosCierre = { closedby: cerrarAlClicFuera ? 'any' : 'closerequest' } as Record<string, string>;

  return (
    <dialog
      ref={ref}
      className={cn('san-dialog', className)}
      aria-labelledby={idTitulo}
      aria-describedby={descripcion ? `${idTitulo}-d` : undefined}
      onClose={onCerrar}
      {...atributosCierre}
    >
      <div className="flex items-start justify-between gap-4 px-6 pt-5">
        <div className="min-w-0">
          <h2 id={idTitulo} className="text-xl">
            {titulo}
          </h2>
          {descripcion && (
            <p id={`${idTitulo}-d`} className="mt-1 text-sm text-texto-2">
              {descripcion}
            </p>
          )}
        </div>
        {!sinCerrar && (
          <form method="dialog">
            <button
              type="submit"
              aria-label="Cerrar"
              className="-mt-1 -mr-2 grid size-9 place-items-center rounded-md text-texto-3 transition-colors hover:bg-superficie-2 hover:text-texto"
            >
              <X className="size-5" aria-hidden />
            </button>
          </form>
        )}
      </div>
      <div className="px-6 pt-4 pb-6">{children}</div>
    </dialog>
  );
}
