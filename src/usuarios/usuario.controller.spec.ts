import { jest } from '@jest/globals';
import { IDS_SEMILLA } from '../common/semilla';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';

describe('UsuarioController (PATCH)', () => {
  let controller: UsuarioController;
  let servicio: { actualizar: jest.Mock; actualizarPreferencias: jest.Mock };

  beforeEach(() => {
    servicio = {
      actualizar: jest.fn(async () => ({ message: 'ok', data: {} })),
      actualizarPreferencias: jest.fn(async () => ({
        message: 'ok',
        data: {},
      })),
    };
    controller = new UsuarioController(servicio as unknown as UsuarioService);
  });

  it('PATCH /usuarios/:id reutiliza actualizar', async () => {
    const cambios = { nombre: 'Nico' };
    const respuesta = await controller.actualizarParcial(
      IDS_SEMILLA.usuario,
      cambios,
    );
    expect(servicio.actualizar).toHaveBeenCalledWith(
      IDS_SEMILLA.usuario,
      cambios,
    );
    expect(respuesta).toEqual({ message: 'ok', data: {} });
  });

  it('PATCH /usuarios/:id/preferencias reutiliza actualizarPreferencias', async () => {
    const datos = { costo: 5, modalidad: 3, ubicacion: 3, acreditacion: 3 };
    await controller.actualizarPreferenciasParcial(IDS_SEMILLA.usuario, datos);
    expect(servicio.actualizarPreferencias).toHaveBeenCalledWith(
      IDS_SEMILLA.usuario,
      datos,
    );
  });
});
