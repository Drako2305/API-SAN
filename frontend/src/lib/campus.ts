import creditos from '../../public/campus/creditos.json';
import { slugCampus } from './fotos';

export type SlugCampus =
  | 'nacional' | 'andes' | 'javeriana' | 'antioquia' | 'eafit' | 'valle' | 'norte'
  | 'rosario' | 'externado' | 'sabana' | 'uis' | 'upb' | 'cauca' | 'utp' | 'cartagena' | 'ucc' | 'icesi' | 'magdalena' | 'caldas';

export interface FotoCampus {
  slug: SlugCampus;
  universidad: string;
  ciudad: string;
  /** Versión pequeña (~800px) y completa. */
  sm: string;
  src: string;
  autor: string;
  licencia: string;
  fuente: string;
}

const BASE: Array<[SlugCampus, string, string]> = [
  ['nacional', 'Universidad Nacional de Colombia', 'Bogotá'],
  ['andes', 'Universidad de los Andes', 'Bogotá'],
  ['javeriana', 'Pontificia Universidad Javeriana', 'Bogotá'],
  ['antioquia', 'Universidad de Antioquia', 'Medellín'],
  ['eafit', 'Universidad EAFIT', 'Medellín'],
  ['valle', 'Universidad del Valle', 'Cali'],
  ['norte', 'Universidad del Norte', 'Barranquilla'],
  ['rosario', 'Universidad del Rosario', 'Bogotá'],
  ['externado', 'Universidad Externado de Colombia', 'Bogotá'],
  ['sabana', 'Universidad de La Sabana', 'Chía'],
  ['uis', 'Universidad Industrial de Santander', 'Bucaramanga'],
  ['upb', 'Universidad Pontificia Bolivariana', 'Medellín'],
  ['cauca', 'Universidad del Cauca', 'Popayán'],
  ['utp', 'Universidad Tecnológica de Pereira', 'Pereira'],
  ['cartagena', 'Universidad de Cartagena', 'Cartagena'],
  ['ucc', 'Universidad Cooperativa de Colombia', 'Bogotá'],
  ['icesi', 'Universidad Icesi', 'Cali'],
  ['magdalena', 'Universidad del Magdalena', 'Santa Marta'],
  ['caldas', 'Universidad de Caldas', 'Manizales'],
];

const CRED = creditos as Record<string, { autor?: string; licencia?: string; fuente?: string }>;

/** Fotos de campus con licencia libre (Wikimedia Commons); créditos en /campus/CREDITOS.md. */
export const FOTOS_CAMPUS: FotoCampus[] = BASE.map(([slug, universidad, ciudad]) => ({
  slug,
  universidad,
  ciudad,
  sm: `/campus/${slug}-sm.webp`,
  src: `/campus/${slug}.webp`,
  // Búsqueda opcional: una foto nueva puede no tener créditos todavía.
  autor: CRED[slug]?.autor ?? '',
  licencia: CRED[slug]?.licencia ?? '',
  fuente: CRED[slug]?.fuente ?? '',
}));

export const fotoPorSlug = (slug: SlugCampus): FotoCampus => FOTOS_CAMPUS.find((f) => f.slug === slug)!;

/** Busca la foto de campus que corresponde al nombre de una universidad del catálogo, si existe. */
export function fotoDeUniversidad(nombre: string): FotoCampus | undefined {
  const s = slugCampus(nombre);
  return s ? FOTOS_CAMPUS.find((f) => f.slug === s) : undefined;
}
