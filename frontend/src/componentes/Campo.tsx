import {
  useId,
  useState,
  type FocusEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

interface PropsCampo {
  etiqueta: string;
  ayuda?: string;
  /** Error explícito (servidor o validación propia). Los errores nativos salen tras la interacción. */
  error?: string | null;
  className?: string;
}

interface AriaCampo {
  id: string;
  'aria-invalid': boolean;
  'aria-describedby'?: string;
}

const CONTROL =
  'campo-control w-full rounded-md border border-borde-fuerte bg-superficie px-3 text-texto placeholder:text-texto-3 ' +
  'transition-[border-color,box-shadow] duration-[var(--dur-rapida)] hover:border-texto-3 ' +
  'focus-visible:border-acento focus-visible:outline-2 focus-visible:outline-acento focus-visible:outline-offset-0 ' +
  'disabled:cursor-not-allowed disabled:bg-superficie-2 disabled:text-texto-3';

/**
 * Etiqueta + control + ayuda + error. El error nativo (`:user-invalid`) se muestra solo después de que la
 * persona sale del campo, y `aria-invalid`/`aria-describedby` se sincronizan en ese mismo momento.
 */
export function Campo({
  etiqueta,
  ayuda,
  error,
  className,
  children,
}: PropsCampo & { children: (aria: AriaCampo) => ReactNode }) {
  const id = useId();
  const [nativo, setNativo] = useState<string | null>(null);

  const revisar = (e: FocusEvent<HTMLElement> | React.FormEvent<HTMLElement>) => {
    const el = e.target as HTMLInputElement;
    let invalido = false;
    try {
      invalido = el.matches?.(':user-invalid') ?? false;
    } catch {
      invalido = false; // navegadores sin :user-invalid
    }
    setNativo(invalido ? el.validationMessage || 'Revisa este campo.' : null);
  };

  const mensaje = error ?? nativo;
  const idError = `${id}-error`;
  const idAyuda = `${id}-ayuda`;
  const describedby = [ayuda ? idAyuda : null, mensaje ? idError : null].filter(Boolean).join(' ') || undefined;

  return (
    <div
      className={cn('campo flex flex-col gap-1.5', className)}
      onBlurCapture={revisar}
      onInputCapture={revisar}
      onInvalidCapture={revisar}
    >
      <label htmlFor={id} className="text-[0.8125rem] font-medium text-texto">
        {etiqueta}
      </label>
      {ayuda && (
        <p id={idAyuda} className="-mt-0.5 text-xs text-texto-3">
          {ayuda}
        </p>
      )}
      {children({ id, 'aria-invalid': Boolean(mensaje), 'aria-describedby': describedby })}
      {mensaje && (
        <p id={idError} className="flex items-start gap-1.5 text-xs font-medium text-peligro">
          <AlertCircle className="mt-px size-3.5 shrink-0" aria-label="Error" role="img" />
          <span>{mensaje}</span>
        </p>
      )}
    </div>
  );
}

export function Input({
  etiqueta,
  ayuda,
  error,
  className,
  ...resto
}: PropsCampo & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Campo etiqueta={etiqueta} ayuda={ayuda} error={error} className={className}>
      {(aria) => <input className={cn(CONTROL, 'h-10')} {...aria} {...resto} />}
    </Campo>
  );
}

export function Textarea({
  etiqueta,
  ayuda,
  error,
  className,
  ...resto
}: PropsCampo & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Campo etiqueta={etiqueta} ayuda={ayuda} error={error} className={className}>
      {(aria) => <textarea className={cn(CONTROL, 'min-h-24 py-2')} {...aria} {...resto} />}
    </Campo>
  );
}

export function Select({
  etiqueta,
  ayuda,
  error,
  className,
  children,
  ...resto
}: PropsCampo & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Campo etiqueta={etiqueta} ayuda={ayuda} error={error} className={className}>
      {(aria) => (
        <div className="relative">
          <select className={cn(CONTROL, 'h-10 cursor-pointer appearance-none pr-9')} {...aria} {...resto}>
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-texto-3" aria-hidden />
        </div>
      )}
    </Campo>
  );
}
