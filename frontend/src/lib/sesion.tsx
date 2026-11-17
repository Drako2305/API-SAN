import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { almacenSesion, type AlmacenSesion } from './almacenSesion';
import type { RegistroRequest, UsuarioSesion } from './modelos';

export interface ValorSesion {
  usuario: UsuarioSesion | null;
  autenticado: boolean;
  esAdmin: boolean;
  login(correo: string, clave: string): Promise<UsuarioSesion>;
  registro(body: RegistroRequest): Promise<UsuarioSesion>;
  logout(): void;
  actualizarSesion: AlmacenSesion['actualizarSesion'];
}

const Contexto = createContext<ValorSesion | null>(null);

/** Provee la sesión (tokens en localStorage `san.*`, Bearer automático y renovación en 401). */
export function SesionProvider({ children, almacen = almacenSesion }: { children: ReactNode; almacen?: AlmacenSesion }) {
  const usuario = useSyncExternalStore(almacen.suscribir, almacen.obtenerUsuario, almacen.obtenerUsuario);

  const valor = useMemo<ValorSesion>(
    () => ({
      usuario,
      autenticado: usuario !== null,
      esAdmin: usuario?.rol === 'admin',
      login: (c, k) => almacen.login(c, k),
      registro: (b) => almacen.registro(b),
      logout: () => almacen.logout(),
      actualizarSesion: (c) => almacen.actualizarSesion(c),
    }),
    [usuario, almacen],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSesion(): ValorSesion {
  const v = useContext(Contexto);
  if (!v) throw new Error('useSesion debe usarse dentro de <SesionProvider>');
  return v;
}
