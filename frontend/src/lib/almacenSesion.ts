import { auth, registrarPuenteSesion } from './api';
import type { AuthData, RegistroRequest, UsuarioSesion } from './modelos';

export const CLAVE_ACCESS = 'san.accessToken';
export const CLAVE_REFRESH = 'san.refreshToken';
export const CLAVE_USUARIO = 'san.usuario';

function leer(clave: string): string | null {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
}

function escribir(clave: string, valor: string): void {
  try {
    localStorage.setItem(clave, valor);
  } catch {
    /* almacenamiento no disponible: la sesión vive solo en memoria */
  }
}

function borrar(clave: string): void {
  try {
    localStorage.removeItem(clave);
  } catch {
    /* almacenamiento no disponible */
  }
}

function usuarioGuardado(): UsuarioSesion | null {
  const crudo = leer(CLAVE_USUARIO);
  if (!crudo || !leer(CLAVE_ACCESS)) return null;
  try {
    return JSON.parse(crudo) as UsuarioSesion;
  } catch {
    return null;
  }
}

/** Respaldo: si la respuesta no trae `usuario`, se lee del payload del JWT. */
function usuarioDesdeToken(token: string): UsuarioSesion {
  try {
    const base = token.split('.')[1]!.replace(/-/g, '+').replace(/_/g, '/');
    const p = JSON.parse(atob(base)) as Record<string, string>;
    return { id: p.sub!, correo: p.correo!, nombre: p.nombre ?? p.correo!, rol: (p.rol as UsuarioSesion['rol']) ?? 'estudiante' };
  } catch {
    throw new Error('La respuesta de autenticación no trae el usuario');
  }
}

type Oyente = () => void;

/**
 * Estado de sesión fuera de React: lo leen el cliente HTTP y los componentes
 * (vía `useSesion`). Los tokens viven en localStorage bajo las claves `san.*`.
 */
export class AlmacenSesion {
  private usuario: UsuarioSesion | null = usuarioGuardado();
  private oyentes = new Set<Oyente>();
  private refrescoEnCurso: Promise<string | null> | null = null;

  constructor() {
    registrarPuenteSesion({
      accessToken: () => this.accessToken(),
      refrescar: () => this.refrescar(),
    });
  }

  suscribir = (o: Oyente): (() => void) => {
    this.oyentes.add(o);
    return () => this.oyentes.delete(o);
  };

  obtenerUsuario = (): UsuarioSesion | null => this.usuario;

  accessToken(): string | null {
    return leer(CLAVE_ACCESS);
  }

  refreshToken(): string | null {
    return leer(CLAVE_REFRESH);
  }

  async login(correo: string, clave: string): Promise<UsuarioSesion> {
    return this.guardar(await auth.login(correo, clave));
  }

  async registro(body: RegistroRequest): Promise<UsuarioSesion> {
    return this.guardar(await auth.registro(body));
  }

  /**
   * Renueva los tokens. Varios 401 simultáneos comparten una sola petición.
   * Si falla, cierra la sesión y devuelve `null`.
   */
  refrescar(): Promise<string | null> {
    if (!this.refrescoEnCurso) {
      const rt = this.refreshToken();
      this.refrescoEnCurso = (async () => {
        if (!rt) {
          this.logout();
          return null;
        }
        try {
          const data = await auth.refresh(rt);
          this.guardar(data);
          return data.accessToken;
        } catch {
          this.logout();
          return null;
        } finally {
          this.refrescoEnCurso = null;
        }
      })();
    }
    return this.refrescoEnCurso;
  }

  logout(): void {
    for (const k of [CLAVE_ACCESS, CLAVE_REFRESH, CLAVE_USUARIO]) borrar(k);
    this.fijar(null);
  }

  /** Refleja en la sesión los cambios de nombre o correo hechos en el perfil. */
  actualizarSesion(cambios: Partial<Pick<UsuarioSesion, 'nombre' | 'correo' | 'avatar'>>): void {
    if (!this.usuario) return;
    const nuevo = { ...this.usuario, ...cambios };
    escribir(CLAVE_USUARIO, JSON.stringify(nuevo));
    this.fijar(nuevo);
  }

  private guardar(data: AuthData): UsuarioSesion {
    const usuario = data.usuario ?? usuarioDesdeToken(data.accessToken);
    escribir(CLAVE_ACCESS, data.accessToken);
    escribir(CLAVE_REFRESH, data.refreshToken);
    escribir(CLAVE_USUARIO, JSON.stringify(usuario));
    this.fijar(usuario);
    return usuario;
  }

  private fijar(u: UsuarioSesion | null): void {
    this.usuario = u;
    this.oyentes.forEach((o) => o());
  }
}

export const almacenSesion = new AlmacenSesion();
