import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Search } from 'lucide-react';
import { Button, EncabezadoPagina, Input, Select, Slider } from '@/componentes';
import { busquedas, catalogo, mensajeError, usuarios } from '@/lib/api';
import { CRITERIO_ETIQUETA, ciudadLegible, etiquetaJornada, etiquetaModalidad, nombreLegible } from '@/lib/formato';
import { CRITERIOS, JORNADAS, MODALIDADES, type BusquedaRequest, type Criterio, type Jornada, type Modalidad, type Pesos } from '@/lib/modelos';
import { registrarBusquedaReciente } from '@/lib/recientes';
import { useSesion } from '@/lib/sesion';
import { useCarga } from '@/lib/useCarga';
import { TextMorph, MorphLoader } from '@/morphing';

const PESOS_INICIALES: Pesos = { costo: 3, modalidad: 3, ubicacion: 3, acreditacion: 3 };

const AYUDA_CRITERIO: Record<Criterio, string> = {
  costo: 'Suma más cuanto más barata sea la oferta.',
  modalidad: 'Suma si coincide con la modalidad que elegiste.',
  ubicacion: 'Suma si está en la ciudad que elegiste.',
  acreditacion: 'Suma si el programa está acreditado.',
};

/** Pesos desde `?pesos=c,m,u,a` (lo usa "Editar búsqueda"). */
function pesosDesdeTexto(t: string | null): Pesos | null {
  const n = t?.split(',').map(Number);
  if (!n || n.length !== 4 || n.some((x) => !Number.isInteger(x) || x < 0 || x > 5)) return null;
  return { costo: n[0]!, modalidad: n[1]!, ubicacion: n[2]!, acreditacion: n[3]! };
}

const esModalidad = (v: string | null): v is Modalidad => MODALIDADES.some((m) => m === v);
const esJornada = (v: string | null): v is Jornada => JORNADAS.some((j) => j === v);

