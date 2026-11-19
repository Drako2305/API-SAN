import type {
  ActualizarUsuarioRequest,
  AuthData,
  BusquedaCreada,
  BusquedaRequest,
  BusquedaResumen,
  Carrera,
  CarreraForm,
  Comparacion,
  OfertaAcademica,
  OfertaForm,
  Pesos,
  RegistroRequest,
  Respuesta,
  ResultadoBusqueda,
  Universidad,
  UniversidadDetalle,
  UniversidadForm,
  UsuarioDetalle,
} from './modelos';

/** URL base de la API, sin barra final. Sale de `VITE_API_URL` y, si no existe, de `http://localhost:3000`. */
export const API_URL: string = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

// ---------------------------------------------------------------- errores

/** Error de la API: `status` HTTP (0 si no hubo conexión) y mensaje ya en español. */
export class ApiError extends Error {
  readonly status: number;
  /** Mensajes individuales cuando Nest devuelve un arreglo (validación). */
  readonly detalles: string[];

  constructor(status: number, mensaje: string, detalles: string[] = []) {
    super(mensaje);
    this.name = 'ApiError';
    this.status = status;
    this.detalles = detalles;
  }
}

const MENSAJE_POR_ESTADO: Record<number, string> = {
  401: 'Tu sesión expiró. Inicia sesión de nuevo.',
  403: 'No tienes permiso para hacer esto.',
  404: 'No encontramos lo que buscas.',
  409: 'Ese registro ya existe.',
};

/** Convierte el cuerpo de error de Nest `{statusCode,message,error}` en un `ApiError`. */
export function errorDesdeRespuesta(status: number, cuerpo: unknown): ApiError {
  const m = (cuerpo as { message?: unknown } | null)?.message;
  if (Array.isArray(m)) {
    const detalles = m.filter((x): x is string => typeof x === 'string');
    return new ApiError(status, detalles.join('. ') || MENSAJE_POR_ESTADO[status] || 'Revisa los datos e intenta de nuevo.', detalles);
  }
  if (typeof m === 'string' && m) return new ApiError(status, m, [m]);
  return new ApiError(status, MENSAJE_POR_ESTADO[status] ?? 'Algo salió mal. Intenta de nuevo.');
}

/** Error para cuando no hay conexión con la API (`status` 0). */
export const errorDeRed = (): ApiError =>
  new ApiError(0, 'No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.');

/** Texto legible para mostrar en la interfaz a partir de cualquier error. */
export function mensajeError(err: unknown, porDefecto = 'Algo salió mal. Intenta de nuevo.'): string {
  return err instanceof ApiError ? err.message : porDefecto;
}

// ---------------------------------------------------------------- puente de sesión

/** La sesión (sesion.tsx) se registra aquí para que el cliente añada el Bearer y renueve en 401. */
export interface PuenteSesion {
  accessToken(): string | null;
  /** Renueva los tokens; devuelve el nuevo access token o `null` si falló (y cierra sesión). */
  refrescar(): Promise<string | null>;
}

let puente: PuenteSesion | null = null;
export function registrarPuenteSesion(p: PuenteSesion | null): void {
  puente = p;
}

// ---------------------------------------------------------------- núcleo

type Query = Record<string, string | number | undefined | null>;

interface Opciones {
  metodo?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  cuerpo?: unknown;
  query?: Query;
  /** Rutas /auth/*: no llevan Bearer ni reintento. */
  sinAuth?: boolean;
  signal?: AbortSignal;
}

function url(ruta: string, query?: Query): string {
  const u = new URL(`${API_URL}${ruta}`);
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v !== undefined && v !== null && v !== '') u.searchParams.set(k, String(v));
  }
  return u.toString();
}

