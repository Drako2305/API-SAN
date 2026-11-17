import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { FotoConFallback } from './FotoConFallback';
import { fotoCarrera, fotoUniversidad, slug } from '@/lib/fotos';

describe('FotoConFallback', () => {
  it('renderiza la imagen con srcset, dimensiones y carga diferida', () => {
    render(<FotoConFallback src="/carreras/medicina.webp" sm="/carreras/medicina-sm.webp" sizes="100vw" width={800} height={450} alt="Medicina" />);
    const img = screen.getByAltText('Medicina');
    expect(img).toHaveAttribute('srcset', '/carreras/medicina-sm.webp 800w, /carreras/medicina.webp 1600w');
    expect(img).toHaveAttribute('width', '800');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('si la imagen falla muestra el degradado con el ícono y sin imagen rota', () => {
    const { container } = render(<FotoConFallback src="/x.webp" sm="/x-sm.webp" width={800} height={450} area="Salud" alt="Medicina" />);
    fireEvent.error(screen.getByAltText('Medicina'));
    expect(container.querySelector('img')).toBeNull();
    const fb = container.querySelector('[data-fallback]')!;
    expect(fb).toHaveAttribute('role', 'img');
    expect(fb.querySelector('svg')).toBeInTheDocument();
  });

  it('con ocultarSiFalla no dibuja el respaldo', () => {
    const { container } = render(<FotoConFallback src="/x.webp" width={10} height={10} ocultarSiFalla />);
    fireEvent.error(container.querySelector('img')!);
    expect(container.querySelector('[data-fallback]')).toBeNull();
  });
});

describe('rutas de fotos', () => {
  it('slug quita tildes y usa kebab-case', () => {
    expect(slug('Nutrición y Dietética')).toBe('nutricion-y-dietetica');
    expect(fotoCarrera({ nombre: 'Nutricion y Dietetica' })).toEqual({ src: '/carreras/nutricion-y-dietetica.webp', sm: '/carreras/nutricion-y-dietetica-sm.webp' });
  });
  it('prefiere imagenUrl de la API y deriva la variante -sm', () => {
    expect(fotoCarrera({ nombre: 'X', imagenUrl: '/carreras/otra.webp' }).sm).toBe('/carreras/otra-sm.webp');
  });
  it('campus: nombre a slug de la universidad', () => {
    expect(fotoUniversidad({ nombre: 'Universidad Industrial de Santander' }).src).toBe('/campus/uis.webp');
    expect(fotoUniversidad({ nombre: 'Universidad Javeriana' }).sm).toBe('/campus/javeriana-sm.webp');
  });
});
