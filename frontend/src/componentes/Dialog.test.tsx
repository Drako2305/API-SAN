import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dialog } from './Dialog';

describe('Dialog', () => {
  it('muestra el título como nombre accesible y su contenido', () => {
    render(
      <Dialog abierto onCerrar={() => {}} titulo="Crea tu cuenta" descripcion="Es gratis.">
        <button type="button">Continuar con correo</button>
      </Dialog>,
    );
    expect(screen.getByRole('dialog', { name: 'Crea tu cuenta' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar con correo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
  });

  it('usa showModal() cuando existe y no añade role ni aria-modal manuales', () => {
    const show = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    });
    HTMLDialogElement.prototype.showModal = show;
    render(
      <Dialog abierto onCerrar={() => {}} titulo="Hola">
        x
      </Dialog>,
    );
    expect(show).toHaveBeenCalledTimes(1);
    const d = document.querySelector('dialog')!;
    expect(d).not.toHaveAttribute('role');
    expect(d).not.toHaveAttribute('aria-modal');
    expect(d).toHaveAttribute('closedby', 'any');
  });

  it('permanece cerrado cuando abierto es falso', () => {
    render(
      <Dialog abierto={false} onCerrar={() => {}} titulo="Oculto">
        x
      </Dialog>,
    );
    expect(document.querySelector('dialog')).not.toHaveAttribute('open');
  });
});
