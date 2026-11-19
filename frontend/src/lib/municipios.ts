import datos from './municipios-colombia.json';

/** Departamento con sus municipios ordenados alfabéticamente (DIVIPOLA del DANE, ver `scripts/generar-municipios.py`). */
export interface Departamento {
  departamento: string;
  municipios: string[];
}

export const DEPARTAMENTOS: Departamento[] = datos;

/**
 * Valor que se guarda en la API: el nombre sin tildes ni diéresis, como las ciudades del catálogo ("Bogota",
 * "Medellin"). La ñ se conserva.
 */
export function valorCiudad(nombre: string): string {
  return nombre.normalize('NFD').replace(/[́̈]/g, '').normalize('NFC');
}

export interface CiudadColombia {
  nombre: string;
  departamento: string;
}

const POR_VALOR = new Map<string, CiudadColombia>();
for (const { departamento, municipios } of DEPARTAMENTOS) {
  for (const nombre of municipios) {
    const clave = valorCiudad(nombre).toLowerCase();
    // Nombres repetidos en varios departamentos (Albania, La Unión): se queda el primero en orden alfabético.
    if (!POR_VALOR.has(clave)) POR_VALOR.set(clave, { nombre, departamento });
  }
}

/** Municipio que corresponde a un valor guardado, sin importar mayúsculas ni tildes. */
export function buscarCiudad(valor: string): CiudadColombia | undefined {
  return POR_VALOR.get(valorCiudad(valor.trim()).toLowerCase());
}
