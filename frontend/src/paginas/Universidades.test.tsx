import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router';
import { catalogo } from '@/lib/api';
import Universidades from './Universidades';

vi.mock('@/lib/api', async (orig) => ({
  ...(await orig<typeof import('@/lib/api')>()),
  catalogo: { universidades: vi.fn(), ofertas: vi.fn() },
}));

const unis = [
  { id: 'u1', nombre: 'Universidad de los Andes', ciudad: 'Bogota' },
  { id: 'u2', nombre: 'Universidad EAFIT', ciudad: 'Medellin' },
];

function Ubicacion() {
  return <output data-testid="url">{useLocation().search}</output>;
}

beforeEach(() => {
  vi.mocked(catalogo.universidades).mockImplementation(async (ciudad?: string) => unis.filter((u) => !ciudad || u.ciudad === ciudad));
  vi.mocked(catalogo.ofertas).mockResolvedValue([
    { id: 'o1', universidadId: 'u2', carreraId: 'c1' } as never,
    { id: 'o2', universidadId: 'u2', carreraId: 'c2' } as never,
  ]);
});

describe('Universidades', () => {
  it('filtra por la ciudad de la URL y muestra el conteo de ofertas', async () => {
    render(
      <MemoryRouter initialEntries={['/universidades?ciudad=Medellin']}>
        <Universidades />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { level: 2, name: 'Universidad EAFIT' })).toBeInTheDocument();
    expect(screen.queryByText('Universidad de los Andes')).not.toBeInTheDocument();
    expect(catalogo.universidades).toHaveBeenCalledWith('Medellin');
    expect(screen.getByRole('button', { name: 'Medellín' })).toHaveAttribute('aria-pressed', 'true');
    expect(await screen.findByText('2 ofertas')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('al elegir una ciudad actualiza la URL', async () => {
    render(
      <MemoryRouter initialEntries={['/universidades']}>
        <Universidades />
        <Ubicacion />
      </MemoryRouter>,
    );
    await userEvent.click(await screen.findByRole('button', { name: 'Bogotá' }));
    await waitFor(() => expect(screen.getByTestId('url')).toHaveTextContent('?ciudad=Bogota'));
    expect(await screen.findByText('Universidad de los Andes')).toBeInTheDocument();
  });
});
