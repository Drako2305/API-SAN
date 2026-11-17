import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { AlertCircle, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Button, Dialog, EmptyState, Input } from '@/componentes';
import { useToast } from '@/componentes/Toast';
import { ApiError, mensajeError } from '@/lib/api';
import { useCarga } from '@/lib/useCarga';
import { MorphingBars } from '@/morphing';

export type Valores = Record<string, string | boolean>;

export interface Columna<T> {
  etiqueta: string;
  celda(item: T): ReactNode;
}

export interface ConfigCrud<T extends { id: string }, V extends Valores> {
  singular: string;
  plural: string;
  /** Para concordar "Nueva carrera" / "Nuevo universidad". */
  femenino: boolean;
  columnas: Columna<T>[];
  cargar(): Promise<T[]>;
  textoBusqueda(item: T): string;
  nombreItem(item: T): string;
  vacio: V;
  desde(item: T): V;
  /** Convierte los valores del formulario al cuerpo de la API (omite lo vacío opcional). */
  aCuerpo(v: V): Record<string, unknown>;
  campos(v: V, cambiar: <K extends keyof V>(k: K, valor: V[K]) => void): ReactNode;
  crear(cuerpo: Record<string, unknown>): Promise<unknown>;
  actualizar(id: string, cambios: Record<string, unknown>): Promise<unknown>;
  eliminar(id: string): Promise<unknown>;
  avisoEliminar?: string;
  /** Datos auxiliares aún cargando (p. ej. selects de la oferta). */
  bloqueado?: boolean;
}

/** Solo las claves cuyo valor difiere del original (para el PATCH). */
export function soloCambios(nuevo: Record<string, unknown>, original: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(nuevo).filter(([k, v]) => JSON.stringify(v) !== JSON.stringify(original[k])));
}

interface ErrorForm {
  mensaje: string;
  detalles: string[];
}
const aErrorForm = (e: unknown, defecto: string): ErrorForm => ({
  mensaje: mensajeError(e, defecto),
  detalles: e instanceof ApiError && e.status === 400 ? e.detalles : [],
});

