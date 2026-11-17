import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { ToastProvider } from '@/componentes';
import { SesionProvider } from '@/lib/sesion';
import Buscar from './Buscar';

vi.mock('@/lib/api', async (original) => ({
  ...(await original<typeof import('@/lib/api')>()),
  catalogo: {
    carreras: vi.fn().mockResolvedValue([{ id: 'c1', nombre: 'Ingenieria de Sistemas' }]),
    universidades: vi.fn().mockResolvedValue([
      { id: 'u1', nombre: 'Uni A', ciudad: 'Bogota' },
      { id: 'u2', nombre: 'Uni B', ciudad: 'Cali' },
    ]),
  },
  busquedas: { crear: vi.fn().mockResolvedValue({ id: 'b1', total: 0, resultados: [] }) },
  usuarios: { preferencias: vi.fn() },
}));

import { busquedas } from '@/lib/api';

function montar() {
  return render(
    <SesionProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/buscar']}>
          <Routes>
            <Route path="/buscar" element={<Buscar />} />
            <Route path="/busquedas/:id" element={<p>Pantalla de resultados</p>} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </SesionProvider>,
  );
}

beforeEach(() => vi.mocked(busquedas.crear).mockClear());

describe('Buscar', () => {
  it('envía los filtros y los pesos, guarda la búsqueda reciente y navega a los resultados', async () => {
    const u = userEvent.setup();
    montar();
    await u.type(screen.getByLabelText('Carrera'), 'Ingenieria de Sistemas');
    await u.selectOptions(await screen.findByLabelText('Ciudad'), 'Cali');
    await u.type(screen.getByLabelText(/Costo máximo/), '5000000');
    await u.selectOptions(screen.getByRole('combobox', { name: 'Modalidad' }), 'virtual');
    await u.click(screen.getByRole('button', { name: /Buscar ofertas/ }));

    await screen.findByText('Pantalla de resultados');
    expect(busquedas.crear).toHaveBeenCalledWith({
      carrera: 'Ingenieria de Sistemas',
      ciudad: 'Cali',
      costoMax: 5000000,
      modalidad: 'virtual',
      pesos: { costo: 3, modalidad: 3, ubicacion: 3, acreditacion: 3 },
    });
    expect(JSON.parse(localStorage.getItem('san.busquedasRecientes')!)).toEqual(['b1']);
  });

  it('no envía sin carrera', async () => {
    const u = userEvent.setup();
    montar();
    await u.click(screen.getByRole('button', { name: /Buscar ofertas/ }));
    await waitFor(() => expect(busquedas.crear).not.toHaveBeenCalled());
  });
});
