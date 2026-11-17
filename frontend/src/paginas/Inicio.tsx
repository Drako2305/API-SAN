import { Link } from 'react-router';
import { ArrowUpRight, GitCompareArrows, Heart, Search } from 'lucide-react';
import { Avatar, Badge, Card, EmptyState, Skeleton } from '@/componentes';
import { BuscadorCarrera, CarrerasPopulares } from '@/componentes/catalogo';
import { busquedas, usuarios } from '@/lib/api';
import { ciudadLegible, etiquetaJornada, etiquetaModalidad, formatoCop, nombreLegible } from '@/lib/formato';
import { busquedasRecientes } from '@/lib/recientes';
import { useSesion } from '@/lib/sesion';
import { useCarga } from '@/lib/useCarga';
import { useCatalogoConteos } from '@/lib/useCatalogoConteos';
import type { BusquedaResumen } from '@/lib/modelos';

function saludo(): string {
  const h = new Date().getHours();
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
}

const TARJETA =
  'group flex h-full min-h-36 flex-col justify-between gap-4 rounded-lg border p-5 no-underline transition-[box-shadow,border-color] duration-[var(--dur-rapida)] hover:shadow-2';

function descripcionFiltros(f: BusquedaResumen['filtros']): string {
  const partes = [
    f.ciudad && ciudadLegible(f.ciudad),
    f.modalidad && etiquetaModalidad(f.modalidad),
    f.jornada && etiquetaJornada(f.jornada),
    f.costoMax != null && `hasta ${formatoCop(f.costoMax)}`,
  ].filter(Boolean);
  return partes.length ? partes.join(' · ') : 'Sin filtros adicionales';
}

function Cifra({ n, t, cargando }: { n?: number; t: string; cargando: boolean }) {
  return (
    <div>
      <dt className="text-sm text-texto-2">{t}</dt>
      <dd className="numeros mt-1 font-display text-3xl font-semibold">{cargando ? <Skeleton className="h-8 w-12" /> : (n ?? '-')}</dd>
    </div>
  );
}

function Recientes() {
  const ids = busquedasRecientes().slice(0, 5);
  const { datos, cargando } = useCarga(async () => {
    const r = await Promise.allSettled(ids.map((id) => busquedas.resumen(id)));
    return r.flatMap((x) => (x.status === 'fulfilled' ? [x.value] : []));
  }, []);

  if (ids.length === 0 || (!cargando && (datos?.length ?? 0) === 0)) {
    return (
      <EmptyState
        icono={<Search />}
        titulo="Aún no has hecho búsquedas"
        texto="Cuando busques una carrera, aquí verás tus últimas búsquedas para retomarlas."
        accion={
          <Link to="/buscar" className="font-medium">
            Hacer mi primera búsqueda
          </Link>
        }
      />
    );
  }
  return (
    <ul className="divide-y divide-borde overflow-hidden rounded-lg border border-borde bg-superficie" aria-busy={cargando}>
      {cargando && ids.map((id) => <li key={id} className="p-4"><Skeleton className="h-10" /></li>)}
      {datos?.map((b) => (
        <li key={b.id}>
          <Link to={`/busquedas/${b.id}`} className="flex items-center gap-3 px-4 py-3 text-texto no-underline hover:bg-superficie-2">
            <Avatar nombre={nombreLegible(b.filtros.carrera)} />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{nombreLegible(b.filtros.carrera)}</span>
              <span className="block truncate text-sm text-texto-3">{descripcionFiltros(b.filtros)}</span>
            </span>
            <Badge tono="acento" className="numeros">
              {b.total} {b.total === 1 ? 'resultado' : 'resultados'}
            </Badge>
            <ArrowUpRight className="size-4 text-texto-3" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Inicio() {
  const { usuario } = useSesion();
  const conteos = useCatalogoConteos();
  const favoritos = useCarga(() => (usuario ? usuarios.favoritos(usuario.id) : Promise.resolve([])), [usuario?.id]);

  return (
    <>
      <title>Inicio · SAN</title>
      {/* Misma escala tipográfica, ancho y buscador que el hero de la portada: la primera pantalla continúa la portada. */}
      <h1 className="titulo-display text-[clamp(2rem,4.4vw,3.25rem)] leading-[1.05] font-semibold">
        {saludo()}, {usuario?.nombre}
      </h1>
      <p className="mt-4 max-w-[52ch] text-lg text-texto-2">¿Qué quieres resolver hoy?</p>
      <BuscadorCarrera className="mt-6 block max-w-[40rem]" />

      <div className="mt-8 grid gap-[var(--gap-grilla)] md:grid-cols-3">
        <Link to="/carreras" viewTransition className={`${TARJETA} border-transparent bg-acento text-sobre-acento`}>
          <Search className="size-6" aria-hidden />
          <span>
            <span className="block font-display text-lg font-semibold">Explorar carreras</span>
            <span className="mt-1 line-clamp-2 block text-sm">Elige una y mira sus ofertas por ciudad, costo y modalidad.</span>
          </span>
        </Link>
        <Link to="/comparar" viewTransition className={`${TARJETA} border-borde bg-superficie text-texto hover:border-borde-fuerte`}>
          <GitCompareArrows className="size-6 text-acento-texto" aria-hidden />
          <span>
            <span className="block font-display text-lg font-semibold">Comparar ofertas</span>
            <span className="mt-1 line-clamp-2 block text-sm text-texto-2">De 2 a 4 lado a lado.</span>
          </span>
        </Link>
        <Link to="/perfil?pestana=favoritos" viewTransition className={`${TARJETA} border-borde bg-superficie text-texto hover:border-borde-fuerte`}>
          <Heart className="size-6 text-acento-texto" aria-hidden />
          <span>
            <span className="block font-display text-lg font-semibold">Mis favoritos</span>
            <span className="mt-1 line-clamp-2 block text-sm text-texto-2">
              {favoritos.cargando ? 'Cargando…' : `${favoritos.datos?.length ?? 0} guardadas`}
            </span>
          </span>
        </Link>
      </div>

      <section aria-labelledby="resumen" className="mt-12">
        <h2 id="resumen" className="mb-4 text-lg">
          Resumen
        </h2>
        <Card relleno="lg">
          <dl className="grid grid-cols-2 gap-x-[var(--gap-grilla)] gap-y-6 md:grid-cols-4">
            <Cifra n={favoritos.datos?.length} t="Ofertas favoritas" cargando={favoritos.cargando} />
            <Cifra n={conteos.datos?.ofertas} t="Ofertas en el catálogo" cargando={conteos.cargando} />
            <Cifra n={conteos.datos?.universidades} t="Universidades" cargando={conteos.cargando} />
            <Cifra n={conteos.datos?.carreras} t="Carreras" cargando={conteos.cargando} />
          </dl>
        </Card>
      </section>

      <CarrerasPopulares />

      <section aria-labelledby="recientes" className="mt-12">
        <h2 id="recientes" className="mb-4 text-lg">
          Búsquedas recientes
        </h2>
        <Recientes />
      </section>
    </>
  );
}
