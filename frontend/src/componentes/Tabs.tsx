import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface TabDef {
  id: string;
  etiqueta: string;
  contenido: ReactNode;
}

interface PropsTabs {
  tabs: TabDef[];
  /** Nombre accesible de la lista de pestañas. */
  nombre: string;
  inicial?: string;
  valor?: string;
  onCambio?: (id: string) => void;
  className?: string;
}

/**
 * Pestañas accesibles (patrón WAI-ARIA tablist): foco con flechas/Inicio/Fin, la selección sigue al foco,
 * paneles ocultos con `hidden="until-found"` para que "Buscar en la página" los encuentre.
 * No usar para navegación entre páginas.
 */
export function Tabs({ tabs, nombre, inicial, valor, onCambio, className }: PropsTabs) {
  const base = useId();
  const [interno, setInterno] = useState(inicial ?? tabs[0]?.id);
  const activa = valor ?? interno;
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const elegir = (id: string, enfocar = false) => {
    setInterno(id);
    onCambio?.(id);
    if (enfocar) refs.current[id]?.focus();
  };

  const teclado = (e: KeyboardEvent) => {
    const i = tabs.findIndex((t) => t.id === activa);
    let n = -1;
    if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = tabs.length - 1;
    if (n >= 0) {
      e.preventDefault();
      elegir(tabs[n]!.id, true);
    }
  };

  return (
    <div className={className}>
      <div role="tablist" aria-label={nombre} onKeyDown={teclado} className="flex gap-1 overflow-x-auto border-b border-borde">
        {tabs.map((t) => {
          const sel = t.id === activa;
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[t.id] = el;
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${t.id}`}
              aria-selected={sel}
              tabIndex={sel ? 0 : -1}
              onClick={() => elegir(t.id)}
              className={cn(
                '-mb-px h-10 shrink-0 border-b-2 px-3 text-sm font-medium transition-colors duration-[var(--dur-rapida)]',
                sel ? 'border-acento text-texto' : 'border-transparent text-texto-3 hover:text-texto',
              )}
            >
              {t.etiqueta}
            </button>
          );
        })}
      </div>
      {tabs.map((t) => {
        const sel = t.id === activa;
        return (
          <Panel key={t.id} id={t.id} etiquetadoPor={`${base}-tab-${t.id}`} seleccionado={sel} onCoincidencia={() => elegir(t.id)}>
            {t.contenido}
          </Panel>
        );
      })}
    </div>
  );
}

function Panel({ etiquetadoPor, seleccionado, onCoincidencia, children }: { id: string; etiquetadoPor: string; seleccionado: boolean; onCoincidencia: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const cb = useRef(onCoincidencia);
  cb.current = onCoincidencia;
  // `beforematch` se dispara cuando "Buscar en la página" revela un panel oculto con until-found.
  useEffect(() => {
    const el = ref.current;
    const f = () => cb.current();
    el?.addEventListener('beforematch', f);
    return () => el?.removeEventListener('beforematch', f);
  }, []);
  const oculto = seleccionado ? {} : ({ hidden: 'until-found' } as object);
  return (
    <div ref={ref} role="tabpanel" aria-labelledby={etiquetadoPor} tabIndex={seleccionado ? 0 : undefined} className="pt-5" {...oculto}>
      {children}
    </div>
  );
}
