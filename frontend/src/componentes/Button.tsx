import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export type VarianteBoton = 'primario' | 'secundario' | 'fantasma' | 'peligro';
export type TamanoBoton = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium select-none ' +
  'transition-[background-color,border-color,color,transform] duration-[var(--dur-rapida)] ease-[var(--ease-salida)] ' +
  'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 ' +
  'motion-reduce:active:scale-100';

const VARIANTES: Record<VarianteBoton, string> = {
  primario: 'bg-acento text-sobre-acento hover:bg-acento-hover border border-transparent',
  secundario: 'bg-superficie text-texto border border-borde-fuerte hover:bg-superficie-2',
  fantasma: 'bg-transparent text-texto-2 border border-transparent hover:bg-superficie-2 hover:text-texto',
  peligro: 'bg-peligro text-sobre-acento border border-transparent hover:brightness-110',
};

const TAMANOS: Record<TamanoBoton, string> = {
  sm: 'h-8 px-3 text-[0.8125rem]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export function claseBoton(v: VarianteBoton = 'primario', t: TamanoBoton = 'md', extra?: string): string {
  return cn(BASE, VARIANTES[v], TAMANOS[t], extra);
}

interface PropsComunes {
  variante?: VarianteBoton;
  tamano?: TamanoBoton;
  icono?: ReactNode;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, PropsComunes {
  cargando?: boolean;
}

export function Button({ variante, tamano, icono, cargando, className, children, disabled, type = 'button', ...resto }: ButtonProps) {
  return (
    <button type={type} className={claseBoton(variante, tamano, className)} disabled={disabled || cargando} aria-busy={cargando || undefined} {...resto}>
      {cargando ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> : icono}
      {children}
    </button>
  );
}

/** Enlace con aspecto de botón (navegación, no acción). */
export function LinkButton({ variante, tamano, icono, className, children, ...resto }: LinkProps & PropsComunes) {
  return (
    <Link className={claseBoton(variante, tamano, cn('no-underline', className))} {...resto}>
      {icono}
      {children}
    </Link>
  );
}
