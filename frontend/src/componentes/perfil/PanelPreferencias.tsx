import { useState } from 'react';
import { Button, Slider } from '@/componentes';
import { useToast } from '@/componentes/Toast';
import { mensajeError, usuarios } from '@/lib/api';
import { CRITERIO_ETIQUETA } from '@/lib/formato';
import { CRITERIOS, type Criterio, type Pesos } from '@/lib/modelos';

/** Porcentajes enteros que suman 100 (método del mayor resto). Con suma 0, todos en 0. */
export function normalizar(p: Pesos): Pesos {
  const suma = CRITERIOS.reduce((s, c) => s + p[c], 0);
  const cero: Pesos = { costo: 0, modalidad: 0, ubicacion: 0, acreditacion: 0 };
  if (suma === 0) return cero;
  const brutos = CRITERIOS.map((c) => ({ c, v: (p[c] / suma) * 100 }));
  const res = { ...cero };
  let usados = 0;
  for (const b of brutos) {
    res[b.c] = Math.floor(b.v);
    usados += res[b.c];
  }
  [...brutos]
    .sort((a, b) => b.v - Math.floor(b.v) - (a.v - Math.floor(a.v)))
    .slice(0, 100 - usados)
    .forEach((b) => (res[b.c] += 1));
  return res;
}

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
  const pct = normalizar(pesos);
  const suma = CRITERIOS.reduce((s, c) => s + pesos[c], 0);
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
        Cada peso va de 0 a 5. Mientras más alto, más cuenta ese criterio al ordenar tus búsquedas. El porcentaje muestra cuánto pesa
        frente a los demás.
      </p>
      <div className="mt-5 grid gap-5">
        {CRITERIOS.map((c: Criterio) => (
          <div key={c}>
            <Slider etiqueta={CRITERIO_ETIQUETA[c]} valor={pesos[c]} onCambio={(n) => setPesos((p) => ({ ...p, [c]: n }))} />
            <div className="mt-1 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-superficie-3" aria-hidden>
                <div className="h-full rounded-full bg-acento transition-[width] duration-[var(--dur-media)] motion-reduce:transition-none" style={{ width: `${pct[c]}%` }} />
              </div>
              <span className="numeros w-20 text-right text-xs text-texto-2" data-testid={`pct-${c}`}>
                {pct[c]} % del total
              </span>
            </div>
          </div>
        ))}
      </div>
      {suma === 0 && <p className="mt-4 text-sm text-aviso">Con todos los pesos en 0 ningún criterio influye. Sube al menos uno.</p>}
      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-peligro">
          {error}
        </p>
      )}
      <div className="mt-6">
        <Button onClick={guardar} cargando={guardando} disabled={sinCambios}>
          Guardar preferencias
        </Button>
      </div>
    </div>
  );
}
