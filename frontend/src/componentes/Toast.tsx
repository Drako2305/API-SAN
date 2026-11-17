import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

type TipoToast = 'info' | 'ok' | 'error';
interface ItemToast {
  id: number;
  tipo: TipoToast;
  texto: string;
}

interface ValorToast {
  mostrar(texto: string, tipo?: TipoToast): void;
  ok(texto: string): void;
  error(texto: string): void;
}
const Contexto = createContext<ValorToast | null>(null);

const ICONO = { info: Info, ok: CheckCircle2, error: AlertCircle };
const COLOR = { info: 'text-acento-texto', ok: 'text-ok', error: 'text-peligro' };

/** Avisos efímeros anunciados con una región `role="status"` (los errores usan `alert`). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemToast[]>([]);
  const n = useRef(0);

  const quitar = useCallback((id: number) => setItems((l) => l.filter((i) => i.id !== id)), []);
  const mostrar = useCallback(
    (texto: string, tipo: TipoToast = 'info') => {
      const id = ++n.current;
      setItems((l) => [...l.slice(-3), { id, tipo, texto }]);
      window.setTimeout(() => quitar(id), tipo === 'error' ? 8000 : 5000);
    },
    [quitar],
  );
  const valor = useMemo<ValorToast>(
    () => ({ mostrar, ok: (t) => mostrar(t, 'ok'), error: (t) => mostrar(t, 'error') }),
    [mostrar],
  );

  return (
    <Contexto.Provider value={valor}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-[calc(var(--nav-movil)+0.75rem)] z-50 flex flex-col items-center gap-2 md:inset-x-auto md:right-6 md:bottom-6 md:items-end"
        role="region"
        aria-label="Avisos"
      >
        <AnimatePresence initial={false}>
          {items.map((i) => {
            const Icono = ICONO[i.tipo];
            return (
              <motion.div
                key={i.id}
                layout
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                role={i.tipo === 'error' ? 'alert' : 'status'}
                className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-borde bg-superficie p-3.5 shadow-3"
              >
                <Icono className={cn('mt-0.5 size-5 shrink-0', COLOR[i.tipo])} aria-hidden />
                <p className="flex-1 text-sm">{i.texto}</p>
                <button
                  type="button"
                  onClick={() => quitar(i.id)}
                  aria-label="Cerrar aviso"
                  className="-mt-1 -mr-1 grid size-7 place-items-center rounded-md text-texto-3 hover:bg-superficie-2 hover:text-texto"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Contexto.Provider>
  );
}

export function useToast(): ValorToast {
  const v = useContext(Contexto);
  if (!v) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return v;
}
