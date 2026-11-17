import { cn } from '@/lib/cn';
import { iniciales } from '@/lib/formato';

const TAM = { sm: 'size-7 text-[0.6875rem]', md: 'size-9 text-xs', lg: 'size-14 text-lg', xl: 'size-24 text-3xl' };

/** Matiz estable a partir del nombre para que cada avatar tenga su color. */
function matiz(nombre: string): number {
  let h = 0;
  for (const c of nombre) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

interface PropsAvatar {
  nombre: string;
  src?: string | null;
  tamano?: keyof typeof TAM;
  className?: string;
}

export function Avatar({ nombre, src, tamano = 'md', className }: PropsAvatar) {
  const base = cn('inline-grid shrink-0 place-items-center overflow-hidden rounded-full font-semibold select-none', TAM[tamano], className);
  if (src) return <img src={src} alt={nombre} className={cn(base, 'object-cover')} loading="lazy" />;
  const h = matiz(nombre);
  return (
    <span
      role="img"
      aria-label={nombre}
      className={base}
      style={{ background: `light-dark(oklch(0.92 0.045 ${h}), oklch(0.34 0.07 ${h}))`, color: `light-dark(oklch(0.38 0.1 ${h}), oklch(0.9 0.06 ${h}))` }}
    >
      {iniciales(nombre) || nombre.slice(0, 2).toUpperCase()}
    </span>
  );
}
