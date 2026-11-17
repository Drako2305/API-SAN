import { cn } from '@/lib/cn';

/** Marca SAN: monograma en cuadrado de acento + nombre opcional. */
export function Logo({ conNombre = true, className }: { conNombre?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden>
        <rect width="32" height="32" rx="9" fill="var(--c-acento)" />
        <path d="M10 21.5c1.6 1.4 3.4 2 5.6 2 2.7 0 4.4-1.1 4.4-3 0-4.4-9.6-2-9.6-7.4 0-2.4 2.1-4.1 5.4-4.1 2 0 3.7.5 5 1.5" fill="none" stroke="var(--c-sobre-acento)" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
      {conNombre ? <span className="font-display text-xl font-bold tracking-tight">SAN</span> : <span className="sr-only">SAN</span>}
    </span>
  );
}
