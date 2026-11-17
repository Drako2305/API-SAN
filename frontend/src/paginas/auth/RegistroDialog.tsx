import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Dialog } from '@/componentes';
import { FormularioRegistro, SUBTITULO_PASO, TITULO_PASO } from './FormularioRegistro';

/** Registro en modal: paso 1 "Continuar con correo", paso 2 "Completa tu perfil". Al terminar va a /inicio. */
export function RegistroDialog({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const [paso, setPaso] = useState<1 | 2>(1);
  const navegar = useNavigate();
  return (
    <Dialog
      abierto={abierto}
      onCerrar={() => {
        setPaso(1);
        onCerrar();
      }}
      titulo={TITULO_PASO[paso]}
      descripcion={SUBTITULO_PASO[paso]}
      // En el paso 2 hay datos sin enviar: solo Esc o el botón cierran.
      cerrarAlClicFuera={paso === 1}
    >
      <FormularioRegistro paso={paso} onPaso={setPaso} onListo={() => navegar('/inicio', { viewTransition: true })} />
    </Dialog>
  );
}
