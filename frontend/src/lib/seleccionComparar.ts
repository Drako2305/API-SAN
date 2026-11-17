import { useSyncExternalStore } from 'react';
import type { OfertaAcademica } from './modelos';

export const MAX_COMPARAR = 4;
export const MIN_COMPARAR = 2;
const CLAVE = 'san.comparar';

export type OfertaSeleccionada = Pick<OfertaAcademica, 'id' | 'universidad' | 'carrera' | 'ciudad'> & {
  imagenUrl?: string | null;
};

const VACIA: OfertaSeleccionada[] = [];
let memoria: OfertaSeleccionada[] = VACIA;
let crudoVisto: string | null | undefined;
let cache: OfertaSeleccionada[] = VACIA;
const oyentes = new Set<() => void>();

function leerCrudo(): string | null {
  try {
    return sessionStorage.getItem(CLAVE);
  } catch {
    return null;
  }
}

function analizar(crudo: string): OfertaSeleccionada[] {
  try {
    const v: unknown = JSON.parse(crudo);
    if (!Array.isArray(v)) return VACIA;
    const lista = v.filter(
      (x): x is OfertaSeleccionada => typeof x === 'object' && x !== null && typeof (x as { id?: unknown }).id === 'string',
    );
    return lista.slice(0, MAX_COMPARAR);
  } catch {
    return VACIA;
  }
}

/** Selección actual (referencia estable mientras no cambie). Si no hay sessionStorage, vive en memoria. */
export function leerSeleccion(): OfertaSeleccionada[] {
  const crudo = leerCrudo();
  if (crudo === null) return memoria;
  if (crudo !== crudoVisto) {
    crudoVisto = crudo;
    cache = analizar(crudo);
  }
  return cache;
}

function guardar(lista: OfertaSeleccionada[]): void {
  memoria = lista;
  try {
    if (lista.length === 0) sessionStorage.removeItem(CLAVE);
    else sessionStorage.setItem(CLAVE, JSON.stringify(lista));
  } catch {
    /* sin almacenamiento: la selección vive en memoria */
  }
  oyentes.forEach((o) => o());
}

export const estaSeleccionada = (id: string): boolean => leerSeleccion().some((o) => o.id === id);

/** Agrega o quita la oferta. Devuelve false si no se pudo agregar porque ya hay 4. */
export function alternarSeleccion(oferta: OfertaSeleccionada): boolean {
  const actual = leerSeleccion();
  if (actual.some((o) => o.id === oferta.id)) {
    guardar(actual.filter((o) => o.id !== oferta.id));
    return true;
  }
  if (actual.length >= MAX_COMPARAR) return false;
  const { id, universidad, carrera, ciudad, imagenUrl } = oferta;
  guardar([...actual, { id, universidad, carrera, ciudad, imagenUrl }]);
  return true;
}

export function quitarSeleccion(id: string): void {
  guardar(leerSeleccion().filter((o) => o.id !== id));
}

/** Reemplaza la selección por estas ofertas (hasta 4). */
export function reemplazarSeleccion(ofertas: OfertaSeleccionada[]): void {
  const vistas = new Set<string>();
  const lista = ofertas
    .filter((o) => !vistas.has(o.id) && vistas.add(o.id))
    .slice(0, MAX_COMPARAR)
    .map(({ id, universidad, carrera, ciudad, imagenUrl }) => ({ id, universidad, carrera, ciudad, imagenUrl }));
  guardar(lista);
}

export function vaciarSeleccion(): void {
  guardar([]);
}

function suscribir(cb: () => void): () => void {
  oyentes.add(cb);
  return () => oyentes.delete(cb);
}

/** Selección reactiva para componentes. */
export function useSeleccion() {
  const ofertas = useSyncExternalStore(suscribir, leerSeleccion, () => VACIA);
  return {
    ofertas,
    total: ofertas.length,
    llena: ofertas.length >= MAX_COMPARAR,
    lista: ofertas.length >= MIN_COMPARAR,
    alternar: alternarSeleccion,
    quitar: quitarSeleccion,
    vaciar: vaciarSeleccion,
  };
}
