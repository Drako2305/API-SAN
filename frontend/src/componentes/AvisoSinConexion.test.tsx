import { afterEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { AvisoSinConexion } from './AvisoSinConexion';

const fijarConexion = (enLinea: boolean) => {
  Object.defineProperty(navigator, 'onLine', { configurable: true, value: enLinea });
};

afterEach(() => {
  fijarConexion(true);
});

describe('AvisoSinConexion', () => {
  it('aparece al perder la conexión y se quita al recuperarla', () => {
    fijarConexion(true);
    render(<AvisoSinConexion />);
    expect(screen.queryByText('Sin conexión')).not.toBeInTheDocument();

    fijarConexion(false);
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByText('Sin conexión')).toBeInTheDocument();

    fijarConexion(true);
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(screen.queryByText('Sin conexión')).not.toBeInTheDocument();
  });
});