export default function Buscar() {
  const [params] = useSearchParams();
  const navegar = useNavigate();
  const { usuario, autenticado } = useSesion();

  const carreras = useCarga(() => catalogo.carreras(), []);
  const universidades = useCarga(() => catalogo.universidades(), []);
  const preferencias = useCarga(() => (usuario ? usuarios.preferencias(usuario.id) : Promise.resolve(null)), [usuario?.id]);

  const pesosUrl = pesosDesdeTexto(params.get('pesos'));
  const [carrera, setCarrera] = useState(params.get('carrera') ?? '');
  const [ciudad, setCiudad] = useState(params.get('ciudad') ?? '');
  const [costoMax, setCostoMax] = useState(params.get('costoMax') ?? '');
  const [modalidad, setModalidad] = useState(esModalidad(params.get('modalidad')) ? params.get('modalidad')! : '');
  const [jornada, setJornada] = useState(esJornada(params.get('jornada')) ? params.get('jornada')! : '');
  const [pesos, setPesos] = useState<Pesos>(pesosUrl ?? PESOS_INICIALES);
  const [desdePerfil, setDesdePerfil] = useState(false);
  const tocoPesos = useRef(pesosUrl !== null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Precarga los pesos guardados en el perfil, salvo que la persona ya los haya movido.
  useEffect(() => {
    if (preferencias.datos && !tocoPesos.current) {
      setPesos(preferencias.datos);
      setDesdePerfil(true);
    }
  }, [preferencias.datos]);

  const ciudades = useMemo(
    () => [...new Set((universidades.datos ?? []).map((u) => u.ciudad))].sort((a, b) => a.localeCompare(b, 'es')),
    [universidades.datos],
  );

  const cambiarPeso = (c: Criterio, v: number) => {
    tocoPesos.current = true;
    setDesdePerfil(false);
    setPesos((p) => ({ ...p, [c]: v }));
  };

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    const nombre = carrera.trim();
    if (!nombre || enviando) return;
    const maximo = Number(costoMax);
    const cuerpo: BusquedaRequest = {
      carrera: nombre,
      pesos,
      ...(ciudad ? { ciudad } : {}),
      ...(costoMax !== '' && maximo > 0 ? { costoMax: Math.round(maximo) } : {}),
      ...(modalidad ? { modalidad: modalidad as Modalidad } : {}),
      ...(jornada ? { jornada: jornada as Jornada } : {}),
      ...(usuario ? { usuarioId: usuario.id } : {}),
    };
    setEnviando(true);
    setError(null);
    try {
      const r = await busquedas.crear(cuerpo);
      registrarBusquedaReciente(r.id);
      navegar(`/busquedas/${r.id}`, { state: { pesos }, viewTransition: true });
    } catch (err) {
      setError(mensajeError(err, 'No pudimos hacer la búsqueda. Intenta de nuevo.'));
      setEnviando(false);
    }
  };

  return (
    <>
      <title>Buscar carrera · SAN</title>
      <EncabezadoPagina
        titulo="Buscar carrera"
        descripcion="Cuéntanos qué quieres estudiar y qué pesa más para ti. Ordenamos las ofertas con tus pesos y te mostramos por qué."
      />

      <form onSubmit={enviar} aria-busy={enviando} className="grid gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <fieldset disabled={enviando} className="flex min-w-0 flex-col gap-4 rounded-lg border border-borde bg-superficie p-5">
          <legend className="float-left mb-1 w-full font-display text-lg font-semibold">Qué buscas</legend>
          <Input
            etiqueta="Carrera"
            name="carrera"
            list="lista-carreras"
            required
            autoComplete="off"
            placeholder="Ej. Ingeniería de Sistemas"
            value={carrera}
            onChange={(e) => setCarrera(e.target.value)}
          />
          <datalist id="lista-carreras">
            {carreras.datos?.map((c) => (
              <option key={c.id} value={c.nombre} label={nombreLegible(c.nombre)} />
            ))}
          </datalist>
          <Select etiqueta="Ciudad" name="ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value)}>
            <option value="">Cualquier ciudad</option>
            {ciudades.map((c) => (
              <option key={c} value={c}>
                {ciudadLegible(c)}
              </option>
            ))}
          </Select>
          <Input
            etiqueta="Costo máximo por periodo (COP)"
            name="costoMax"
            type="number"
            inputMode="numeric"
            min={0}
            step={100000}
            placeholder="Sin límite"
            value={costoMax}
            onChange={(e) => setCostoMax(e.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select etiqueta="Modalidad" name="modalidad" value={modalidad} onChange={(e) => setModalidad(e.target.value)}>
              <option value="">Cualquiera</option>
              {MODALIDADES.map((m) => (
                <option key={m} value={m}>
                  {etiquetaModalidad(m)}
                </option>
              ))}
            </Select>
            <Select etiqueta="Jornada" name="jornada" value={jornada} onChange={(e) => setJornada(e.target.value)}>
              <option value="">Cualquiera</option>
              {JORNADAS.map((j) => (
                <option key={j} value={j}>
                  {etiquetaJornada(j)}
                </option>
              ))}
            </Select>
          </div>
        </fieldset>

        <div className="flex min-w-0 flex-col gap-6">
          <fieldset disabled={enviando} className="flex flex-col gap-5 rounded-lg border border-borde bg-superficie p-5">
            <legend className="float-left mb-1 w-full font-display text-lg font-semibold">Qué pesa más para ti</legend>
            <p className="-mt-1 text-sm text-texto-2">
              De 0 (no cuenta) a 5 (lo más importante). {desdePerfil ? 'Partimos de las preferencias guardadas en tu perfil.' : !autenticado ? 'Inicia sesión para partir de tus preferencias guardadas.' : ''}
            </p>
            {CRITERIOS.map((c) => (
              <div key={c}>
                <Slider
                  etiqueta={CRITERIO_ETIQUETA[c]}
                  valor={pesos[c]}
                  onCambio={(v) => cambiarPeso(c, v)}
                  formatoValor={(v) => (v === 0 ? 'No cuenta' : `${v} de 5`)}
                  aria-valuetext={pesos[c] === 0 ? 'No cuenta' : `${pesos[c]} de 5`}
                />
                <p className="mt-0.5 text-xs text-texto-3">{AYUDA_CRITERIO[c]}</p>
              </div>
            ))}
          </fieldset>

          {error && (
            <p role="alert" className="rounded-md bg-peligro-suave px-3 py-2 text-sm font-medium text-peligro">
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" tamano="lg" disabled={enviando} icono={<Search className="size-5" aria-hidden />}>
              Buscar ofertas
            </Button>
            {enviando && (
              <div className="flex items-center gap-3 text-texto-2">
                <MorphLoader size={28} color="var(--color-acento)" decorativo />
                <TextMorph palabras={['Buscando', 'Comparando', 'Ordenando']} etiqueta="Buscando ofertas" className="font-medium" />
              </div>
            )}
          </div>
        </div>
      </form>
    </>
  );
}
