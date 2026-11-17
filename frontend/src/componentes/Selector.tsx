import { useCallback, useId, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Field, Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { AlertCircle, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface OpcionSelector {
  valor: string;
  etiqueta: string;
  /** Texto secundario a la derecha (un conteo, una ciudad). */
  detalle?: string;
  icono?: ReactNode;
  deshabilitada?: boolean;
}

export interface PropsSelector {
  /** Etiqueta del campo. Con `etiquetaOculta` solo la leen los lectores de pantalla. */
  etiqueta: string;
  etiquetaOculta?: boolean;
  opciones: OpcionSelector[];
  valor: string;
  onCambio: (valor: string) => void;
  /** Texto cuando el valor no coincide con ninguna opción. */
  placeholder?: string;
  /** Ícono al inicio del botón. */
  icono?: ReactNode;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  ayuda?: string;
  error?: string | null;
  /** `campo`: control con borde de formulario. `plano`: sin borde, para barras de búsqueda compuestas. */
  variante?: 'campo' | 'plano';
  className?: string;
  claseBoton?: string;
}

/**
 * El panel se abre en la capa superior del navegador (`popover="manual"`), así ningún contenedor con `overflow`
 * (un `<dialog>` con scroll, una tarjeta) lo recorta. Sigue en el DOM del selector, de modo que dentro de un diálogo
 * modal no queda inerte. Donde no hay `popover` (jsdom, navegadores viejos) queda como panel fijo. Se coloca con `position: fixed` bajo el botón (o encima, si abajo no cabe) y se recoloca
 * al desplazar o cambiar el tamaño de la ventana.
 */
const POPOVER = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;

function usePanelSuperior(boton: RefObject<HTMLButtonElement | null>) {
  const limpiar = useRef<(() => void) | null>(null);
  return useCallback(
    (el: HTMLElement | null) => {
      limpiar.current?.();
      limpiar.current = null;
      if (!el) return;
      const colocar = () => {
        const b = boton.current?.getBoundingClientRect();
        if (!b) return;
        const abajo = window.innerHeight - b.bottom - 12;
        const arriba = b.top - 12;
        const haciaArriba = abajo < 200 && arriba > abajo;
        const alto = Math.min(288, haciaArriba ? arriba : abajo);
        Object.assign(el.style, {
          left: `${Math.max(8, Math.min(b.left, window.innerWidth - Math.max(el.offsetWidth, b.width) - 8))}px`,
          minWidth: `${b.width}px`,
          maxHeight: `${Math.max(120, alto)}px`,
          top: haciaArriba ? 'auto' : `${b.bottom + 6}px`,
          bottom: haciaArriba ? `${window.innerHeight - b.top + 6}px` : 'auto',
        });
      };
      // Se abre en el mismo momento en que se monta, antes de que Headless UI le pase el foco.
      if (POPOVER && !el.matches(':popover-open')) el.showPopover();
      colocar();
      window.addEventListener('scroll', colocar, true);
      window.addEventListener('resize', colocar);
      limpiar.current = () => {
        window.removeEventListener('scroll', colocar, true);
        window.removeEventListener('resize', colocar);
      };
    },
    [boton],
  );
}

/**
 * Selector propio sobre el `Listbox` de Headless UI: teclado completo (flechas, Inicio/Fin, búsqueda por letra, Esc),
 * roles ARIA y retorno del foco. El panel va en la capa superior sin salir del árbol (ver `usePanelSuperior`).
 * Con `required` valida al enviar el formulario con un campo oculto propio y muestra el error junto al control.
 */
export function Selector({
  etiqueta,
  etiquetaOculta,
  opciones,
  valor,
  onCambio,
  placeholder = 'Elige una opción',
  icono,
  name,
  required,
  disabled,
  ayuda,
  error,
  variante = 'campo',
  className,
  claseBoton,
}: PropsSelector) {
  const id = useId();
  const boton = useRef<HTMLButtonElement>(null);
  const [faltante, setFaltante] = useState(false);
  const actual = opciones.find((o) => o.valor === valor);
  const mensaje = error ?? (faltante ? 'Elige una opción de la lista.' : null);
  const idAyuda = `${id}-ayuda`;
  const idError = `${id}-error`;
  const describedby = [ayuda ? idAyuda : null, mensaje ? idError : null].filter(Boolean).join(' ') || undefined;
  const panelSuperior = usePanelSuperior(boton);

  return (
    <Field disabled={disabled} className={cn('relative flex flex-col gap-1.5', className)}>
      <Listbox
        value={valor}
        onChange={(v: string) => {
          setFaltante(false);
          onCambio(v);
        }}
        disabled={disabled}
      >
        <Label className={cn('text-[0.8125rem] font-medium text-texto', etiquetaOculta && 'sr-only')}>{etiqueta}</Label>
        {ayuda && (
          <p id={idAyuda} className="-mt-0.5 text-xs text-texto-3">
            {ayuda}
          </p>
        )}
        <div className="relative">
        <ListboxButton
          ref={boton}
          aria-describedby={describedby}
          aria-invalid={Boolean(mensaje) || undefined}
          className={cn(
            'group flex w-full cursor-pointer items-center gap-2 text-left text-texto transition-[border-color,box-shadow,background-color] duration-[var(--dur-rapida)]',
            'disabled:cursor-not-allowed disabled:text-texto-3',
            variante === 'campo'
              ? 'h-10 rounded-md border border-borde-fuerte bg-superficie px-3 hover:border-texto-3 focus-visible:border-acento focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-acento data-[open]:border-acento disabled:bg-superficie-2 aria-[invalid]:border-peligro'
              : 'h-11 rounded-lg bg-transparent px-2 hover:bg-superficie-2 data-[open]:bg-superficie-2',
            claseBoton,
          )}
        >
          {icono && <span className="shrink-0 text-texto-3 [&>svg]:size-4">{icono}</span>}
          <span id={`${id}-valor`} className={cn('min-w-0 flex-1 truncate', !actual && 'text-texto-3', variante === 'plano' && 'text-base')}>
            {actual ? actual.etiqueta : placeholder}
          </span>
          <ChevronDown
            className="size-4 shrink-0 text-texto-3 transition-transform duration-[var(--dur-rapida)] group-data-[open]:rotate-180 motion-reduce:transition-none"
            aria-hidden
          />
        </ListboxButton>
        <ListboxOptions
          modal={false}
          transition
          ref={panelSuperior}
          {...(POPOVER ? { popover: 'manual' } : {})}
          className={cn(
            'selector-panel overflow-auto overscroll-contain rounded-lg border border-borde bg-superficie p-1 text-texto shadow-3 focus:outline-none',
            'transition-[opacity,translate] duration-[var(--dur-rapida)] ease-[var(--ease-salida)] data-[closed]:-translate-y-1 data-[closed]:opacity-0 motion-reduce:transition-none',
            variante === 'plano' && 'w-max max-w-[min(20rem,calc(100vw-2rem))]',
          )}
        >
          {opciones.map((o) => (
            <ListboxOption
              key={o.valor}
              value={o.valor}
              disabled={o.deshabilitada}
              className="group/op flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm select-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[focus]:bg-superficie-2 data-[selected]:font-medium data-[selected]:text-acento-texto"
            >
              {o.icono && <span className="shrink-0 text-texto-3 group-data-[selected]/op:text-acento-texto [&>svg]:size-4">{o.icono}</span>}
              <span className="min-w-0 flex-1 truncate">{o.etiqueta}</span>
              {o.detalle && <span className="numeros shrink-0 text-xs text-texto-3">{o.detalle}</span>}
              <Check className="invisible size-4 shrink-0 text-acento-texto group-data-[selected]/op:visible" aria-hidden />
            </ListboxOption>
          ))}
        </ListboxOptions>
        </div>
      </Listbox>
      {name !== undefined || required ? (
        // Campo oculto: lleva el valor en el envío del formulario y participa en la validación nativa sin mostrar su globo.
        <input
          tabIndex={-1}
          aria-hidden
          name={name}
          value={valor}
          required={required}
          onChange={() => undefined}
          onInvalid={(e) => {
            e.preventDefault();
            setFaltante(true);
            boton.current?.focus();
          }}
          className="pointer-events-none absolute bottom-0 left-4 h-px w-px opacity-0"
        />
      ) : null}
      {mensaje && (
        <p id={idError} className="flex items-start gap-1.5 text-xs font-medium text-peligro">
          <AlertCircle className="mt-px size-3.5 shrink-0" aria-label="Error" role="img" />
          <span>{mensaje}</span>
        </p>
      )}
    </Field>
  );
}
