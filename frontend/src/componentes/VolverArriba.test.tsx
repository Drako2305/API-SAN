import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VolverArriba } from './VolverArriba';

const desplazar = (y: number) => {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y });
  act(() => {
    window.dispatchEvent(new Event('scroll'));
  });
};

afterEach(() => {
  desplazar(0);
  vi.restoreAllMocks();
});

describe('VolverArriba', () => {
  it('aparece tras un desplazamiento largo y sube al inicio llevando el foco al contenido', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(
      <>
        <main id="contenido" tabIndex={-1} />
        <VolverArriba />
      </>,
    );
    expect(screen.queryByRole('button', { name: 'Volver arriba' })).not.toBeInTheDocument();

    desplazar(1200);
    const boton = screen.getByRole('button', { name: 'Volver arriba' });
    await userEvent.click(boton);

    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
    expect(document.activeElement).toBe(document.getElementById('contenido'));
  });
});
