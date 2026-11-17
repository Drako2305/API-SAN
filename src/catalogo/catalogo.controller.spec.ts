import { jest } from '@jest/globals';
import { IDS_SEMILLA } from '../common/semilla';
import { CatalogoController } from './catalogo.controller';
import { CatalogoService } from './catalogo.service';

describe('CatalogoController (PATCH)', () => {
  let controller: CatalogoController;
  let servicio: {
    actualizarCarrera: jest.Mock;
    actualizarUniversidad: jest.Mock;
    actualizarOferta: jest.Mock;
  };

  beforeEach(() => {
    servicio = {
      actualizarCarrera: jest.fn(async () => ({ message: 'ok', data: {} })),
      actualizarUniversidad: jest.fn(async () => ({ message: 'ok', data: {} })),
      actualizarOferta: jest.fn(async () => ({ message: 'ok', data: {} })),
    };
    controller = new CatalogoController(servicio as unknown as CatalogoService);
  });

  it('PATCH /carreras/:id reutiliza actualizarCarrera', async () => {
    const cambios = { nombre: 'Fisica' };
    const respuesta = await controller.actualizarCarreraParcial(
      IDS_SEMILLA.carreras.sistemas,
      cambios,
    );
    expect(servicio.actualizarCarrera).toHaveBeenCalledWith(
      IDS_SEMILLA.carreras.sistemas,
      cambios,
    );
    expect(respuesta).toEqual({ message: 'ok', data: {} });
  });

  it('PATCH /universidades/:id reutiliza actualizarUniversidad', async () => {
    const cambios = { ciudad: 'Cali' };
    await controller.actualizarUniversidadParcial(
      IDS_SEMILLA.universidades.nacional,
      cambios,
    );
    expect(servicio.actualizarUniversidad).toHaveBeenCalledWith(
      IDS_SEMILLA.universidades.nacional,
      cambios,
    );
  });

  it('PATCH /ofertas/:id reutiliza actualizarOferta', async () => {
    const cambios = { costo: 1000000 };
    await controller.actualizarOfertaParcial(
      IDS_SEMILLA.ofertas.nacionalSistemas,
      cambios,
    );
    expect(servicio.actualizarOferta).toHaveBeenCalledWith(
      IDS_SEMILLA.ofertas.nacionalSistemas,
      cambios,
    );
  });
});
