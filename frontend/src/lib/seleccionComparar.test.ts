import { beforeEach, describe, expect, it } from 'vitest';
import { alternarSeleccion, leerSeleccion, MAX_COMPARAR, quitarSeleccion, vaciarSeleccion } from './seleccionComparar';

const of = (n: number) => ({ id: `o${n}`, universidad: `U${n}`, carrera: 'Carrera', ciudad: 'Bogota' });

beforeEach(() => {
  sessionStorage.clear();
  vaciarSeleccion();
});

describe('seleccionComparar', () => {
  it('agrega y quita ofertas y persiste en sessionStorage', () => {
    expect(alternarSeleccion(of(1))).toBe(true);
    expect(leerSeleccion().map((o) => o.id)).toEqual(['o1']);
    expect(JSON.parse(sessionStorage.getItem('san.comparar')!)).toHaveLength(1);
    alternarSeleccion(of(1));
    expect(leerSeleccion()).toHaveLength(0);
  });

  it('no permite más de 4 ofertas', () => {
    for (let i = 1; i <= MAX_COMPARAR; i++) expect(alternarSeleccion(of(i))).toBe(true);
    expect(alternarSeleccion(of(5))).toBe(false);
    expect(leerSeleccion()).toHaveLength(4);
    quitarSeleccion('o2');
    expect(alternarSeleccion(of(5))).toBe(true);
  });

  it('tolera sessionStorage con datos corruptos', () => {
    sessionStorage.setItem('san.comparar', '{no es json');
    expect(leerSeleccion()).toEqual([]);
    sessionStorage.setItem('san.comparar', JSON.stringify([of(1), 7, null, of(2), of(3), of(4), of(5)]));
    expect(leerSeleccion()).toHaveLength(4);
  });
});
