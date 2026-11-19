import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTituloPagina } from './useTituloPagina';

describe('useTituloPagina', () => {
  it('fija el título con el sufijo SAN y lo actualiza al cambiar', () => {
    const { rerender } = renderHook(({ t }) => useTituloPagina(t), { initialProps: { t: 'Carreras' } });
    expect(document.title).toBe('Carreras · SAN');
    rerender({ t: 'Universidades' });
    expect(document.title).toBe('Universidades · SAN');
  });
});
