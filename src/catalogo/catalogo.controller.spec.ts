import 'reflect-metadata';
import { jest } from '@jest/globals';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { IDS_SEMILLA } from '../common/semilla';
import { FiltroOfertaDto } from './catalogo.dto';
import { CatalogoController } from './catalogo.controller';
import { CatalogoService } from './catalogo.service';

const propiedadesInvalidasFiltroOferta = async (datos: object) =>
  (await validate(plainToInstance(FiltroOfertaDto, datos))).map(
    (error) => error.property,
  );

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

describe('FiltroOfertaDto', () => {
  it('acepta una modalidad permitida', async () => {
    expect(
      await propiedadesInvalidasFiltroOferta({ modalidad: 'presencial' }),
    ).toEqual([]);
  });

  it('rechaza una modalidad fuera de la lista', async () => {
    expect(
      await propiedadesInvalidasFiltroOferta({ modalidad: 'online' }),
    ).toEqual(['modalidad']);
  });

  it('acepta una jornada permitida y rechaza otra', async () => {
    expect(
      await propiedadesInvalidasFiltroOferta({ jornada: 'mixta' }),
    ).toEqual([]);
    expect(
      await propiedadesInvalidasFiltroOferta({ jornada: 'madrugada' }),
    ).toEqual(['jornada']);
  });
});
