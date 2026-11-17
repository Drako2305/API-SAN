import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { ArrowUpRight, BadgeCheck, Check, GitCompareArrows, Heart, MapPin, SearchX } from 'lucide-react';
import { Badge, Button, Card, EmptyState, LinkButton, Skeleton, useToast } from '@/componentes';
import { Cargando, FotoConFallback, FotoUniversidad, OfertaFila } from '@/componentes/catalogo';
import { MAX_COMPARAR, useSeleccion } from '@/lib/seleccionComparar';
import { ApiError, catalogo, mensajeError, usuarios } from '@/lib/api';
import { fotoCarrera } from '@/lib/fotos';
import { ciudadLegible, etiquetaJornada, etiquetaModalidad, formatoCop, nombreLegible } from '@/lib/formato';
import { useSesion } from '@/lib/sesion';
import { useCarga } from '@/lib/useCarga';
import { HeartMorph } from '@/morphing';

const noEncontrado = (e: unknown) => e instanceof ApiError && (e.status === 404 || e.status === 400);

function Dato({ t, children }: { t: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-texto-3">{t}</dt>
      <dd className="numeros mt-1 font-display text-xl font-semibold break-words">{children}</dd>
    </div>
  );
}

function Relacionadas({ carreraId, ofertaId }: { carreraId: string; ofertaId: string }) {
  const { datos, cargando } = useCarga(() => catalogo.ofertas({ carreraId }), [carreraId]);
  const otras = (datos ?? []).filter((o) => o.id !== ofertaId);
  return (
    <section aria-labelledby="relacionadas" className="mt-10" aria-busy={cargando}>
      <h2 id="relacionadas" className="mb-3 text-lg">Ofertas relacionadas</h2>
      {cargando ? (
        <Skeleton className="h-16 rounded-lg" />
      ) : otras.length === 0 ? (
        <p className="text-sm text-texto-2">Esta carrera no tiene otras universidades en el catálogo.</p>
      ) : (
        <ul className="divide-y divide-borde overflow-hidden rounded-lg border border-borde bg-superficie">
          {otras.map((o) => (
            <OfertaFila key={o.id} oferta={o} titulo="universidad" />
          ))}
        </ul>
      )}
    </section>
  );
}

