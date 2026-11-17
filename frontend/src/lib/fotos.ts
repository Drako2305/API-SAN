/** Rutas de fotos de carreras y campus. Convención de nombres: slug del nombre, sin tildes y en kebab-case. */

export function slug(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface FotoRuta {
  /** Versión completa (~1600 px). */
  src: string;
  /** Versión pequeña (~800 px). */
  sm: string;
}

const pequena = (ruta: string) => (/\.webp$/.test(ruta) ? ruta.replace(/\.webp$/, '-sm.webp') : ruta);

function desdeRuta(ruta: string): FotoRuta {
  return { src: ruta, sm: pequena(ruta) };
}

/** Foto de una carrera: `imagenUrl` de la API o, si falta, `/carreras/<slug>.webp`. */
export function fotoCarrera(c: { nombre: string; imagenUrl?: string | null }): FotoRuta {
  return desdeRuta(c.imagenUrl || `/carreras/${slug(c.nombre)}.webp`);
}

/** Palabra distintiva del nombre de cada universidad => slug de su foto de campus. */
const CAMPUS: Array<[RegExp, string]> = [
  [/nacional/i, 'nacional'],
  [/andes/i, 'andes'],
  [/javeriana/i, 'javeriana'],
  [/antioquia/i, 'antioquia'],
  [/eafit/i, 'eafit'],
  [/valle/i, 'valle'],
  [/norte/i, 'norte'],
  [/rosario/i, 'rosario'],
  [/externado/i, 'externado'],
  [/sabana/i, 'sabana'],
  [/santander/i, 'uis'],
  [/bolivariana/i, 'upb'],
  [/cauca/i, 'cauca'],
  [/pereira/i, 'utp'],
  [/cartagena/i, 'cartagena'],
  [/cooperativa/i, 'ucc'],
  [/icesi/i, 'icesi'],
  [/magdalena/i, 'magdalena'],
  [/caldas/i, 'caldas'],
];

export const slugCampus = (nombre: string): string | undefined => CAMPUS.find(([re]) => re.test(nombre))?.[1];

/** Foto de campus: `imagenUrl` de la API o la ruta derivada del nombre de la universidad. */
export function fotoUniversidad(u: { nombre: string; imagenUrl?: string | null }): FotoRuta {
  if (u.imagenUrl) return /^https?:/i.test(u.imagenUrl) ? { src: u.imagenUrl, sm: u.imagenUrl } : desdeRuta(u.imagenUrl);
  const s = slugCampus(u.nombre) ?? slug(u.nombre);
  return desdeRuta(`/campus/${s}.webp`);
}
