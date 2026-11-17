import { cn } from '@/lib/cn';

/**
 * Marca API SAN: ficha carmesí con esquirlas y el nombre en blanco con la tipografía de marca (Londrina Solid).
 * `conNombre` muestra "APi-SAN" en ficha ancha; sin nombre queda solo "SAN" en ficha cuadrada.
 */
export function Logo({ conNombre = true, className }: { conNombre?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center', className)}>
      <span
        aria-hidden
        className={cn(
          'fondo-esquirlas esquirlas logotipo inline-flex h-9 items-center justify-center rounded-[10px] text-[1.35rem]',
          conNombre ? 'px-3' : 'w-9 text-[1.15rem]',
        )}
      >
        {conNombre ? 'APi-SAN' : 'SAN'}
      </span>
      <span className="sr-only">API SAN</span>
    </span>
  );
}