async function enviar(ruta: string, o: Opciones, token: string | null): Promise<Response> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (o.cuerpo !== undefined) headers['Content-Type'] = 'application/json';
  if (token && !o.sinAuth) headers.Authorization = `Bearer ${token}`;
  try {
    return await fetch(url(ruta, o.query), {
      method: o.metodo ?? 'GET',
      headers,
      body: o.cuerpo !== undefined ? JSON.stringify(o.cuerpo) : undefined,
      signal: o.signal,
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e;
    throw errorDeRed();
  }
}

async function leerCuerpo(res: Response): Promise<unknown> {
  const texto = await res.text();
  if (!texto) return null;
  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
}

/** Petición cruda: devuelve el JSON tal cual, con Bearer y un único reintento tras renovar en 401. */
export async function peticion<T>(ruta: string, o: Opciones = {}): Promise<T> {
  let res = await enviar(ruta, o, puente?.accessToken() ?? null);

  if (res.status === 401 && !o.sinAuth && puente?.accessToken()) {
    const nuevo = await puente.refrescar();
    if (nuevo) res = await enviar(ruta, o, nuevo);
  }

  const cuerpo = await leerCuerpo(res);
  if (!res.ok) throw errorDesdeRespuesta(res.status, cuerpo);
  return cuerpo as T;
}

/** Petición cuyo resultado viene como `{ message, data }`: devuelve `data`. */
async function envuelta<T>(ruta: string, o: Opciones = {}): Promise<T> {
  return (await peticion<Respuesta<T>>(ruta, o)).data;
}

// ---------------------------------------------------------------- auth

/** Endpoints de autenticación. Son públicos (`sinAuth`): no envían el Bearer. */
export const auth = {
  /** Si el correo aún no tiene cuenta. Se consulta en el primer paso del registro. */
  correoDisponible: (correo: string) =>
    envuelta<{ disponible: boolean }>('/auth/correo-disponible', { metodo: 'POST', cuerpo: { correo }, sinAuth: true }),
  login: (correo: string, clave: string) =>
    envuelta<AuthData>('/auth/login', { metodo: 'POST', cuerpo: { correo, clave }, sinAuth: true }),
  registro: (body: RegistroRequest) =>
    envuelta<AuthData>('/auth/registro', { metodo: 'POST', cuerpo: body, sinAuth: true }),
  refresh: (refreshToken: string) =>
    envuelta<AuthData>('/auth/refresh', { metodo: 'POST', cuerpo: { refreshToken }, sinAuth: true }),
};

// ---------------------------------------------------------------- catálogo

/** Filtros opcionales del listado de carreras (`/carreras`), enviados como query string. */
export interface FiltrosCarreras {
  nombre?: string;
  area?: string;
}

/** Filtros opcionales del listado de ofertas (`/ofertas`), enviados como query string. */
export interface FiltrosOfertas {
  carreraId?: string;
  universidadId?: string;
  ciudad?: string;
}

/**
 * Catálogo de carreras, universidades y ofertas. Las lecturas públicas devuelven el recurso directo;
 * las escrituras de administración devuelven `{ message, data }` y las ediciones usan PATCH.
 */
export const catalogo = {
  // Lecturas públicas: recurso directo
  carreras: (filtros: FiltrosCarreras = {}) => peticion<Carrera[]>('/carreras', { query: { ...filtros } }),
  carrera: (id: string) => peticion<Carrera>(`/carreras/${id}`),
  universidades: (ciudad?: string) => peticion<Universidad[]>('/universidades', { query: { ciudad } }),
  universidad: (id: string) => peticion<UniversidadDetalle>(`/universidades/${id}`),
  ofertas: (filtros: FiltrosOfertas = {}) => peticion<OfertaAcademica[]>('/ofertas', { query: { ...filtros } }),
  oferta: (id: string) => peticion<OfertaAcademica>(`/ofertas/${id}`),

  // Escrituras de admin: `{ message, data }`. La edición usa PATCH (parcial).
  crearCarrera: (body: CarreraForm) => envuelta<Carrera>('/carreras', { metodo: 'POST', cuerpo: body }),
  actualizarCarrera: (id: string, body: Partial<CarreraForm>) =>
    envuelta<Carrera>(`/carreras/${id}`, { metodo: 'PATCH', cuerpo: body }),
  eliminarCarrera: (id: string) => peticion<Pick<Respuesta<unknown>, 'message'>>(`/carreras/${id}`, { metodo: 'DELETE' }),

  crearUniversidad: (body: UniversidadForm) => envuelta<Universidad>('/universidades', { metodo: 'POST', cuerpo: body }),
  actualizarUniversidad: (id: string, body: Partial<UniversidadForm>) =>
    envuelta<Universidad>(`/universidades/${id}`, { metodo: 'PATCH', cuerpo: body }),
  eliminarUniversidad: (id: string) =>
    peticion<Pick<Respuesta<unknown>, 'message'>>(`/universidades/${id}`, { metodo: 'DELETE' }),

  crearOferta: (body: OfertaForm) => envuelta<OfertaAcademica>('/ofertas', { metodo: 'POST', cuerpo: body }),
  actualizarOferta: (id: string, body: Partial<OfertaForm>) =>
    envuelta<OfertaAcademica>(`/ofertas/${id}`, { metodo: 'PATCH', cuerpo: body }),
  eliminarOferta: (id: string) => peticion<Pick<Respuesta<unknown>, 'message'>>(`/ofertas/${id}`, { metodo: 'DELETE' }),
};

// ---------------------------------------------------------------- búsquedas y comparaciones

/** Búsquedas de ofertas: crear una, leer su resumen y sus resultados ordenados. */
export const busquedas = {
  crear: (body: BusquedaRequest) => envuelta<BusquedaCreada>('/busquedas', { metodo: 'POST', cuerpo: body }),
  resumen: (id: string) => peticion<BusquedaResumen>(`/busquedas/${id}`),
  resultados: (id: string) => peticion<ResultadoBusqueda[]>(`/busquedas/${id}/resultados`),
};

/** Comparaciones de ofertas (de 2 a 4): crear, consultar y eliminar. */
export const comparaciones = {
  crear: (ofertaIds: string[]) => envuelta<Comparacion>('/comparaciones', { metodo: 'POST', cuerpo: { ofertaIds } }),
  obtener: (id: string) => peticion<Comparacion>(`/comparaciones/${id}`),
  eliminar: (id: string) => peticion<Pick<Respuesta<unknown>, 'message'>>(`/comparaciones/${id}`, { metodo: 'DELETE' }),
};

// ---------------------------------------------------------------- usuarios (Bearer propio o admin)

/** Perfil, preferencias (pesos) y favoritos de un usuario. Requiere Bearer propio o rol admin. */
export const usuarios = {
  obtener: (id: string) => envuelta<UsuarioDetalle>(`/usuarios/${id}`),
  actualizar: (id: string, body: ActualizarUsuarioRequest) =>
    envuelta<UsuarioDetalle>(`/usuarios/${id}`, { metodo: 'PATCH', cuerpo: body }),
  preferencias: (id: string) => peticion<Pesos>(`/usuarios/${id}/preferencias`),
  actualizarPreferencias: (id: string, body: Pesos) =>
    envuelta<Pesos>(`/usuarios/${id}/preferencias`, { metodo: 'PATCH', cuerpo: body }),
  favoritos: (id: string) => peticion<string[]>(`/usuarios/${id}/favoritos`),
  agregarFavorito: (id: string, ofertaId: string) =>
    envuelta<string[]>(`/usuarios/${id}/favoritos`, { metodo: 'POST', cuerpo: { ofertaId } }),
  quitarFavorito: (id: string, ofertaId: string) =>
    envuelta<string[]>(`/usuarios/${id}/favoritos/${ofertaId}`, { metodo: 'DELETE' }),
};

/** Cliente agrupado para importar como `api.catalogo.carreras()`. */
export const api = { auth, catalogo, busquedas, comparaciones, usuarios };
