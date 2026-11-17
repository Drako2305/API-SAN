// Modelos espejo de los DTOs de la API SAN (src/**/*.dto.ts).

export const MODALIDADES = ['presencial', 'virtual', 'hibrida'] as const;
export const JORNADAS = ['diurna', 'nocturna', 'mixta'] as const;
export type Modalidad = (typeof MODALIDADES)[number];
export type Jornada = (typeof JORNADAS)[number];
export type Rol = 'estudiante' | 'admin';

/** Respuesta envuelta que usan varios endpoints: `{ message, data }`. */
export interface Respuesta<T> {
  message: string;
  data: T;
}

export interface Carrera {
  id: string;
  nombre: string;
  /** Ruta relativa de la foto (`/carreras/<slug>.webp`), resuelta contra el origen del frontend. */
  imagenUrl?: string | null;
  area?: string | null;
}

export interface Universidad {
  id: string;
  nombre: string;
  ciudad: string;
  imagenUrl?: string | null;
}

export interface OfertaAcademica {
  id: string;
  universidad: string;
  carrera: string;
  universidadId?: string;
  carreraId?: string;
  imagenUrl?: string | null;
  carreraImagenUrl?: string | null;
  ciudad: string;
  costo: number;
  modalidad: Modalidad;
  jornada: Jornada;
  duracion: number;
  acreditacion: boolean;
  snies: string;
}

export interface UniversidadDetalle extends Universidad {
  ofertas: OfertaAcademica[];
}

/** PreferenciaDto: pesos enteros de 0 a 5 por criterio. */
export interface Pesos {
  costo: number;
  modalidad: number;
  ubicacion: number;
  acreditacion: number;
}

export type Criterio = keyof Pesos;
export const CRITERIOS: Criterio[] = ['costo', 'modalidad', 'ubicacion', 'acreditacion'];

export interface BusquedaRequest {
  carrera: string;
  ciudad?: string;
  costoMax?: number;
  modalidad?: Modalidad;
  jornada?: Jornada;
  pesos?: Pesos;
  usuarioId?: string;
}

export interface ResultadoBusqueda {
  oferta: OfertaAcademica;
  puntaje: number;
  /** Valor 0-1 por criterio. */
  desglose: Pesos;
}

export interface BusquedaCreada {
  id: string;
  total: number;
  resultados: ResultadoBusqueda[];
}

export interface BusquedaResumen {
  id: string;
  filtros: Omit<BusquedaRequest, 'usuarioId'>;
  total: number;
  fecha: string;
}

export interface FilaComparacion {
  ofertaId: string;
  universidad: string;
  costoTotal: number;
  duracion: number;
  modalidad: Modalidad;
  acreditacion: boolean;
  puntaje: number;
}

export interface Comparacion {
  id: string;
  tabla: FilaComparacion[];
  mejorOfertaId: string;
}

export interface UsuarioSesion {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  /** Foto del perfil (enlace o data URL). `undefined` = aún no se ha consultado; `null` = no tiene. */
  avatar?: string | null;
}

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  usuario: UsuarioSesion;
}

export interface Perfil {
  id?: string;
  apellido: string;
  ciudad: string;
  avatar?: string | null;
}

export interface UsuarioDetalle {
  id: string;
  nombre: string;
  correo: string;
  rol?: Rol;
  preferencias: Pesos;
  perfil: Perfil | null;
}

export interface RegistroRequest {
  nombre: string;
  correo: string;
  clave: string;
  perfil: { apellido: string; ciudad: string; avatar?: string | null };
}

export interface ActualizarUsuarioRequest {
  nombre?: string;
  correo?: string;
  clave?: string;
  perfil?: Partial<Perfil>;
}

export interface CarreraForm {
  nombre: string;
}

export interface UniversidadForm {
  nombre: string;
  ciudad: string;
  imagenUrl?: string;
}

export interface OfertaForm {
  snies: string;
  ciudad: string;
  costo: number;
  modalidad: Modalidad;
  jornada: Jornada;
  duracion: number;
  acreditacion: boolean;
  universidadId: string;
  carreraId: string;
}
