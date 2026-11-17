import creditos from '../../public/campus/creditos.json';

export type SlugCampus = 'nacional' | 'andes' | 'javeriana' | 'antioquia' | 'eafit' | 'valle' | 'norte';

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
];

const CRED = creditos as Record<string, { autor: string; licencia: string; fuente: string }>;

/** Fotos de campus con licencia libre (Wikimedia Commons); créditos en /campus/CREDITOS.md. */
export const FOTOS_CAMPUS: FotoCampus[] = BASE.map(([slug, universidad, ciudad]) => ({
  slug,
  universidad,
  ciudad,
  sm: `/campus/${slug}-sm.webp`,
  src: `/campus/${slug}.webp`,
  ...CRED[slug]!,
}));

export const fotoPorSlug = (slug: SlugCampus): FotoCampus => FOTOS_CAMPUS.find((f) => f.slug === slug)!;

const PALABRAS: Array<[RegExp, SlugCampus]> = [
  [/nacional/i, 'nacional'],
  [/andes/i, 'andes'],
  [/javeriana/i, 'javeriana'],
  [/antioquia/i, 'antioquia'],
  [/eafit/i, 'eafit'],
  [/valle/i, 'valle'],
  [/norte/i, 'norte'],
];

/** Busca la foto de campus que corresponde al nombre de una universidad del catálogo, si existe. */
export function fotoDeUniversidad(nombre: string): FotoCampus | undefined {
  const hit = PALABRAS.find(([re]) => re.test(nombre));
  return hit ? fotoPorSlug(hit[1]) : undefined;
}