function AlertaError({ error }: { error: ErrorForm }) {
  return (
    <div role="alert" className="flex items-start gap-2 rounded-md bg-peligro-suave p-3 text-sm text-peligro">
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div>
        <p className="font-medium">{error.mensaje}</p>
        {error.detalles.length > 1 && (
          <ul className="mt-1 list-disc pl-4">
            {error.detalles.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function FormularioItem<T extends { id: string }, V extends Valores>({
  config,
  item,
  onListo,
  onCancelar,
}: {
  config: ConfigCrud<T, V>;
  item: T | null;
  onListo: () => void;
  onCancelar: () => void;
}) {
  const toast = useToast();
  const original = item ? config.desde(item) : config.vacio;
  const [v, setV] = useState<V>(original);
  const [error, setError] = useState<ErrorForm | null>(null);
  const [enviando, setEnviando] = useState(false);

  const cambiar = <K extends keyof V>(k: K, valor: V[K]) => setV((x) => ({ ...x, [k]: valor }));

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const cuerpo = config.aCuerpo(v);
    let cambios = cuerpo;
    if (item) {
      cambios = soloCambios(cuerpo, config.aCuerpo(original));
      if (Object.keys(cambios).length === 0) {
        toast.mostrar('No hay cambios para guardar.');
        onCancelar();
        return;
      }
    }
    setEnviando(true);
    try {
      if (item) await config.actualizar(item.id, cambios);
      else await config.crear(cuerpo);
      toast.ok(item ? 'Guardamos los cambios.' : `${config.femenino ? 'Creada' : 'Creado'} ${config.singular}.`);
      onListo();
    } catch (err) {
      setError(aErrorForm(err, 'No pudimos guardar. Intenta de nuevo.'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="grid gap-4">
      {error && <AlertaError error={error} />}
      {config.campos(v, cambiar)}
      <div className="mt-2 flex justify-end gap-2">
        <Button variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" cargando={enviando}>
          {item ? 'Guardar cambios' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}

function ConfirmarEliminar<T extends { id: string }, V extends Valores>({
  config,
  item,
  onListo,
  onCancelar,
}: {
  config: ConfigCrud<T, V>;
  item: T;
  onListo: () => void;
  onCancelar: () => void;
}) {
  const toast = useToast();
  const [error, setError] = useState<ErrorForm | null>(null);
  const [enviando, setEnviando] = useState(false);

  const confirmar = async () => {
    setEnviando(true);
    setError(null);
    try {
      await config.eliminar(item.id);
      toast.ok(`${config.femenino ? 'Eliminada' : 'Eliminado'} ${config.singular}.`);
      onListo();
    } catch (err) {
      setError(aErrorForm(err, 'No pudimos eliminar. Intenta de nuevo.'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="grid gap-4">
      {error && <AlertaError error={error} />}
      <p className="text-sm text-texto-2">
        Vas a eliminar <strong className="text-texto">{config.nombreItem(item)}</strong>. {config.avisoEliminar} Esta acción no se puede deshacer.
      </p>
      <div className="flex justify-end gap-2">
        <Button variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button variante="peligro" cargando={enviando} onClick={() => void confirmar()}>
          Eliminar
        </Button>
      </div>
    </div>
  );
}

/** Tabla de administración con búsqueda, y diálogos de crear, editar y eliminar. */
export function SeccionCrud<T extends { id: string }, V extends Valores>({ config }: { config: ConfigCrud<T, V> }) {
  const { datos, cargando, error, recargar } = useCarga(() => config.cargar(), []);
  const [filtro, setFiltro] = useState('');
  const [editando, setEditando] = useState<T | 'nuevo' | null>(null);
  const [eliminando, setEliminando] = useState<T | null>(null);

  const visibles = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    return (datos ?? []).filter((i) => !q || config.textoBusqueda(i).toLowerCase().includes(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datos, filtro]);

  const nuevo = `${config.femenino ? 'Nueva' : 'Nuevo'} ${config.singular}`;

  return (
    <section aria-label={config.plural}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute bottom-3 left-3 size-4 text-texto-3" aria-hidden />
          <Input etiqueta={`Buscar ${config.plural}`} type="search" value={filtro} onChange={(e) => setFiltro(e.target.value)} className="[&_input]:pl-9" />
        </div>
        <Button icono={<Plus className="size-4" aria-hidden />} onClick={() => setEditando('nuevo')} disabled={config.bloqueado}>
          {nuevo}
        </Button>
      </div>

      {cargando ? (
        <div className="flex items-center justify-center gap-3 rounded-lg border border-borde bg-superficie py-14 text-texto-2" aria-busy>
          <MorphingBars altura={24} color="var(--color-acento)" etiqueta={`Cargando ${config.plural}`} />
        </div>
      ) : error ? (
        <EmptyState
          titulo={`No pudimos cargar ${config.plural}`}
          texto={error}
          accion={
            <Button variante="secundario" onClick={recargar}>
              Reintentar
            </Button>
          }
        />
      ) : visibles.length === 0 ? (
        <EmptyState
          titulo={filtro ? 'Nada coincide con tu búsqueda' : `Aún no hay ${config.plural}`}
          texto={filtro ? 'Prueba con otra palabra.' : `Crea ${config.femenino ? 'la primera' : 'el primero'} con el botón de arriba.`}
        />
      ) : (
        <div role="region" aria-label={`Tabla de ${config.plural}`} tabIndex={0} className="overflow-x-auto rounded-lg border border-borde bg-superficie max-md:border-0 max-md:bg-transparent">
          <table className="w-full text-left text-sm max-md:block">
            <caption className="sr-only">
              {config.plural}: {visibles.length}
            </caption>
            <thead className="bg-superficie-2 text-xs text-texto-2 max-md:sr-only">
              <tr>
                {config.columnas.map((c) => (
                  <th key={c.etiqueta} scope="col" className="px-4 py-2.5 font-medium">
                    {c.etiqueta}
                  </th>
                ))}
                <th scope="col" className="px-4 py-2.5 text-right font-medium">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borde max-md:block max-md:divide-y-0">
              {visibles.map((i) => (
                <tr key={i.id} className="max-md:mb-3 max-md:block max-md:rounded-lg max-md:border max-md:border-borde max-md:bg-superficie max-md:p-4">
                  {config.columnas.map((c, n) => (
                    <td
                      key={c.etiqueta}
                      data-etiqueta={c.etiqueta}
                      className={
                        'px-4 py-3 align-middle max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-4 max-md:px-0 max-md:py-1.5 ' +
                        "max-md:before:shrink-0 max-md:before:text-xs max-md:before:text-texto-3 max-md:before:content-[attr(data-etiqueta)] " +
                        (n === 0 ? 'font-medium' : '')
                      }
                    >
                      {c.celda(i)}
                    </td>
                  ))}
                  <td className="px-4 py-2 max-md:flex max-md:justify-end max-md:px-0 max-md:pt-3">
                    <div className="flex justify-end gap-1">
                      <Button variante="fantasma" tamano="sm" icono={<Pencil className="size-3.5" aria-hidden />} aria-label={`Editar ${config.singular} ${config.nombreItem(i)}`} onClick={() => setEditando(i)}>
                        Editar
                      </Button>
                      <Button variante="fantasma" tamano="sm" className="text-peligro hover:text-peligro" icono={<Trash2 className="size-3.5" aria-hidden />} aria-label={`Eliminar ${config.singular} ${config.nombreItem(i)}`} onClick={() => setEliminando(i)}>
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        abierto={editando !== null}
        onCerrar={() => setEditando(null)}
        titulo={editando === 'nuevo' ? nuevo : `Editar ${config.singular}`}
        cerrarAlClicFuera={false}
      >
        {editando !== null && (
          <FormularioItem
            config={config}
            item={editando === 'nuevo' ? null : editando}
            onCancelar={() => setEditando(null)}
            onListo={() => {
              setEditando(null);
              recargar();
            }}
          />
        )}
      </Dialog>

      <Dialog abierto={eliminando !== null} onCerrar={() => setEliminando(null)} titulo={`Eliminar ${config.singular}`}>
        {eliminando && (
          <ConfirmarEliminar
            config={config}
            item={eliminando}
            onCancelar={() => setEliminando(null)}
            onListo={() => {
              setEliminando(null);
              recargar();
            }}
          />
        )}
      </Dialog>
    </section>
  );
}
