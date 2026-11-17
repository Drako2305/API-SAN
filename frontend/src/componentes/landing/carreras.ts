import { slug } from '@/lib/fotos';

export interface CarreraDestacada {
  nombre: string;
  area: string;
}

/** Carreras con foto en el catálogo (nombres de la spec); el enlace abre el catálogo filtrado por nombre. */
export const CARRERAS_DESTACADAS: CarreraDestacada[] = [
  { nombre: 'Ingeniería de Sistemas', area: 'Ingenieria' },
  { nombre: 'Medicina', area: 'Salud' },
  { nombre: 'Derecho', area: 'Ciencias Sociales' },
  { nombre: 'Arquitectura', area: 'Artes y Diseno' },
  { nombre: 'Psicología', area: 'Salud' },
  { nombre: 'Administración de Empresas', area: 'Negocios' },
  { nombre: 'Diseño Gráfico', area: 'Artes y Diseno' },
  { nombre: 'Economía', area: 'Negocios' },
  { nombre: 'Biología', area: 'Ciencias' },
  { nombre: 'Música', area: 'Artes y Diseno' },
];

export function rutaCarrera(nombre: string) {
  const s = slug(nombre);
  return { src: `/carreras/${s}.webp`, sm: `/carreras/${s}-sm.webp` };
}