export default function Oferta() {
  const { id = '' } = useParams();
  const ubicacion = useLocation();
  const { usuario, autenticado } = useSesion();
  const { mostrar, error: avisoError } = useToast();

  const { datos: o, cargando, error, recargar } = useCarga(
    () => catalogo.oferta(id).catch((e: unknown) => (noEncontrado(e) ? null : Promise.reject(e))),
    [id],
  );

  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [guardando, setGuardando] = useState(false);
  const seleccion = useSeleccion();

  useEffect(() => {
    if (!usuario) return;
    let vivo = true;
    usuarios.favoritos(usuario.id).then((f) => vivo && setFavoritos(f), () => {});
    return () => {
      vivo = false;
    };
  }, [usuario]);

  if (cargando && !o) {
    return (
      <>
        <title>Oferta académica · SAN</title>
        <h1 className="sr-only">Cargando oferta</h1>
        <Cargando filas={2} alto="h-40" />
      </>
    );
  }
  if (error) {
    return (
      <>
        <title>Oferta académica · SAN</title>
        <h1 className="sr-only">No pudimos cargar la oferta</h1>
        <EmptyState icono={<SearchX />} titulo="No pudimos cargar la oferta" texto={error} accion={<button type="button" className="font-medium text-acento-texto" onClick={recargar}>Intentar de nuevo</button>} />
      </>
    );
  }
  if (!o) {
    return (
      <>
        <title>Oferta no encontrada · SAN</title>
        <h1 className="sr-only">Oferta no encontrada</h1>
        <EmptyState icono={<SearchX />} titulo="No encontramos esa oferta" texto="Puede que el enlace esté mal o que la oferta ya no exista." accion={<Link to="/buscar" className="font-medium">Buscar ofertas</Link>} />
      </>
    );
  }

  const carrera = nombreLegible(o.carrera);
  const fotoBanda = fotoCarrera({ nombre: o.carrera, imagenUrl: o.carreraImagenUrl });
  const esFavorito = favoritos.includes(o.id);
  const enSeleccion = seleccion.ofertas.some((s) => s.id === o.id);

  const alternarFavorito = async (activar: boolean) => {
    if (!usuario || guardando) return;
    setGuardando(true);
    try {
      setFavoritos(activar ? await usuarios.agregarFavorito(usuario.id, o.id) : await usuarios.quitarFavorito(usuario.id, o.id));
    } catch (e) {
      avisoError(mensajeError(e, 'No pudimos actualizar tus favoritos.'));
    } finally {
      setGuardando(false);
    }
  };

  const alternarComparar = () => {
    if (!seleccion.alternar(o)) mostrar(`Solo puedes comparar hasta ${MAX_COMPARAR} ofertas. Quita una en Comparar.`);
  };

  const returnUrl = encodeURIComponent(ubicacion.pathname + ubicacion.search);

  return (
    <>
      <title>{`${carrera} en ${o.universidad} · SAN`}</title>
      <header className="relative isolate overflow-hidden rounded-xl bg-panel p-5 text-sobre-panel md:p-8">
        {/* Foto de la carrera de fondo; si falta, queda el fondo liso del panel. */}
        <FotoConFallback src={fotoBanda.src} sm={fotoBanda.sm} sizes="(min-width: 1152px) 72rem, 100vw" width={1600} height={600} className="absolute inset-0 -z-20 size-full bg-panel" imgClassName="opacity-60" ocultarSiFalla />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-panel via-panel/80 to-panel/60" />
        <nav aria-label="Ruta" className="text-sm text-sobre-panel-2">
          <Link to="/carreras" viewTransition className="text-sobre-panel-2">Carreras</Link>
          <span aria-hidden> / </span>
          {o.carreraId ? (
            <Link to={`/carreras/${o.carreraId}`} viewTransition className="text-sobre-panel-2">{carrera}</Link>
          ) : (
            <span>{carrera}</span>
          )}
          <span aria-hidden> / </span>
          <span aria-current="page">{o.universidad}</span>
        </nav>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <h1 className="text-[1.75rem] md:text-4xl">{carrera}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sobre-panel-2">
              <span>{o.universidad}</span>
              <span className="inline-flex items-center gap-1"><MapPin className="size-4" aria-hidden />{ciudadLegible(o.ciudad)}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {autenticado ? (
              <span className="grid size-10 place-items-center rounded-full bg-superficie text-acento-texto">
                <HeartMorph activo={esFavorito} onCambio={alternarFavorito} etiqueta={esFavorito ? 'Quitar de favoritos' : 'Guardar en favoritos'} />
              </span>
            ) : (
              <LinkButton to={`/ingresar?returnUrl=${returnUrl}`} variante="secundario" icono={<Heart className="size-4" aria-hidden />}>
                Ingresa para guardar
              </LinkButton>
            )}
            <Button variante={enSeleccion ? 'secundario' : 'primario'} aria-pressed={enSeleccion} onClick={alternarComparar} icono={enSeleccion ? <Check className="size-4" aria-hidden /> : <GitCompareArrows className="size-4" aria-hidden />}>
              {enSeleccion ? 'En tu comparación' : 'Agregar a comparar'}
            </Button>
          </div>
        </div>
      </header>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
        <Card relleno="lg">
          <h2 className="mb-5 text-lg">Datos de la oferta</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3">
            <Dato t="Costo por periodo">{formatoCop(o.costo)}</Dato>
            <Dato t="Costo total estimado">{formatoCop(o.costo * o.duracion)}</Dato>
            <Dato t="Duración">{o.duracion} periodos</Dato>
            <Dato t="Modalidad">{etiquetaModalidad(o.modalidad)}</Dato>
            <Dato t="Jornada">{etiquetaJornada(o.jornada)}</Dato>
            <Dato t="Acreditación">
              {o.acreditacion ? (
                <Badge tono="ok" className="h-7 text-sm"><BadgeCheck className="size-4" aria-hidden />Acreditada</Badge>
              ) : (
                'Sin acreditación'
              )}
            </Dato>
            <Dato t="Código SNIES">{o.snies}</Dato>
          </dl>
          <p className="mt-6 text-xs text-texto-3">El costo total estimado es el costo por periodo por la duración.</p>
        </Card>

        <Card relleno="ninguno" className="overflow-hidden">
          <FotoUniversidad nombre={o.universidad} imagenUrl={o.imagenUrl} sizes="(min-width: 1024px) 20rem, 100vw" />
          <div className="p-4">
            <p className="text-xs text-texto-3">Universidad</p>
            <h2 className="mt-0.5 text-base font-semibold">{o.universidad}</h2>
            <p className="text-sm text-texto-3">{ciudadLegible(o.ciudad)}</p>
            {o.universidadId && (
              <Link to={`/universidades/${o.universidadId}`} viewTransition className="mt-3 inline-flex items-center gap-1 text-sm font-medium">
                Ver universidad <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            )}
          </div>
        </Card>
      </div>

      {o.carreraId && <Relacionadas carreraId={o.carreraId} ofertaId={o.id} />}
    </>
  );
}
