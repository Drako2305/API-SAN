import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { ToastProvider } from '@/componentes';
import { SesionProvider } from '@/lib/sesion';
import { leerSeleccion, vaciarSeleccion } from '@/lib/seleccionComparar';
import Busqueda from './Busqueda';

const oferta = (n: number) => ({
  id: `o${n}`,
  universidad: `Universidad ${n}`,
  carrera: 'Ingenieria de Sistemas',
  ciudad: 'Bogota',
  costo: 4000000,
  modalidad: 'presencial' as const,
  jornada: 'diurna' as const,
  duracion: 10,
  acreditacion: n % 2 === 0,
  snies: `100${n}`,
});

vi.mock('@/lib/api', async (original) => ({
  ...(await original<typeof import('@/lib/api')>()),
  busquedas: {
    resumen: vi.fn().mockResolvedValue({ id: 'b1', total: 5, fecha: '2026-01-01', filtros: { carrera: 'Ingenieria de Sistemas', ciudad: 'Bogota' } }),
    resultados: vi.fn().mockImplementation(async () =>
      [1, 2, 3, 4, 5].map((n) => ({
        oferta: oferta(n),
        puntaje: 90 - n,
        desglose: { costo: 0.8, modalidad: 1, ubicacion: 0.5, acreditacion: n % 2 === 0 ? 1 : 0 },
      })),
    ),
  },
  usuarios: { favoritos: vi.fn() },
}));

function montar() {
  return render(
    <SesionProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={['/busquedas/b1']}>
          <Routes>
            <Route path="/busquedas/:id" element={<Busqueda />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </SesionProvider>,
  );
}

beforeEach(() => {
  sessionStorage.clear();
  vaciarSeleccion();
});

describe('Busqueda', () => {
  it('muestra cada resultado con su puntaje y el desglose por criterio', async () => {
    montar();
    const filas = await screen.findAllByRole('listitem').then((l) => l.filter((li) => li.querySelector('h3')));
    expect(filas).toHaveLength(5);
    const desgloses = screen.getAllByRole('list', { name: 'Desglose del puntaje por criterio' });
    expect(desgloses).toHaveLength(5);
    expect(within(desgloses[0]!).getByText('Costo')).toBeInTheDocument();
    expect(within(desgloses[0]!).getByText('80%')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Puntaje 89 de 100' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Editar búsqueda' })).toHaveAttribute('href', expect.stringContaining('carrera=Ingenieria'));
  });

  it('sin sesión el favorito lleva a ingresar con returnUrl', async () => {
    montar();
    const enlaces = await screen.findAllByRole('link', { name: /Inicia sesión para guardar/ });
    expect(enlaces[0]).toHaveAttribute('href', expect.stringContaining('/ingresar?returnUrl=%2Fbusquedas%2Fb1'));
  });

  it('permite elegir hasta 4 ofertas y muestra la barra Comparar (n)', async () => {
    const u = userEvent.setup();
    montar();
    const casillas = await screen.findAllByRole('checkbox');
    for (const c of casillas.slice(0, 4)) await u.click(c);
    expect(leerSeleccion()).toHaveLength(4);
    expect(screen.getByRole('link', { name: /Comparar \(4\)/ })).toHaveAttribute('href', '/comparar');
    expect(casillas[4]).toBeDisabled();
  });
});
