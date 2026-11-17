import { describe, expect, it } from 'vitest';
import type { Carrera, OfertaAcademica, Universidad } from './modelos';
import { ofertasEconomicasAcreditadas, ofertasVirtuales, resumenAreas, universidadesDestacadas } from './portada';

const of = (id: string, p: Partial<OfertaAcademica>): OfertaAcademica => ({
  id,
  universidad: 'U',
  carrera: 'C',
  ciudad: 'Bogota',
  costo: 1,
  modalidad: 'presencial',
  jornada: 'diurna',
  duracion: 8,
  acreditacion: false,
  snies: id,
  ...p,
});

const carreras: Carrera[] = [
  { id: 'a', nombre: 'Medicina', area: 'Salud' },
  { id: 'b', nombre: 'Enfermeria', area: 'Salud' },
  { id: 'c', nombre: 'Derecho', area: 'Ciencias Sociales' },
  { id: 'd', nombre: 'Sin area' },
];
const unis: Universidad[] = [
  { id: 'u1', nombre: 'Universidad A', ciudad: 'Bogota' },
  { id: 'u2', nombre: 'Universidad B', ciudad: 'Cali' },
];

describe('portada', () => {
  it('resume áreas con conteos y la carrera con más ofertas como representativa', () => {
    const ofertas = [of('1', { carreraId: 'b' }), of('2', { carreraId: 'b' }), of('3', { carreraId: 'a' }), of('4', { carreraId: 'c' })];
    const r = resumenAreas(carreras, ofertas);
    expect(r.map((x) => x.area)).toEqual(['Salud', 'Ciencias Sociales']);
    expect(r[0]).toMatchObject({ carreras: 2, ofertas: 3, etiqueta: 'Salud' });
    expect(r[0]!.representativa.nombre).toBe('Enfermeria');
  });

  it('ordena universidades por ofertas y cuenta las acreditadas', () => {
    const ofertas = [of('1', { universidadId: 'u2', acreditacion: true }), of('2', { universidadId: 'u2' }), of('3', { universidadId: 'u1' })];
    const r = universidadesDestacadas(unis, ofertas, 8);
    expect(r.map((x) => x.universidad.id)).toEqual(['u2', 'u1']);
    expect(r[0]).toMatchObject({ ofertas: 2, acreditadas: 1 });
  });

  it('arma los rieles con las más baratas acreditadas y las virtuales', () => {
    const ofertas = [
      of('1', { costo: 5, acreditacion: true }),
      of('2', { costo: 2, acreditacion: true, modalidad: 'virtual' }),
      of('3', { costo: 1, modalidad: 'virtual' }),
      of('4', { costo: 1 }),
    ];
    expect(ofertasEconomicasAcreditadas(ofertas).map((o) => o.id)).toEqual(['2', '1']);
    expect(ofertasVirtuales(ofertas).map((o) => o.id)).toEqual(['3', '2']);
    expect(ofertasVirtuales(ofertas, 1)).toHaveLength(1);
  });
});
