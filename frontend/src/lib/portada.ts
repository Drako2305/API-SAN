import { etiquetaArea } from './areas';
import { slugCampus } from './fotos';
import type { Carrera, OfertaAcademica, Universidad } from './modelos';

/** Cálculos de la portada. Todo sale de las listas de la API: nada se inventa. */

export interface ResumenArea {
  area: string;
  etiqueta: string;
  carreras: number;
  ofertas: number;
  /** Carrera del área con más ofertas (y foto): su imagen representa el área. */
  representativa: Carrera;
}

const clave = (o: OfertaAcademica) => o.carreraId ?? o.carrera;

export function resumenAreas(carreras: Carrera[], ofertas: OfertaAcademica[]): ResumenArea[] {
  const porCarrera = new Map<string, number>();
  for (const o of ofertas) porCarrera.set(clave(o), (porCarrera.get(clave(o)) ?? 0) + 1);
  const grupos = new Map<string, Carrera[]>();
  for (const c of carreras) if (c.area) grupos.set(c.area, [...(grupos.get(c.area) ?? []), c]);
  const n = (c: Carrera) => porCarrera.get(c.id) ?? porCarrera.get(c.nombre) ?? 0;
  return [...grupos.entries()]
    .map(([area, lista]) => {
      const ordenadas = [...lista].sort((a, b) => n(b) - n(a) || a.nombre.localeCompare(b.nombre, 'es'));
      return {
        area,
        etiqueta: etiquetaArea(area),
        carreras: lista.length,
        ofertas: lista.reduce((s, c) => s + n(c), 0),
        representativa: ordenadas[0]!,
      };
    })
    .sort((a, b) => b.carreras - a.carreras || a.etiqueta.localeCompare(b.etiqueta, 'es'));
}

export interface ResumenUniversidad {
  universidad: Universidad;
  ofertas: number;
  acreditadas: number;
}

/** Las universidades con más ofertas; a igualdad, las que ya tienen foto de campus y luego el orden alfabético. */
export function universidadesDestacadas(universidades: Universidad[], ofertas: OfertaAcademica[], cantidad = 8): ResumenUniversidad[] {
  const conteo = new Map<string, { n: number; acr: number }>();
  for (const o of ofertas) {
    if (!o.universidadId) continue;
    const c = conteo.get(o.universidadId) ?? { n: 0, acr: 0 };
    c.n += 1;
    if (o.acreditacion) c.acr += 1;
    conteo.set(o.universidadId, c);
  }
  return universidades
    .map((universidad) => ({ universidad, ofertas: conteo.get(universidad.id)?.n ?? 0, acreditadas: conteo.get(universidad.id)?.acr ?? 0 }))
    .sort(
      (a, b) =>
        b.ofertas - a.ofertas ||
        Number(!!slugCampus(b.universidad.nombre)) - Number(!!slugCampus(a.universidad.nombre)) ||
        a.universidad.nombre.localeCompare(b.universidad.nombre, 'es'),
    )
    .slice(0, cantidad);
}

const porCosto = (a: OfertaAcademica, b: OfertaAcademica) => a.costo - b.costo || a.carrera.localeCompare(b.carrera, 'es');

export const ofertasEconomicasAcreditadas = (ofertas: OfertaAcademica[], cantidad = 8) =>
  ofertas.filter((o) => o.acreditacion).sort(porCosto).slice(0, cantidad);

export const ofertasVirtuales = (ofertas: OfertaAcademica[], cantidad = 8) =>
  ofertas.filter((o) => o.modalidad === 'virtual').sort(porCosto).slice(0, cantidad);
