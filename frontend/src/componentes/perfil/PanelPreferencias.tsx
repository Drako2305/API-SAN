import { useState } from 'react';
import { AvisoError, Button, EditorPesos } from '@/componentes';
import { useToast } from '@/componentes/Toast';
import { mensajeError, usuarios } from '@/lib/api';
import { CRITERIOS, type Pesos } from '@/lib/modelos';

export { normalizar } from '@/lib/pesos';

interface Props {
  usuarioId: string;
  inicial: Pesos;
  onGuardado: (p: Pesos) => void;
}

export function PanelPreferencias({ usuarioId, inicial, onGuardado }: Props) {
  const toast = useToast();
  const [pesos, setPesos] = useState<Pesos>(inicial);
  const [guardado, setGuardado] = useState<Pesos>(inicial);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sinCambios = CRITERIOS.every((c) => pesos[c] === guardado[c]);

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      const nuevo = await usuarios.actualizarPreferencias(usuarioId, pesos);
      const final = { ...pesos, ...nuevo };
      setGuardado(final);
      setPesos(final);
      onGuardado(final);
      toast.ok('Guardamos tus preferencias.');
    } catch (e) {
      setError(mensajeError(e, 'No pudimos guardar tus preferencias.'));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <p className="text-sm text-texto-2">
        Son los pesos con los que parten tus búsquedas. De 0 (no cuenta) a 5 (lo más importante); abajo ves cuánto pesa cada criterio
        frente a los demás.
      </p>
      <EditorPesos className="mt-5" valor={pesos} onCambio={setPesos} />
      {error && (
        <AvisoError className="mt-4">{error}</AvisoError>
      )}
      <div className="mt-6">
        <Button onClick={guardar} cargando={guardando} disabled={sinCambios}>
          Guardar preferencias
        </Button>
      </div>
    </div>
  );
}
