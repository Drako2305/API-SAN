import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { ToastProvider } from '@/componentes';
import { ApiError } from '@/lib/api';

const m = vi.hoisted(() => ({
  carreras: vi.fn(),
  actualizarCarrera: vi.fn(),
  eliminarCarrera: vi.fn(),
  crearCarrera: vi.fn(),
}));

vi.mock('@/lib/api', async (orig) => ({
  ...(await orig<typeof import('@/lib/api')>()),
  catalogo: {
    carreras: m.carreras,
    actualizarCarrera: m.actualizarCarrera,
    eliminarCarrera: m.eliminarCarrera,
    crearCarrera: m.crearCarrera,
    universidades: vi.fn().mockResolvedValue([]),
    ofertas: vi.fn().mockResolvedValue([]),
  },
}));

import Admin from '@/paginas/Admin';

beforeEach(() => {
  vi.clearAllMocks();
  m.carreras.mockResolvedValue([{ id: 'c1', nombre: 'Derecho' }]);
  m.actualizarCarrera.mockResolvedValue({ id: 'c1', nombre: 'Derecho Penal' });
  m.eliminarCarrera.mockResolvedValue({ message: 'ok' });
});

const montar = () =>
  render(
    <MemoryRouter>
      <ToastProvider>
        <Admin />
      </ToastProvider>
    </MemoryRouter>,
  );

describe('Admin', () => {
  it('editar envía un PATCH solo con los campos que cambiaron', async () => {
    const u = userEvent.setup();
    montar();
    await u.click(await screen.findByRole('button', { name: 'Editar carrera Derecho' }));
    const dlg = screen.getByRole('dialog', { name: /Editar carrera/ });
    const campo = within(dlg).getByLabelText('Nombre');
    expect(campo).toHaveValue('Derecho');
    await u.clear(campo);
    await u.type(campo, 'Derecho Penal');
    await u.click(within(dlg).getByRole('button', { name: 'Guardar cambios' }));
    expect(m.actualizarCarrera).toHaveBeenCalledWith('c1', { nombre: 'Derecho Penal' });
  });

  it('muestra el error 409 dentro del formulario', async () => {
    const u = userEvent.setup();
    m.crearCarrera.mockRejectedValue(new ApiError(409, 'Ese registro ya existe.'));
    montar();
    await u.click(await screen.findByRole('button', { name: 'Nueva carrera' }));
    const dlg = screen.getByRole('dialog', { name: 'Nueva carrera' });
    await u.type(within(dlg).getByLabelText('Nombre'), 'Derecho');
    await u.click(within(dlg).getByRole('button', { name: 'Crear' }));
    expect(await within(dlg).findByRole('alert')).toHaveTextContent('Ese registro ya existe.');
  });

  it('eliminar pide confirmación antes de llamar a DELETE', async () => {
    const u = userEvent.setup();
    montar();
    await u.click(await screen.findByRole('button', { name: 'Eliminar carrera Derecho' }));
    expect(m.eliminarCarrera).not.toHaveBeenCalled();
    const dlg = screen.getByRole('dialog', { name: 'Eliminar carrera' });
    expect(dlg).toHaveTextContent('Derecho');
    await u.click(within(dlg).getByRole('button', { name: 'Eliminar' }));
    expect(m.eliminarCarrera).toHaveBeenCalledWith('c1');
  });
});
