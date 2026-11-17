import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ToastProvider } from '@/componentes';
import { SesionProvider } from '@/lib/sesion';
import type { AlmacenSesion } from '@/lib/almacenSesion';

vi.mock('@/lib/api', async (orig) => ({
  ...(await orig<typeof import('@/lib/api')>()),
  usuarios: {
    obtener: vi.fn().mockResolvedValue({
      id: 'u1',
      nombre: 'Ana',
      correo: 'ana@correo.com',
      preferencias: { costo: 3, modalidad: 3, ubicacion: 3, acreditacion: 3 },
      perfil: { apellido: 'Pérez', ciudad: 'Bogota', avatar: null },
    }),
    favoritos: vi.fn().mockResolvedValue(['o1']),
    quitarFavorito: vi.fn(),
  },
  catalogo: {
    oferta: vi.fn().mockResolvedValue({
      id: 'o1', universidad: 'Universidad X', carrera: 'Psicologia', ciudad: 'Bogota', costo: 1000000,
      modalidad: 'presencial', jornada: 'diurna', duracion: 8, acreditacion: true, snies: '1',
    }),
  },
  busquedas: { resumen: vi.fn() },
}));

import Perfil from './Perfil';

const actualizarSesion = vi.fn();
const usuarioDePrueba = { id: 'u1', nombre: 'Ana', correo: 'ana@correo.com', rol: 'estudiante' as const };
const almacenFalso = {
  suscribir: () => () => {},
  obtenerUsuario: () => usuarioDePrueba,
  actualizarSesion,
  logout: vi.fn(),
} as unknown as AlmacenSesion;

const montar = (url: string) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <SesionProvider almacen={almacenFalso}>
        <ToastProvider>
          <Perfil />
        </ToastProvider>
      </SesionProvider>
    </MemoryRouter>,
  );

describe('Perfil', () => {
  it('abre la pestaña Favoritos con ?pestana=favoritos', async () => {
    montar('/perfil?pestana=favoritos');
    expect(screen.getByRole('tab', { name: 'Favoritos', selected: true })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /Psicología|Psicologia/ })).toHaveAttribute('href', '/ofertas/o1');
    expect(screen.getByRole('button', { name: /Quitar Psicología de Universidad X de favoritos/ })).toBeInTheDocument();
  });

  it('abre Datos por defecto', async () => {
    montar('/perfil');
    expect(screen.getByRole('tab', { name: 'Datos', selected: true })).toBeInTheDocument();
    expect(await screen.findByLabelText('Apellido')).toHaveValue('Pérez');
  });
});
