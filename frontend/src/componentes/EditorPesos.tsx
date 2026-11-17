import { useId } from 'react';
import { BadgeCheck, Info, MapPin, MonitorSmartphone, Wallet, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { CRITERIO_ETIQUETA } from '@/lib/formato';
import { CRITERIOS, type Criterio, type Pesos } from '@/lib/modelos';
import { normalizar } from '@/lib/pesos';

const ICONO: Record<Criterio, LucideIcon> = {
  costo: Wallet,
  modalidad: MonitorSmartphone,
  ubicacion: MapPin,
  acreditacion: BadgeCheck,
};

const AYUDA_POR_DEFECTO: Record<Criterio, string> = {
  costo: 'Suma más cuanto más barata sea la oferta.',
  modalidad: 'Suma si coincide con la modalidad que elegiste.',
  ubicacion: 'Suma si está en la ciudad que elegiste.',
  acreditacion: 'Suma si el programa está acreditado.',
};

/** Nombre de cada nivel (0 a 5): se lee junto al control y es el `aria` de cada opción. */
export const NIVEL: readonly string[] = ['No cuenta', 'Muy poco', 'Poco', 'Importante', 'Muy importante', 'Lo más importante'];

/** Combinaciones de partida. Solo reparten pesos: no prometen resultados. */
export const PERFILES: Array<{ id: string; etiqueta: string; pesos: Pesos }> = [
  { id: 'equilibrado', etiqueta: 'Equilibrado', pesos: { costo: 3, modalidad: 3, ubicacion: 3, acreditacion: 3 } },
  { id: 'economico', etiqueta: 'Lo más económico', pesos: { costo: 5, modalidad: 1, ubicacion: 2, acreditacion: 2 } },
  { id: 'cerca', etiqueta: 'Cerca de mí', pesos: { costo: 2, modalidad: 1, ubicacion: 5, acreditacion: 2 } },
  { id: 'calidad', etiqueta: 'Acreditadas primero', pesos: { costo: 2, modalidad: 1, ubicacion: 2, acreditacion: 5 } },
  { id: 'modalidad', etiqueta: 'Mi modalidad', pesos: { costo: 2, modalidad: 5, ubicacion: 1, acreditacion: 2 } },
];

const iguales = (a: Pesos, b: Pesos) => CRITERIOS.every((c) => a[c] === b[c]);

/** Tinte del acento por criterio para el reparto (un solo color de marca, en cuatro intensidades). */
const TINTE: Record<Criterio, string> = {
  costo: 'var(--c-acento)',
  modalidad: 'color-mix(in oklch, var(--c-acento) 70%, var(--c-superficie))',
  ubicacion: 'color-mix(in oklch, var(--c-acento) 45%, var(--c-superficie))',
  acreditacion: 'color-mix(in oklch, var(--c-acento) 25%, var(--c-superficie))',
};

function Nivel({ criterio, valor, onCambio, disabled, ayuda, sinEfecto }: { criterio: Criterio; valor: number; onCambio: (v: number) => void; disabled?: boolean; ayuda: string; sinEfecto?: string }) {
  const id = useId();
  const Icono = ICONO[criterio];
  return (
    <fieldset disabled={disabled} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 gap-y-2.5 py-4 first:pt-0 last:pb-0 sm:grid-cols-[2.25rem_minmax(0,1fr)_auto] sm:items-center">
      <span aria-hidden className="grid size-9 place-items-center rounded-md bg-acento-suave text-acento-texto">
        <Icono className="size-[1.125rem]" />
      </span>
      <div className="min-w-0">
        <legend className="float-left font-medium">{CRITERIO_ETIQUETA[criterio]}</legend>
        {sinEfecto ? (
          <p className="clear-left flex items-start gap-1 text-xs text-aviso">
            <Info className="mt-px size-3.5 shrink-0" aria-hidden />
            <span>{sinEfecto}</span>
          </p>
        ) : (
          <p className="clear-left text-xs text-texto-3">{ayuda}</p>
        )}
      </div>
      <div className="col-span-2 flex items-center gap-3 sm:col-span-1 sm:col-start-3">
        <div role="presentation" className="flex h-10 items-end gap-1 rounded-lg bg-superficie-2 p-1">
          {NIVEL.map((nombre, n) => {
            const lleno = n > 0 && n <= valor;
            const elegido = n === valor;
            return (
              <label
                key={n}
                title={nombre}
                className={cn(
                  'group relative flex h-full w-8 cursor-pointer items-end justify-center rounded-md transition-colors duration-[var(--dur-rapida)]',
                  'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-acento',
                  elegido ? 'bg-superficie shadow-1' : 'hover:bg-superficie',
                  'has-[:disabled]:cursor-not-allowed',
                )}
              >
                <input
                  type="radio"
                  name={id}
                  value={n}
                  checked={elegido}
                  onChange={() => onCambio(n)}
                  aria-label={`${CRITERIO_ETIQUETA[criterio]}: ${n}, ${nombre}`}
                  className="sr-only"
                />
                {n === 0 ? (
                  <span aria-hidden className={cn('mb-1 text-[0.6875rem] font-semibold', elegido ? 'text-texto' : 'text-texto-3')}>
                    0
                  </span>
                ) : (
                  <span
                    aria-hidden
                    className={cn(
                      'mb-0.5 w-3.5 rounded-[3px] transition-[background-color,height] duration-[var(--dur-media)] ease-[var(--ease-salida)] motion-reduce:transition-none',
                      lleno ? 'bg-acento' : 'bg-superficie-3 group-hover:bg-borde-fuerte',
                    )}
                    style={{ height: `${20 + n * 13}%` }}
                  />
                )}
              </label>
            );
          })}
        </div>
        <output className={cn('numeros w-32 text-sm font-medium', valor === 0 ? 'text-texto-3' : 'text-acento-texto')} aria-live="off">
          {NIVEL[valor]}
        </output>
      </div>
    </fieldset>
  );
}

interface PropsEditor {
  valor: Pesos;
  onCambio: (p: Pesos) => void;
  disabled?: boolean;
  ayuda?: Partial<Record<Criterio, string>>;
  /**
   * Criterios que hoy no pueden cambiar el orden, con el motivo (p. ej. la ciudad ya filtra los resultados).
   * Se avisa en su fila y se ocultan los perfiles que solo los subirían a ellos.
   */
  sinEfecto?: Partial<Record<Criterio, string>>;
  className?: string;
}

/**
 * Editor de pesos 0-5: perfiles de partida, un control escalonado por criterio (radios nativos: flechas para moverse)
 * y el reparto real que resulta (cuánto pesa cada criterio frente a los demás, calculado con `normalizar`).
 */
export function EditorPesos({ valor, onCambio, disabled, ayuda, sinEfecto, className }: PropsEditor) {
  const pct = normalizar(valor);
  const suma = CRITERIOS.reduce((s, c) => s + valor[c], 0);
  return (
    <div className={cn('flex flex-col gap-5', className)}>
      <div role="group" aria-label="Perfiles de partida" className="flex flex-wrap gap-2">
        {PERFILES.filter((p) => !CRITERIOS.some((c) => p.pesos[c] === 5 && sinEfecto?.[c])).map((p) => {
          const activo = iguales(p.pesos, valor);
          return (
            <button
              key={p.id}
              type="button"
              disabled={disabled}
              aria-pressed={activo}
              onClick={() => onCambio(p.pesos)}
              className={cn(
                'inline-flex h-8 items-center rounded-full border px-3 text-[0.8125rem] font-medium transition-colors duration-[var(--dur-rapida)] disabled:opacity-50',
                activo ? 'border-acento-borde bg-acento-suave text-acento-texto' : 'border-borde bg-superficie text-texto-2 hover:bg-superficie-2 hover:text-texto',
              )}
            >
              {p.etiqueta}
            </button>
          );
        })}
      </div>

      <div className="divide-y divide-borde">
        {CRITERIOS.map((c) => (
          <Nivel
            key={c}
            criterio={c}
            valor={valor[c]}
            disabled={disabled}
            ayuda={ayuda?.[c] ?? AYUDA_POR_DEFECTO[c]}
            sinEfecto={sinEfecto?.[c]}
            onCambio={(n) => onCambio({ ...valor, [c]: n })}
          />
        ))}
      </div>

      <div className="rounded-lg bg-superficie-2 p-3.5">
        <p className="text-[0.8125rem] font-medium">Cómo se reparte tu puntaje</p>
        {suma === 0 ? (
          <p className="mt-1 text-sm text-aviso">Con todo en 0 ningún criterio influye y todas las ofertas empatan. Sube al menos uno.</p>
        ) : (
          <>
            <div className="mt-2.5 flex h-2.5 overflow-hidden rounded-full bg-superficie-3" aria-hidden>
              {CRITERIOS.map((c) => (
                <span
                  key={c}
                  className="h-full transition-[width] duration-[var(--dur-media)] ease-[var(--ease-salida)] motion-reduce:transition-none [&+&]:border-l-2 [&+&]:border-superficie-2"
                  style={{ width: `${pct[c]}%`, background: TINTE[c] }}
                />
              ))}
            </div>
            <ul className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-texto-2 sm:grid-cols-4">
              {CRITERIOS.map((c) => (
                <li key={c} className="flex items-center gap-1.5">
                  <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: TINTE[c] }} />
                  <span className="truncate">{CRITERIO_ETIQUETA[c]}</span>
                  <span className="numeros ml-auto font-medium text-texto" data-testid={`pct-${c}`}>
                    {pct[c]} %
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
