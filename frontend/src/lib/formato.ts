import type { Criterio, Jornada, Modalidad } from './modelos';

const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function formatoCop(valor: number): string {
  return COP.format(valor).replace(/[  ]/g, ' ');
}

const MODALIDAD: Record<Modalidad, string> = {
  presencial: 'Presencial',
  virtual: 'Virtual',
  hibrida: 'Híbrida',
};

const JORNADA: Record<Jornada, string> = {
  diurna: 'Diurna',
  nocturna: 'Nocturna',
  mixta: 'Mixta',
};

export const CRITERIO_ETIQUETA: Record<Criterio, string> = {
  costo: 'Costo',
  modalidad: 'Modalidad',
  ubicacion: 'Ubicación',
  acreditacion: 'Acreditación',
};

/** La API guarda las ciudades sin tilde; aquí solo se presentan con su ortografía. */
const CIUDADES: Record<string, string> = {
  Bogota: 'Bogotá',
  Medellin: 'Medellín',
};

export const etiquetaModalidad = (m: string): string => MODALIDAD[m as Modalidad] ?? m;
export const etiquetaJornada = (j: string): string => JORNADA[j as Jornada] ?? j;
export const ciudadLegible = (c: string): string => CIUDADES[c] ?? c;

/** Las semillas guardan algunos nombres sin tilde; solo se presentan con su ortografía. */
const NOMBRES: Record<string, string> = {
  'Ingenieria de Sistemas': 'Ingeniería de Sistemas',
  Psicologia: 'Psicología',
  'Administracion de Empresas': 'Administración de Empresas',
};
export const nombreLegible = (n: string): string => NOMBRES[n] ?? n;

/** Iniciales para avatares y pósters: "Universidad de los Andes" -> "UA". */
export function iniciales(nombre: string): string {
  const palabras = nombre
    .split(/\s+/)
    .filter((p) => p.length > 2 && !/^(de|del|los|las|la|el|y)$/i.test(p));
  const sinUniversidad = palabras.filter((p) => !/^universidad$/i.test(p));
  const base = sinUniversidad.length ? sinUniversidad : palabras;
  return base
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}

/** Puntaje 0-100 sin decimales sobrantes. */
export const formatoPuntaje = (p: number): string => String(Math.round(p));
