import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { ArrowDownUp, BadgeCheck, ChevronRight, GraduationCap, MapPin, SlidersHorizontal, Sun } from 'lucide-react';
import { Badge, EmptyState, LinkButton, Selector, Skeleton, useToast } from '@/componentes';
import { BarraComparar } from '@/componentes/busqueda/BarraComparar';
import { FotoConFallback, FotoUniversidad } from '@/componentes/catalogo';
import { ApiError, catalogo } from '@/lib/api';
import { etiquetaArea, iconoArea } from '@/lib/areas';
import { cn } from '@/lib/cn';
import { ciudadLegible, etiquetaJornada, etiquetaModalidad, formatoCop, nombreLegible } from '@/lib/formato';
import { fotoCarrera } from '@/lib/fotos';
import { JORNADAS, MODALIDADES, type OfertaAcademica } from '@/lib/modelos';
import { MAX_COMPARAR, useSeleccion } from '@/lib/seleccionComparar';
import { useCarga } from '@/lib/useCarga';

const ORDENES = [
  { valor: 'costo', etiqueta: 'Menor costo por periodo', comparar: (a: OfertaAcademica, b: OfertaAcademica) => a.costo - b.costo },
  { valor: 'total', etiqueta: 'Menor costo total', comparar: (a: OfertaAcademica, b: OfertaAcademica) => a.costo * a.duracion - b.costo * b.duracion },
  { valor: 'duracion', etiqueta: 'Menor duración', comparar: (a: OfertaAcademica, b: OfertaAcademica) => a.duracion - b.duracion || a.costo - b.costo },
  { valor: 'universidad', etiqueta: 'Universidad (A-Z)', comparar: (a: OfertaAcademica, b: OfertaAcademica) => a.universidad.localeCompare(b.universidad, 'es') },
] as const;

const CHIP = 'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors duration-[var(--dur-rapida)]';
const chip = (activo: boolean) =>
  cn(CHIP, activo ? 'border-acento-borde bg-acento-suave text-acento-texto' : 'border-borde bg-superficie text-texto-2 hover:bg-superficie-2 hover:text-texto');

const noEncontrada = (e: unknown) => e instanceof ApiError && (e.status === 404 || e.status === 400);

function Cifra({ valor, titulo }: { valor: string; titulo: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-texto-3">{titulo}</dt>
      <dd className="numeros mt-0.5 font-display text-xl font-semibold">{valor}</dd>
    </div>
  );
}

function FilaOferta({ o, elegida, bloqueada, onComparar }: { o: OfertaAcademica; elegida: boolean; bloqueada: boolean; onComparar: () => void }) {
  return (
    <li className="relative grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 p-4 transition-colors hover:bg-superficie-2/60 sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:items-center">
      <FotoUniversidad nombre={o.universidad} imagenUrl={o.imagenUrl} sizes="6rem" className="w-full self-start rounded-md" />
      <div className="min-w-0">
        <h3 className="text-base leading-snug font-semibold">
          <Link to={`/ofertas/${o.id}`} viewTransition className="text-texto no-underline after:absolute after:inset-0 after:content-[''] hover:text-acento-texto">
            {o.universidad}
          </Link>
        </h3>
        <p className="mt-0.5 flex items-center gap-1 text-sm text-texto-2">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          {ciudadLegible(o.ciudad)}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge>{etiquetaModalidad(o.modalidad)}</Badge>
          <Badge>{etiquetaJornada(o.jornada)}</Badge>
          {o.acreditacion && (
            <Badge tono="ok">
              <BadgeCheck className="size-3.5" aria-hidden />
              Acreditada
            </Badge>
          )}
        </div>
      </div>
      <div className="col-span-2 flex items-end justify-between gap-4 border-t border-borde pt-3 sm:col-span-1 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
        <p className="text-right">
          <span className="numeros block font-display text-lg font-semibold">{formatoCop(o.costo)}</span>
          <span className="numeros block text-xs text-texto-3">
            por periodo · {o.duracion} periodos · total {formatoCop(o.costo * o.duracion)}
          </span>
        </p>
        <label className="relative z-10 inline-flex min-h-8 cursor-pointer items-center gap-2 text-sm font-medium has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
          <input
            type="checkbox"
            className="size-4 cursor-pointer accent-[var(--color-acento)] disabled:cursor-not-allowed"
            checked={elegida}
            disabled={bloqueada}
            onChange={onComparar}
            title={bloqueada ? `Ya elegiste ${MAX_COMPARAR} ofertas para comparar` : undefined}
          />
          Comparar<span className="sr-only"> la oferta de {o.universidad}</span>
        </label>
      </div>
      <ChevronRight className="absolute top-4 right-3 size-4 text-texto-3 sm:hidden" aria-hidden />
    </li>
  );
}

