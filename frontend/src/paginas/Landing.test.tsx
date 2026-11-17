import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { SesionProvider } from '@/lib/sesion';
import Landing from './Landing';

// GSAP y Three.js se simulan: aquí solo importa el contenido y el flujo del registro.
vi.mock('@/componentes/landing/gsap', () => ({
  gsap: {},
  ScrollTrigger: {},
  SplitText: {},
  useGSAP: () => {},
  useRevelado: () => {},
  SIN_REDUCCION: '',
  ESCRITORIO: '',
}));
vi.mock('@/componentes/landing/escena', () => ({ crearEscena: vi.fn(() => ({ dispose: vi.fn() })) }));
const OFERTAS = vi.hoisted(() => [
  { id: 'o1', universidadId: 'u1', carreraId: 'c1', universidad: 'Universidad EAFIT', carrera: 'Medicina', ciudad: 'Medellin', costo: 9_000_000, modalidad: 'presencial', jornada: 'diurna', duracion: 12, acreditacion: true, snies: '1' },
  { id: 'o2', universidadId: 'u1', carreraId: 'c2', universidad: 'Universidad EAFIT', carrera: 'Derecho', ciudad: 'Medellin', costo: 3_000_000, modalidad: 'virtual', jornada: 'nocturna', duracion: 10, acreditacion: false, snies: '2' },
]);
vi.mock('@/lib/api', async (orig) => ({
  ...(await orig<typeof import('@/lib/api')>()),
  catalogo: {
    carreras: vi.fn().mockResolvedValue([
      { id: 'c1', nombre: 'Medicina', area: 'Salud' },
      { id: 'c2', nombre: 'Derecho', area: 'Ciencias Sociales' },
    ]),
    universidades: vi.fn().mockResolvedValue([{ id: 'u1', nombre: 'Universidad EAFIT', ciudad: 'Medellin' }]),
    ofertas: vi.fn().mockResolvedValue(OFERTAS),
  },
}));

function Ubicacion() {
  const { pathname, search } = useLocation();
  return <p data-testid="ubicacion">{pathname + search}</p>;
}

function montar() {
  return render(
    <MemoryRouter>
      <SesionProvider>
        <Routes>
          <Route index element={<Landing />} />
          <Route path="*" element={<Ubicacion />} />
        </Routes>
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
    for (const nombre of ['Explora por área', 'Ofertas destacadas', 'Preguntas frecuentes']) {
      expect(screen.getByRole('heading', { level: 2, name: nombre })).toBeInTheDocument();
    }
  });

  it('arma áreas, universidades y rieles solo con datos de la API', async () => {
    montar();
    expect(await screen.findByRole('link', { name: /Salud/ })).toHaveAttribute('href', '/carreras?area=Salud');
    expect(screen.getByRole('link', { name: /Universidad EAFIT.*2 ofertas/s })).toHaveAttribute('href', '/universidades/u1');
    const acreditadas = screen.getByRole('group', { name: 'Más económicas acreditadas' });
    expect(within(acreditadas).getByRole('link', { name: /Medicina/ })).toHaveAttribute('href', '/ofertas/o1');
    expect(within(acreditadas).queryByRole('link', { name: /Derecho/ })).not.toBeInTheDocument();
    expect(within(screen.getByRole('group', { name: 'Virtuales' })).getByRole('link', { name: /Derecho/ })).toHaveAttribute('href', '/ofertas/o2');
  });

  it('el buscador del hero lleva a /buscar con carrera y ciudad', async () => {
    const user = userEvent.setup();
    montar();
    await user.type(screen.getByRole('combobox', { name: '¿Qué quieres estudiar?' }), 'Medicina');
    await user.selectOptions(await screen.findByRole('combobox', { name: 'Ciudad' }), 'Medellin');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByTestId('ubicacion')).toHaveTextContent('/buscar?carrera=Medicina&ciudad=Medellin');
  });

  it('las preguntas frecuentes son details nativos', () => {
    montar();
    expect(document.querySelectorAll('details.faq-item')).toHaveLength(5);
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
