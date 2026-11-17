import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, catalogo, errorDesdeRespuesta, mensajeError, peticion } from './api';

const respuesta = (status: number, cuerpo: unknown) =>
  new Response(cuerpo === null ? null : JSON.stringify(cuerpo), { status, headers: { 'Content-Type': 'application/json' } });

afterEach(() => vi.unstubAllGlobals());

describe('errorDesdeRespuesta', () => {
  it('usa el message string de Nest', () => {
    const e = errorDesdeRespuesta(404, { statusCode: 404, message: 'Usuario con ID x no existe', error: 'Not Found' });
    expect(e).toBeInstanceOf(ApiError);
    expect(e.status).toBe(404);
    expect(e.message).toBe('Usuario con ID x no existe');
  });

  it('une los mensajes cuando message es un arreglo', () => {
    const e = errorDesdeRespuesta(400, { message: ['correo must be an email', 'clave too short'] });
    expect(e.message).toBe('correo must be an email. clave too short');
    expect(e.detalles).toHaveLength(2);
  });

  it('cae a un mensaje en español por estado', () => {
    expect(errorDesdeRespuesta(403, null).message).toBe('No tienes permiso para hacer esto.');
    expect(errorDesdeRespuesta(500, {}).message).toBe('Algo salió mal. Intenta de nuevo.');
  });

  it('mensajeError respeta el valor por defecto con errores ajenos', () => {
    expect(mensajeError(new Error('x'), 'por defecto')).toBe('por defecto');
  });
});

describe('peticion', () => {
  it('lanza ApiError con el estado y el mensaje de la API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respuesta(409, { message: 'El correo a@b.co ya esta registrado' })));
    await expect(peticion('/auth/registro', { metodo: 'POST', cuerpo: {} })).rejects.toMatchObject({ status: 409, message: 'El correo a@b.co ya esta registrado' });
  });

  it('convierte un fallo de red en ApiError con estado 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));
    await expect(catalogo.carreras()).rejects.toMatchObject({ status: 0 });
  });

  it('PATCH en actualizaciones y desenvuelve { message, data }', async () => {
    const f = vi.fn().mockResolvedValue(respuesta(200, { message: 'ok', data: { id: '1', nombre: 'Derecho' } }));
    vi.stubGlobal('fetch', f);
    const c = await catalogo.actualizarCarrera('1', { nombre: 'Derecho' });
    expect(c).toEqual({ id: '1', nombre: 'Derecho' });
    expect(f.mock.calls[0]![1].method).toBe('PATCH');
  });

  it('omite filtros vacíos de la query', async () => {
    const f = vi.fn().mockResolvedValue(respuesta(200, []));
    vi.stubGlobal('fetch', f);
    await catalogo.ofertas({ ciudad: 'Bogota', carreraId: undefined });
    const u = new URL(f.mock.calls[0]![0] as string);
    expect(u.searchParams.get('ciudad')).toBe('Bogota');
    expect(u.searchParams.has('carreraId')).toBe(false);
  });
});
