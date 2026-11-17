import { useId, useMemo, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { ArrowRight } from 'lucide-react';
import { etiquetaArea } from '@/lib/areas';
import { cn } from '@/lib/cn';
import { nombreLegible } from '@/lib/formato';
import { fotoCarrera } from '@/lib/fotos';
import type { Carrera } from '@/lib/modelos';

/** Minúsculas y sin tildes, para que "ingenieria" encuentre "Ingeniería". */
export const normalizarTexto = (t: string) =>
  t
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

/** La carrera cuyo nombre coincide exactamente con el texto (sin distinguir tildes ni mayúsculas). */
export function carreraExacta(carreras: Carrera[] | null | undefined, texto: string): Carrera | undefined {
  const t = normalizarTexto(texto);
  if (!t || !carreras) return undefined;
  return carreras.find((c) => normalizarTexto(c.nombre) === t || normalizarTexto(nombreLegible(c.nombre)) === t);
}

interface Props {
  etiqueta: string;
  etiquetaOculta?: boolean;
  carreras: Carrera[] | null | undefined;
  /** Texto escrito (controlado). */
  texto: string;
  onTexto: (t: string) => void;
  /** Se eligió una carrera de la lista (clic o Enter sobre una opción). */
  onElegir: (c: Carrera) => void;
  placeholder?: string;
  icono?: ReactNode;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  /** Máximo de sugerencias visibles. */
  maximo?: number;
  className?: string;
  claseInput?: string;
  /** `campo`: input con borde de formulario. `plano`: sin borde, para barras compuestas. `barra`: píldora compacta de la cabecera. */
  variante?: 'campo' | 'plano' | 'barra';
}

/**
 * Campo de carrera con sugerencias propias (no el `<datalist>` del navegador): foto, nombre y área de cada carrera,
 * coincidencia sin tildes y teclado completo de Headless UI. El texto libre sigue valiendo para buscar.
 */
export function ComboCarrera({
  etiqueta,
  etiquetaOculta,
  carreras,
  texto,
  onTexto,
  onElegir,
  placeholder,
  icono,
  name,
  required,
  disabled,
  maximo = 8,
  className,
  claseInput,
  variante = 'campo',
}: Props) {
  const id = useId();
  const sugerencias = useMemo(() => {
    const lista = carreras ?? [];
    const t = normalizarTexto(texto);
    if (!t) return lista.slice(0, maximo);
    const empiezan: Carrera[] = [];
    const contienen: Carrera[] = [];
    for (const c of lista) {
      const n = normalizarTexto(nombreLegible(c.nombre));
      if (n.startsWith(t) || n.split(/\s+/).some((p) => p.startsWith(t))) empiezan.push(c);
      else if (n.includes(t) || normalizarTexto(etiquetaArea(c.area ?? '')).startsWith(t)) contienen.push(c);
    }
    return [...empiezan, ...contienen].slice(0, maximo);
  }, [carreras, texto, maximo]);

  // Headless UI resalta la primera sugerencia al escribir. Enter solo elige una sugerencia si la persona llegó a ella con
  // las flechas; si no, envía el formulario con el texto tal cual (p. ej. "ing" abre el catálogo filtrado).
  const navego = useRef(false);
  const alTeclear = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') navego.current = true;
    else if (e.key === 'Enter' && !navego.current) {
      e.preventDefault(); // Headless UI omite su manejador cuando el evento ya fue prevenido.
      e.currentTarget.form?.requestSubmit();
    } else if (e.key === 'Escape' && !e.currentTarget.getAttribute('aria-expanded')?.includes('true')) {
      // Escape con el panel cerrado no debe borrar lo escrito.
      e.stopPropagation();
    }
  };

  return (
    <div className={cn('relative flex flex-col gap-1.5', className)}>
      <Combobox<Carrera | null>
        value={null}
        onChange={(c) => {
          if (!c) return;
          onTexto(nombreLegible(c.nombre));
          onElegir(c);
        }}
        disabled={disabled}
        immediate
      >
        <label htmlFor={`${id}-input`} className={cn('text-[0.8125rem] font-medium text-texto', etiquetaOculta && 'sr-only')}>
          {etiqueta}
        </label>
        <div className="relative">
          {icono && <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-texto-3 [&>svg]:size-4">{icono}</span>}
          <ComboboxInput
            id={`${id}-input`}
            name={name}
            required={required}
            autoComplete="off"
            enterKeyHint="search"
            placeholder={placeholder}
            value={texto}
            displayValue={() => texto}
            onChange={(e) => {
              navego.current = false;
              onTexto(e.target.value);
            }}
            onKeyDown={alTeclear}
            className={cn(
              'w-full px-3 text-texto placeholder:text-texto-3 disabled:cursor-not-allowed',
              variante === 'campo'
                ? 'h-10 rounded-md border border-borde-fuerte bg-superficie hover:border-texto-3 focus-visible:border-acento focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-acento disabled:bg-superficie-2'
                : variante === 'plano'
                  ? 'h-11 rounded-lg bg-transparent text-base focus-visible:outline-offset-0'
                  : 'h-9 rounded-full border border-borde bg-superficie text-sm hover:border-borde-fuerte focus-visible:border-acento',
              Boolean(icono) && 'pl-9',
              claseInput,
            )}
          />
          <ComboboxOptions
            modal={false}
            transition
            className={cn(
              'absolute top-full left-0 z-50 mt-1.5 max-h-80 w-full min-w-[min(22rem,calc(100vw-2rem))] overflow-auto overscroll-contain rounded-lg border border-borde bg-superficie p-1 text-texto shadow-3 empty:invisible',
              'origin-top transition duration-[var(--dur-rapida)] ease-[var(--ease-salida)] data-[closed]:-translate-y-1 data-[closed]:opacity-0 motion-reduce:transition-none',
            )}
          >
            {sugerencias.map((c) => {
              const foto = fotoCarrera(c);
              return (
                <ComboboxOption
                  key={c.id}
                  value={c}
                  className="group/op flex min-h-12 cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 select-none data-[focus]:bg-superficie-2"
                >
                  <img src={foto.sm ?? foto.src} alt="" width={40} height={40} loading="lazy" className="size-10 shrink-0 rounded-md bg-superficie-2 object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{nombreLegible(c.nombre)}</span>
                    {c.area && <span className="block truncate text-xs text-texto-3">{etiquetaArea(c.area)}</span>}
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-texto-3 opacity-0 group-data-[focus]/op:opacity-100" aria-hidden />
                </ComboboxOption>
              );
            })}
          </ComboboxOptions>
        </div>
      </Combobox>
    </div>
  );
}
