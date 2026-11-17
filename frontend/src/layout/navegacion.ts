import { GitCompareArrows, GraduationCap, Home, Search, Shield, UserRound, type LucideIcon } from 'lucide-react';

export interface ItemNav {
  a: string;
  etiqueta: string;
  icono: LucideIcon;
  /** Prefijos de ruta que dejan el item activo. */
  activo?: string[];
  soloAdmin?: boolean;
}

export const ITEMS_NAV: ItemNav[] = [
  { a: '/inicio', etiqueta: 'Inicio', icono: Home },
  { a: '/buscar', etiqueta: 'Buscar', icono: Search, activo: ['/buscar', '/busquedas'] },
  { a: '/carreras', etiqueta: 'Catálogo', icono: GraduationCap, activo: ['/carreras', '/universidades', '/ofertas'] },
  { a: '/comparar', etiqueta: 'Comparar', icono: GitCompareArrows },
  { a: '/perfil', etiqueta: 'Perfil', icono: UserRound, activo: ['/perfil'] },
  { a: '/admin', etiqueta: 'Admin', icono: Shield, soloAdmin: true },
];

/** `_search` se conserva en la firma para no romper a quien la llama. */
export function estaActivo(item: ItemNav, ruta: string, _search?: string): boolean {
  const prefijos = item.activo ?? [item.a];
  return prefijos.some((p) => ruta === p || ruta.startsWith(`${p}/`));
}

/** Destinos sin sesión: las vistas públicas (el resto exige cuenta). */
export const ITEMS_PUBLICOS: ItemNav[] = ITEMS_NAV.filter((i) => ['/buscar', '/carreras', '/comparar'].includes(i.a));
