import { catalogo } from './api';
import { useCarga } from './useCarga';

export interface ConteosCatalogo {
  carreras: number;
  universidades: number;
  ofertas: number;
  ciudades: string[];
}

let cache: { en: number; promesa: Promise<ConteosCatalogo> } | null = null;

async function cargar(): Promise<ConteosCatalogo> {
  const [carreras, universidades, ofertas] = await Promise.all([catalogo.carreras(), catalogo.universidades(), catalogo.ofertas()]);
  return {
    carreras: carreras.length,
    universidades: universidades.length,
    ofertas: ofertas.length,
    ciudades: [...new Set(universidades.map((u) => u.ciudad))].sort(),
  };
}

/** Conteos reales del catálogo derivados de las listas (la API no tiene endpoint de estadísticas). Se reutilizan 60 s. */
export function conteosCatalogo(): Promise<ConteosCatalogo> {
  if (!cache || Date.now() - cache.en > 60_000) {
    const promesa = cargar();
    cache = { en: Date.now(), promesa };
    promesa.catch(() => {
      if (cache?.promesa === promesa) cache = null;
    });
  }
  return cache.promesa;
}

export function useCatalogoConteos() {
  return useCarga<ConteosCatalogo>(() => conteosCatalogo(), []);
}
