const CLAVE = 'san.busquedasRecientes';
const MAX = 8;

/** IDs de las últimas búsquedas hechas en este navegador (la API no ofrece un listado por usuario). */
export function busquedasRecientes(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE) ?? '[]');
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function registrarBusquedaReciente(id: string): void {
  try {
    const l = [id, ...busquedasRecientes().filter((x) => x !== id)].slice(0, MAX);
    localStorage.setItem(CLAVE, JSON.stringify(l));
  } catch {
    /* sin almacenamiento */
  }
}
