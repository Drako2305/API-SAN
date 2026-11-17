import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { SesionProvider } from '@/lib/sesion';
import Landing from './Landing';

// GSAP y Three.js se simulan: aquí solo importa el contenido y el flujo del registro.
vi.mock('@/componentes/landing/gsap', () => ({
  gsap: {},
  ScrollTrigger: {},
  SplitText: {},
  useGSAP: () => {},
  SIN_REDUCCION: '',
  ESCRITORIO: '',
}));
vi.mock('@/componentes/landing/escena', () => ({ crearEscena: vi.fn(() => ({ dispose: vi.fn() })) }));
vi.mock('@/lib/api', async (orig) => ({
  ...(await orig<typeof import('@/lib/api')>()),
  catalogo: {
    carreras: vi.fn().mockResolvedValue([{ id: 'c1', nombre: 'Medicina' }]),
    universidades: vi.fn().mockResolvedValue([{ id: 'u1', nombre: 'Universidad EAFIT', ciudad: 'Medellin' }]),
    ofertas: vi.fn().mockResolvedValue([]),
  },
}));

function montar() {
  return render(
    <MemoryRouter>
      <SesionProvider>
        <Landing />
      </SesionProvider>
    </MemoryRouter>,
  );
}

describe('Landing', () => {
  it('muestra un solo h1 y los encabezados de cada sección', async () => {
    montar();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/puntaje que puedes explicar/i);
    expect(screen.getByRole('heading', { level: 2, name: 'Cómo funciona' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Carreras para empezar a explorar' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Encuentra, compara y decide tu carrera.' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 2, name: 'Universidades en el catálogo' })).toBeInTheDocument();
  });

  it('el contenido animado está completo sin GSAP (puntaje final y pasos)', () => {
    montar();
    expect(screen.getByText('Compara con el porqué')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Puntaje 87 de 100/ })).toBeInTheDocument();
  });

  it('"Crear cuenta gratis" abre el diálogo de registro', async () => {
    const user = userEvent.setup();
    montar();
    await user.click(screen.getAllByRole('button', { name: /Crear cuenta gratis/ })[0]!);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
