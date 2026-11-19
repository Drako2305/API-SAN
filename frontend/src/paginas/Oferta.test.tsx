import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { ToastProvider } from '@/componentes';
import { ApiError, catalogo } from '@/lib/api';
import { SesionProvider } from '@/lib/sesion';
import Oferta from './Oferta';

vi.mock('@/lib/api', async (orig) => ({
  ...(await orig<typeof import('@/lib/api')>()),
  catalogo: { oferta: vi.fn(), ofertas: vi.fn() },
  usuarios: { favoritos: vi.fn(), agregarFavorito: vi.fn(), quitarFavorito: vi.fn() },
}));

const oferta = {
  id: 'o1', universidadId: 'u1', carreraId: 'c1', universidad: 'Universidad de los Andes', carrera: 'Ingenieria de Sistemas',
  ciudad: 'Bogota', costo: 4500000, modalidad: 'presencial', jornada: 'diurna', duracion: 10, acreditacion: true, snies: '1001',
} as const;

const montar = (id: string) =>
  render(
    <MemoryRouter initialEntries={[`/ofertas/${id}`]}>
      <SesionProvider>
        <ToastProvider>
          <Routes>
            <Route path="ofertas/:id" element={<Oferta />} />
          </Routes>
        </ToastProvider>
      </SesionProvider>
    </MemoryRouter>,
  );

beforeEach(() => {
  sessionStorage.clear();
  vi.mocked(catalogo.ofertas).mockResolvedValue([oferta, { ...oferta, id: 'o2', universidad: 'Universidad EAFIT', ciudad: 'Medellin' }] as never);
});

describe('Oferta', () => {
  it('muestra los datos de la oferta y permite agregarla a comparar', async () => {
    vi.mocked(catalogo.oferta).mockResolvedValue(oferta as never);
    montar('o1');
    expect(await screen.findByRole('heading', { level: 1, name: 'Ingeniería de Sistemas' })).toBeInTheDocument();
    expect(screen.getByText('$ 4.500.000')).toBeInTheDocument();
    expect(screen.getByText('$ 45.000.000')).toBeInTheDocument();
    expect(screen.getByText('Presencial')).toBeInTheDocument();
    expect(screen.getByText('Diurna')).toBeInTheDocument();
    expect(screen.getByText('10 periodos')).toBeInTheDocument();
    expect(screen.getByText('Acreditada')).toBeInTheDocument();
    expect(screen.getByText('1001')).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /Universidad EAFIT/ })).toHaveAttribute('href', '/ofertas/o2');
    expect(screen.getByRole('link', { name: /Ingresa para guardar/ })).toHaveAttribute('href', expect.stringContaining('/ingresar?returnUrl='));

    await userEvent.click(screen.getByRole('button', { name: 'Agregar a comparar' }));
    expect(JSON.parse(sessionStorage.getItem('san.comparar')!).map((o: { id: string }) => o.id)).toEqual(['o1']);
    expect(screen.getByRole('button', { name: 'En tu comparación' })).toBeInTheDocument();
  });

  it('copia el enlace de la oferta y lo confirma con un aviso', async () => {
    vi.mocked(catalogo.oferta).mockResolvedValue(oferta as never);
    const user = userEvent.setup();
    const escribir = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: escribir } });
    montar('o1');
    await screen.findByRole('heading', { level: 1, name: 'Ingeniería de Sistemas' });
    await user.click(screen.getByRole('button', { name: 'Copiar enlace' }));
    expect(escribir).toHaveBeenCalledWith(expect.stringMatching(/\/ofertas\/o1$/));
    expect(await screen.findByText('Enlace copiado.')).toBeInTheDocument();
  });

  it('muestra el estado vacío cuando la API responde 404', async () => {
    vi.mocked(catalogo.oferta).mockRejectedValue(new ApiError(404, 'No encontrado'));
    montar('nada');
    expect(await screen.findByText('No encontramos esa oferta')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });
});
