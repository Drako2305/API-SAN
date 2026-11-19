import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SesionProvider } from '@/lib/sesion';

const m = vi.hoisted(() => ({ correoDisponible: vi.fn(), registro: vi.fn() }));

vi.mock('@/lib/api', async (orig) => {
  const real = await orig<typeof import('@/lib/api')>();
  return { ...real, auth: { ...real.auth, correoDisponible: m.correoDisponible, registro: m.registro } };
});

import { FormularioRegistro } from './FormularioRegistro';

function Envoltura() {
  const [paso, setPaso] = useState<1 | 2>(1);
  return (
    <SesionProvider>
      <p>Paso {paso}</p>
      <FormularioRegistro paso={paso} onPaso={setPaso} onListo={() => {}} />
    </SesionProvider>
  );
}

const llenarPaso1 = async (u: ReturnType<typeof userEvent.setup>, correo: string) => {
  await u.type(screen.getByLabelText('Correo electrónico'), correo);
  await u.type(screen.getByLabelText(/Clave/), '12345678');
  await u.click(screen.getByRole('button', { name: /Continuar con correo/ }));
};

beforeEach(() => vi.clearAllMocks());

describe('FormularioRegistro', () => {
  it('avisa en el primer paso si el correo ya tiene cuenta', async () => {
    m.correoDisponible.mockResolvedValue({ disponible: false });
    const u = userEvent.setup();
    render(<Envoltura />);
    await llenarPaso1(u, 'nicolas@correo.com');
    expect(await screen.findByText(/Ya existe una cuenta con este correo/)).toBeInTheDocument();
    expect(screen.getByText('Paso 1')).toBeInTheDocument();
    expect(m.correoDisponible).toHaveBeenCalledWith('nicolas@correo.com');
    expect(m.registro).not.toHaveBeenCalled();
  });

  it('pasa a pedir nombre y ciudad cuando el correo está libre', async () => {
    m.correoDisponible.mockResolvedValue({ disponible: true });
    const u = userEvent.setup();
    render(<Envoltura />);
    await llenarPaso1(u, 'nueva@correo.com');
    expect(await screen.findByText('Paso 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
  });
});
