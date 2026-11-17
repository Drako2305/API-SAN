import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { SesionProvider } from '@/lib/sesion';
import { TemaProvider } from '@/lib/tema';
import type { AlmacenSesion } from '@/lib/almacenSesion';
import { NavSuperior } from './NavSuperior';

const almacen = (rol: 'estudiante' | 'admin') => {
  const usuario = { id: 'u1', nombre: 'Ana', correo: 'ana@correo.com', rol };
  return {
    suscribir: () => () => {},
    obtenerUsuario: () => usuario,
    actualizarSesion: vi.fn(),
    logout: vi.fn(),
  } as unknown as AlmacenSesion;
};

const mockAncho = (ancho: boolean) =>
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (q: string) =>
      ({ matches: q.includes('min-width: 768px') ? ancho : false, media: q, addEventListener: () => {}, removeEventListener: () => {} }) as unknown as MediaQueryList,
  );

const montar = (url = '/carreras', rol: 'estudiante' | 'admin' = 'estudiante') =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <SesionProvider almacen={almacen(rol)}>
        <TemaProvider>
          <NavSuperior />
        </TemaProvider>
      </SesionProvider>
    </MemoryRouter>,
  );

afterEach(() => vi.restoreAllMocks());

describe('NavSuperior', () => {
  it('en pantalla ancha lista los destinos con texto y marca la página actual', () => {
    mockAncho(true);
    montar('/carreras');
    const nav = screen.getByRole('navigation', { name: 'Principal' });
    for (const etiqueta of ['Inicio', 'Buscar', 'Catálogo', 'Comparar', 'Favoritos', 'Perfil']) {
      expect(within(nav).getByRole('link', { name: etiqueta })).toBeInTheDocument();
    }
    expect(within(nav).queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Catálogo' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'Inicio' })).not.toHaveAttribute('aria-current');
    expect(nav.querySelector('ul')).not.toHaveAttribute('popover');
    expect(screen.getByRole('searchbox', { name: 'Buscar una carrera' })).toBeInTheDocument();
  });

  it('muestra Admin solo a administradores', () => {
    mockAncho(true);
    montar('/admin', 'admin');
    expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute('aria-current', 'page');
  });

  it('en móvil el botón de menú controla un popover con la lista completa y sincroniza aria-expanded', () => {
    mockAncho(false);
    montar('/inicio');
    const boton = screen.getByRole('button', { name: 'Menú' });
    const lista = document.getElementById(boton.getAttribute('aria-controls')!)!;
    expect(boton).toHaveAttribute('popovertarget', lista.id);
    expect(lista).toHaveAttribute('popover', 'auto');
    expect(Array.from(lista.querySelectorAll('a'), (a) => a.textContent)).toEqual(['Inicio', 'Buscar', 'Catálogo', 'Comparar', 'Favoritos', 'Perfil']);
    expect(boton).toHaveAttribute('aria-expanded', 'false');

    // El navegador emite `toggle` al abrir y cerrar el popover (Esc, clic fuera o el propio botón).
    fireEvent(lista, Object.assign(new Event('toggle'), { newState: 'open' }));
    expect(boton).toHaveAttribute('aria-expanded', 'true');
    fireEvent(lista, Object.assign(new Event('toggle'), { newState: 'closed' }));
    expect(boton).toHaveAttribute('aria-expanded', 'false');
  });
});
