import { describe, expect, it } from 'vitest';
import { buscarCiudad, DEPARTAMENTOS, valorCiudad } from './municipios';
import { ciudadLegible } from './formato';

describe('municipios', () => {
  it('trae los 32 departamentos, Bogotá D.C. y todos los municipios', () => {
    expect(DEPARTAMENTOS).toHaveLength(33);
    expect(DEPARTAMENTOS.reduce((n, d) => n + d.municipios.length, 0)).toBe(1122);
    expect(DEPARTAMENTOS.find((d) => d.departamento === 'Antioquia')?.municipios).toContain('Medellín');
  });

  it('guarda el valor sin tildes y conserva la ñ', () => {
    expect(valorCiudad('Bogotá')).toBe('Bogota');
    expect(valorCiudad('Chía')).toBe('Chia');
    expect(valorCiudad('Nariño')).toBe('Nariño');
  });

  it('reconoce las ciudades del catálogo con su departamento', () => {
    for (const c of ['Bogota', 'Medellin', 'Cali', 'Cartagena', 'Barranquilla', 'Chia', 'Popayan', 'Santa Marta', 'Manizales', 'Pereira', 'Bucaramanga']) {
      expect(buscarCiudad(c), c).toBeDefined();
    }
    expect(buscarCiudad('medellin')).toEqual({ nombre: 'Medellín', departamento: 'Antioquia' });
  });

  it('presenta la ciudad con su ortografía y deja igual lo que no reconoce', () => {
    expect(ciudadLegible('Popayan')).toBe('Popayán');
    expect(ciudadLegible('Ciudad Inventada')).toBe('Ciudad Inventada');
  });
});
