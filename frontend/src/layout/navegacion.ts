import { GitCompareArrows, GraduationCap, Heart, Home, Search, Shield, UserRound, type LucideIcon } from 'lucide-react';

export interface ItemNav {
  a: string;
  etiqueta: string;
  icono: LucideIcon;
  /** Prefijos de ruta que dejan el item activo. */
  activo?: string[];
  soloAdmin?: boolean;
  /** Visible en la barra inferior móvil (el resto vive en el menú de cuenta). */
  movil?: boolean;
  /** Requiere sesión para tener sentido; sin ella se muestra igual y la ruta pide ingresar. */
}

export const ITEMS_NAV: ItemNav[] = [
  { a: '/inicio', etiqueta: 'Inicio', icono: Home, movil: true },
  { a: '/buscar', etiqueta: 'Buscar', icono: Search, activo: ['/buscar', '/busquedas'], movil: true },
  { a: '/carreras', etiqueta: 'Catálogo', icono: GraduationCap, activo: ['/carreras', '/universidades', '/ofertas'], movil: true },
  { a: '/comparar', etiqueta: 'Comparar', icono: GitCompareArrows, movil: true },
  { a: '/perfil?pestana=favoritos', etiqueta: 'Favoritos', icono: Heart, activo: [] },
  { a: '/perfil', etiqueta: 'Perfil', icono: UserRound, activo: ['/perfil'], movil: true },
  { a: '/admin', etiqueta: 'Admin', icono: Shield, soloAdmin: true },
];

export function estaActivo(item: ItemNav, ruta: string, search: string): boolean {
  if (item.a.startsWith('/perfil?pestana=favoritos')) return ruta === '/perfil' && search.includes('pestana=favoritos');
  if (item.a === '/perfil') return ruta === '/perfil' && !search.includes('pestana=favoritos');
  const prefijos = item.activo ?? [item.a];
  return prefijos.some((p) => ruta === p || ruta.startsWith(`${p}/`));
}
