import { catalogo } from './api';
import type { Carrera, OfertaAcademica, Universidad } from './modelos';
import { useCarga } from './useCarga';

export interface ConteosCatalogo {
  carreras: number;
  universidades: number;
  ofertas: number;
  ciudades: string[];
}

export interface CatalogoCompleto {
  carreras: Carrera[];
  universidades: Universidad[];
  ofertas: OfertaAcademica[];
}

let cache: { en: number; promesa: Promise<CatalogoCompleto> } | null = null;

/** Las tres listas públicas del catálogo, pedidas una sola vez y reutilizadas 60 s por toda la portada. */
export function catalogoCompleto(): Promise<CatalogoCompleto> {
  if (!cache || Date.now() - cache.en > 60_000) {
    const promesa = Promise.all([catalogo.carreras(), catalogo.universidades(), catalogo.ofertas()]).then(
      ([carreras, universidades, ofertas]) => ({ carreras, universidades, ofertas }),
    );
    cache = { en: Date.now(), promesa };
    promesa.catch(() => {
      if (cache?.promesa === promesa) cache = null;
    });
  }
  return cache.promesa;
}

/** Conteos reales del catálogo derivados de las listas (la API no tiene endpoint de estadísticas). */
export async function conteosCatalogo(): Promise<ConteosCatalogo> {
  const { carreras, universidades, ofertas } = await catalogoCompleto();
  return {
    carreras: carreras.length,
    universidades: universidades.length,
    ofertas: ofertas.length,
    ciudades: [...new Set(universidades.map((u) => u.ciudad))].sort(),
  };
}

export function useCatalogoConteos() {
  return useCarga<ConteosCatalogo>(() => conteosCatalogo(), []);
}

export function useCatalogoCompleto() {
  return useCarga<CatalogoCompleto>(() => catalogoCompleto(), []);
}
