import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { alternarSeleccion, vaciarSeleccion } from '@/lib/seleccionComparar';
import Comparar from './Comparar';

vi.mock('@/lib/api', async (original) => ({
  ...(await original<typeof import('@/lib/api')>()),
  comparaciones: {
    crear: vi.fn().mockResolvedValue({
      id: 'cmp',
      mejorOfertaId: 'o2',
      tabla: [
        { ofertaId: 'o2', universidad: 'Uni B', costoTotal: 30000000, duracion: 10, modalidad: 'virtual', acreditacion: true, puntaje: 90 },
        { ofertaId: 'o1', universidad: 'Uni A', costoTotal: 40000000, duracion: 10, modalidad: 'presencial', acreditacion: false, puntaje: 20 },
      ],
    }),
  },
}));

const of = (n: number, u: string) => ({ id: `o${n}`, universidad: u, carrera: 'Psicologia', ciudad: 'Bogota' });
const montar = () => render(<MemoryRouter><Comparar /></MemoryRouter>);

beforeEach(() => {
  sessionStorage.clear();
  vaciarSeleccion();
});

describe('Comparar', () => {
  it('sin selección enlaza a /buscar', () => {
    montar();
    expect(screen.getByRole('link', { name: /Buscar una carrera/ })).toHaveAttribute('href', '/buscar');
  });

  it('muestra la tabla con la mejor oferta marcada', async () => {
    alternarSeleccion(of(1, 'Uni A'));
    alternarSeleccion(of(2, 'Uni B'));
    montar();
    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Mejor oferta', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Quitar Uni A de la comparación' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Costo total' })).toBeInTheDocument();
  });
});