/**
 * Ficha de una carrera: sus ofertas en todas las universidades, de una vez, con filtros y orden en la URL.
 * Los pesos son un paso opcional ("Ordenar con lo que te importa") que abre /buscar ya diligenciado.
 */
export default function CarreraDetalle() {
  const { id = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const toast = useToast();
  const seleccion = useSeleccion();

  const carrera = useCarga(() => catalogo.carrera(id).catch((e: unknown) => (noEncontrada(e) ? null : Promise.reject(e))), [id]);
  const ofertas = useCarga(() => catalogo.ofertas({ carreraId: id }), [id]);

  const ciudad = params.get('ciudad') ?? '';
  const modalidad = params.get('modalidad') ?? '';
  const jornada = params.get('jornada') ?? '';
  const soloAcreditadas = params.get('acreditadas') === '1';
  const orden = ORDENES.find((o) => o.valor === params.get('orden')) ?? ORDENES[0];

  const fijar = (clave: string, valor: string) => {
    const n = new URLSearchParams(params);
    if (valor) n.set(clave, valor);
    else n.delete(clave);
    setParams(n, { replace: true, preventScrollReset: true });
  };
  const limpiar = () => setParams(params.get('orden') ? { orden: params.get('orden')! } : {}, { replace: true, preventScrollReset: true });

  const todas = ofertas.datos ?? [];
  const resumen = useMemo(() => {
    const costos = todas.map((o) => o.costo);
    return {
      universidades: new Set(todas.map((o) => o.universidad)).size,
      ciudades: [...new Set(todas.map((o) => o.ciudad))].sort((a, b) => a.localeCompare(b, 'es')),
      acreditadas: todas.filter((o) => o.acreditacion).length,
      desde: costos.length ? Math.min(...costos) : null,
    };
  }, [todas]);

  const visibles = useMemo(
    () =>
      todas
        .filter(
          (o) =>
            (!ciudad || o.ciudad === ciudad) &&
            (!modalidad || o.modalidad === modalidad) &&
            (!jornada || o.jornada === jornada) &&
            (!soloAcreditadas || o.acreditacion),
        )
        .sort(orden.comparar),
    [todas, ciudad, modalidad, jornada, soloAcreditadas, orden],
  );
  const conteo = (f: (o: OfertaAcademica) => boolean) => todas.filter(f).length;
  const filtrando = Boolean(ciudad || modalidad || jornada || soloAcreditadas);

  const c = carrera.datos;
  if (carrera.cargando && !c) {
    return (
      <>
        <title>Carrera · SAN</title>
        <h1 className="sr-only">Cargando carrera</h1>
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="mt-6 h-96 rounded-lg" />
      </>
    );
  }
  if (carrera.error || c === null) {
    return (
      <>
        <title>Carrera no encontrada · SAN</title>
        <h1 className="sr-only">{c === null ? 'Carrera no encontrada' : 'No pudimos cargar la carrera'}</h1>
        <EmptyState
          icono={<GraduationCap />}
          titulo={c === null ? 'No encontramos esa carrera' : 'No pudimos cargar la carrera'}
          texto={carrera.error ?? 'Puede que el enlace esté mal o que ya no esté en el catálogo.'}
          accion={<Link to="/carreras" className="font-medium">Ver todas las carreras</Link>}
        />
      </>
    );
  }
  if (!c) return null;

  const nombre = nombreLegible(c.nombre);
  const foto = fotoCarrera(c);
  const IconoArea = iconoArea(c.area);
  const urlPesos = (() => {
    const q = new URLSearchParams({ carrera: c.nombre });
    if (ciudad) q.set('ciudad', ciudad);
    if (modalidad) q.set('modalidad', modalidad);
    if (jornada) q.set('jornada', jornada);
    return `/buscar?${q.toString()}`;
  })();

  return (
    <>
      <title>{`${nombre} · SAN`}</title>
      <nav aria-label="Ruta de navegación" className="mb-4 flex flex-wrap items-center gap-1 text-sm text-texto-3">
        <Link to="/carreras" viewTransition className="text-texto-2">
          Carreras
        </Link>
        {c.area && (
          <>
            <ChevronRight className="size-3.5" aria-hidden />
            <Link to={`/carreras?area=${encodeURIComponent(c.area)}`} viewTransition className="text-texto-2">
              {etiquetaArea(c.area)}
            </Link>
          </>
        )}
        <ChevronRight className="size-3.5" aria-hidden />
        <span aria-current="page" className="text-texto">
          {nombre}
        </span>
      </nav>

      <header className="grid overflow-hidden rounded-xl border border-borde bg-superficie md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div className="relative aspect-[16/9] min-w-0 md:aspect-auto md:min-h-64">
          <FotoConFallback src={foto.src} sm={foto.sm} sizes="(min-width: 768px) 22rem, 100vw" width={800} height={450} prioridad relleno area={c.area} className="absolute inset-0 size-full" />
        </div>
        <div className="flex flex-col gap-5 p-5 md:p-7">
          <div>
            {c.area && (
              <Badge tono="acento" className="mb-2.5">
                <IconoArea className="size-3.5" aria-hidden />
                {etiquetaArea(c.area)}
              </Badge>
            )}
            <h1 className="text-[1.75rem] leading-tight md:text-4xl">{nombre}</h1>
            <p className="mt-2 max-w-[60ch] text-texto-2">
              {ofertas.datos
                ? todas.length === 0
                  ? 'Todavía ninguna universidad del catálogo la ofrece.'
                  : `Se ofrece en ${resumen.universidades} ${resumen.universidades === 1 ? 'universidad' : 'universidades'} de ${resumen.ciudades.length} ${resumen.ciudades.length === 1 ? 'ciudad' : 'ciudades'}. Filtra y ordena aquí, o pon tus pesos para ver un puntaje con su porqué.`
                : ' '}
            </p>
          </div>
          {ofertas.datos && todas.length > 0 && (
            <dl className="grid grid-cols-2 gap-4 border-t border-borde pt-4 sm:grid-cols-4">
              <Cifra titulo="Ofertas" valor={String(todas.length)} />
              <Cifra titulo="Universidades" valor={String(resumen.universidades)} />
              <Cifra titulo="Acreditadas" valor={String(resumen.acreditadas)} />
              <Cifra titulo="Costo desde, por periodo" valor={resumen.desde === null ? '-' : formatoCop(resumen.desde)} />
            </dl>
          )}
          {todas.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-2">
              <LinkButton to={urlPesos} viewTransition icono={<SlidersHorizontal className="size-4" aria-hidden />}>
                Ordenar con lo que te importa
              </LinkButton>
            </div>
          )}
        </div>
      </header>

      <section aria-labelledby="titulo-ofertas" className="mt-8">
        <h2 id="titulo-ofertas" className="sr-only">
          Ofertas de {nombre}
        </h2>
        {ofertas.error ? (
          <EmptyState icono={<GraduationCap />} titulo="No pudimos cargar las ofertas" texto={ofertas.error} accion={<button type="button" className="font-medium text-acento-texto" onClick={ofertas.recargar}>Intentar de nuevo</button>} />
        ) : !ofertas.datos ? (
          <Skeleton className="h-96 rounded-lg" />
        ) : todas.length === 0 ? (
          <EmptyState icono={<GraduationCap />} titulo="Sin ofertas por ahora" texto="Cuando una universidad la registre, aparecerá aquí." accion={<Link to="/carreras" className="font-medium">Ver otras carreras</Link>} />
        ) : (
          <>
            <div className="mb-4 flex flex-col gap-3">
              <div role="group" aria-label="Filtrar por modalidad" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
                <button type="button" aria-pressed={!modalidad} onClick={() => fijar('modalidad', '')} className={chip(!modalidad)}>
                  Todas <span className="numeros text-xs opacity-70">{todas.length}</span>
                </button>
                {MODALIDADES.map((m) => {
                  const n = conteo((o) => o.modalidad === m);
                  return (
                    <button key={m} type="button" aria-pressed={modalidad === m} disabled={n === 0} onClick={() => fijar('modalidad', modalidad === m ? '' : m)} className={cn(chip(modalidad === m), 'disabled:opacity-40')}>
                      {etiquetaModalidad(m)} <span className="numeros text-xs opacity-70">{n}</span>
                    </button>
                  );
                })}
                <button type="button" aria-pressed={soloAcreditadas} onClick={() => fijar('acreditadas', soloAcreditadas ? '' : '1')} className={chip(soloAcreditadas)}>
                  <BadgeCheck className="size-4" aria-hidden /> Solo acreditadas <span className="numeros text-xs opacity-70">{resumen.acreditadas}</span>
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Selector
                  etiqueta="Ciudad"
                  icono={<MapPin />}
                  valor={ciudad}
                  onCambio={(v) => fijar('ciudad', v)}
                  opciones={[
                    { valor: '', etiqueta: 'Todas las ciudades', detalle: String(todas.length) },
                    ...resumen.ciudades.map((x) => ({ valor: x, etiqueta: ciudadLegible(x), detalle: String(conteo((o) => o.ciudad === x)) })),
                  ]}
                />
                <Selector
                  etiqueta="Jornada"
                  icono={<Sun />}
                  valor={jornada}
                  onCambio={(v) => fijar('jornada', v)}
                  opciones={[
                    { valor: '', etiqueta: 'Cualquier jornada' },
                    ...JORNADAS.map((j) => ({ valor: j, etiqueta: etiquetaJornada(j), detalle: String(conteo((o) => o.jornada === j)), deshabilitada: conteo((o) => o.jornada === j) === 0 })),
                  ]}
                />
                <Selector
                  etiqueta="Ordenar por"
                  icono={<ArrowDownUp />}
                  valor={orden.valor}
                  onCambio={(v) => fijar('orden', v === 'costo' ? '' : v)}
                  opciones={ORDENES.map((o) => ({ valor: o.valor, etiqueta: o.etiqueta }))}
                />
              </div>
            </div>

            <div className="mb-2 flex items-baseline justify-between gap-3">
              <p role="status" className="text-sm text-texto-2">
                <span className="numeros font-semibold text-texto">{visibles.length}</span> de {todas.length} {todas.length === 1 ? 'oferta' : 'ofertas'}
              </p>
              {filtrando && (
                <button type="button" onClick={limpiar} className="text-sm font-medium text-acento-texto">
                  Quitar filtros
                </button>
              )}
            </div>

            {visibles.length === 0 ? (
              <EmptyState icono={<SlidersHorizontal />} titulo="Ninguna oferta con esos filtros" texto="Prueba con otra ciudad o modalidad." accion={<button type="button" className="font-medium text-acento-texto" onClick={limpiar}>Quitar filtros</button>} />
            ) : (
              <ul className="divide-y divide-borde overflow-hidden rounded-lg border border-borde bg-superficie">
                {visibles.map((o) => {
                  const elegida = seleccion.ofertas.some((x) => x.id === o.id);
                  return (
                    <FilaOferta
                      key={o.id}
                      o={o}
                      elegida={elegida}
                      bloqueada={!elegida && seleccion.llena}
                      onComparar={() => {
                        if (!seleccion.alternar(o)) toast.error(`Puedes comparar hasta ${MAX_COMPARAR} ofertas.`);
                      }}
                    />
                  );
                })}
              </ul>
            )}
          </>
        )}
      </section>
      <div className={seleccion.total ? 'h-20' : undefined} aria-hidden />
      <BarraComparar ofertas={seleccion.ofertas} onVaciar={seleccion.vaciar} />
    </>
  );
}
