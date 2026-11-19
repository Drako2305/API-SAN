import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { catalogo } from '@/lib/api';
import Carreras from './Carreras';

vi.mock('@/lib/api', async (orig) => ({
  ...(await orig<typeof import('@/lib/api')>()),
  catalogo: { carreras: vi.fn(), ofertas: vi.fn() },
}));

beforeEach(() => {
  vi.mocked(catalogo.carreras).mockResolvedValue([
    { id: 'c1', nombre: 'Psicologia' },
    { id: 'c2', nombre: 'Derecho' },
  ] as never);
  vi.mocked(catalogo.ofertas).mockResolvedValue([]);
});

const montar = () =>
  render(
    <MemoryRouter initialEntries={['/carreras']}>
      <Carreras />
    </MemoryRouter>,
  );

describe('Carreras', () => {
  it('muestra el número de carreras', async () => {
    montar();
    expect(await screen.findByText('2 carreras')).toBeInTheDocument();
  });

  it('la tecla "/" enfoca el campo de búsqueda y dentro del campo escribe la barra', async () => {
    const user = userEvent.setup();
    montar();
    const campo = await screen.findByRole('searchbox', { name: 'Buscar carrera' });
    expect(campo).not.toHaveFocus();
    await user.keyboard('/');
    expect(campo).toHaveFocus();
    await user.keyboard('/');
    expect(campo).toHaveValue('/');
  });
});
