import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { almacenSesion, CLAVE_ACCESS, CLAVE_REFRESH, CLAVE_USUARIO } from './almacenSesion';
import { catalogo } from './api';
import { SesionProvider, useSesion } from './sesion';

const usuario = { id: 'u1', nombre: 'Ana', correo: 'ana@correo.com', rol: 'estudiante' as const };
const auth = (a: string, r: string) => ({ message: 'ok', data: { accessToken: a, refreshToken: r, usuario } });
const json = (status: number, cuerpo: unknown) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { 'Content-Type': 'application/json' } });

let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  almacenSesion.logout();
});
afterEach(() => vi.unstubAllGlobals());

const rutas = () => fetchMock.mock.calls.map((c) => new URL(c[0] as string).pathname);
const bearer = (i: number) => (fetchMock.mock.calls[i]![1].headers as Record<string, string>).Authorization;

describe('sesión', () => {
  it('login guarda tokens y usuario en localStorage y agrega el Bearer', async () => {
    fetchMock.mockResolvedValueOnce(json(201, auth('A1', 'R1'))).mockResolvedValueOnce(json(200, []));
    await almacenSesion.login('ana@correo.com', 'clave1234');
    expect(localStorage.getItem(CLAVE_ACCESS)).toBe('A1');
    expect(localStorage.getItem(CLAVE_REFRESH)).toBe('R1');
    expect(JSON.parse(localStorage.getItem(CLAVE_USUARIO)!)).toMatchObject({ correo: 'ana@correo.com' });

    await catalogo.carreras();
    expect(bearer(1)).toBe('Bearer A1');
  });

  it('ante un 401 renueva una vez y reintenta con el token nuevo', async () => {
    fetchMock.mockResolvedValueOnce(json(201, auth('A1', 'R1')));
    await almacenSesion.login('ana@correo.com', 'x');
    fetchMock.mockClear();
    fetchMock
      .mockResolvedValueOnce(json(401, { message: 'Token de acceso invalido o expirado' }))
      .mockResolvedValueOnce(json(201, auth('A2', 'R2')))
      .mockResolvedValueOnce(json(200, [{ id: 'c1', nombre: 'Derecho' }]));

    const r = await catalogo.carreras();
    expect(r).toHaveLength(1);
    expect(rutas()).toEqual(['/carreras', '/auth/refresh', '/carreras']);
    expect(bearer(2)).toBe('Bearer A2');
    expect(localStorage.getItem(CLAVE_ACCESS)).toBe('A2');
  });

  it('varios 401 simultáneos comparten una sola renovación', async () => {
    fetchMock.mockResolvedValueOnce(json(201, auth('A1', 'R1')));
    await almacenSesion.login('ana@correo.com', 'x');
    fetchMock.mockClear();
    fetchMock.mockImplementation(async (u: string, init: RequestInit) => {
      const p = new URL(u).pathname;
      if (p === '/auth/refresh') return json(201, auth('A2', 'R2'));
      const h = init.headers as Record<string, string>;
      return h.Authorization === 'Bearer A2' ? json(200, []) : json(401, { message: 'expirado' });
    });
    await Promise.all([catalogo.carreras(), catalogo.universidades()]);
    expect(rutas().filter((p) => p === '/auth/refresh')).toHaveLength(1);
  });

  it('si la renovación falla cierra la sesión y propaga el 401', async () => {
    fetchMock.mockResolvedValueOnce(json(201, auth('A1', 'R1')));
    await almacenSesion.login('ana@correo.com', 'x');
    fetchMock.mockClear();
    fetchMock
      .mockResolvedValueOnce(json(401, { message: 'expirado' }))
      .mockResolvedValueOnce(json(401, { message: 'Refresh token invalido' }));

    await expect(catalogo.carreras()).rejects.toMatchObject({ status: 401 });
    expect(rutas()).toEqual(['/carreras', '/auth/refresh']);
    expect(localStorage.getItem(CLAVE_ACCESS)).toBeNull();
    expect(almacenSesion.obtenerUsuario()).toBeNull();
  });

  it('SesionProvider expone el usuario y reacciona al logout', async () => {
    fetchMock.mockResolvedValueOnce(json(201, auth('A1', 'R1')));
    function Estado() {
      const s = useSesion();
      return <p>{s.autenticado ? `hola ${s.usuario!.nombre}` : 'anónimo'}</p>;
    }
    render(
      <SesionProvider>
        <Estado />
      </SesionProvider>,
    );
    expect(screen.getByText('anónimo')).toBeInTheDocument();
    await act(() => almacenSesion.login('ana@correo.com', 'x'));
    expect(screen.getByText('hola Ana')).toBeInTheDocument();
    act(() => almacenSesion.logout());
    expect(screen.getByText('anónimo')).toBeInTheDocument();
  });
});
