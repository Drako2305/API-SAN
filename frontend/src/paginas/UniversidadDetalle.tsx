import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Building2, GitCompareArrows, MapPin, Search } from 'lucide-react';
import { Badge, Card, EmptyState, Tabs, Button, claseBoton } from '@/componentes';
import { Cargando, FotoUniversidad, OfertaFila } from '@/componentes/catalogo';
import { reemplazarSeleccion } from '@/lib/seleccionComparar';
import { ApiError, catalogo } from '@/lib/api';
import { ciudadLegible, etiquetaModalidad, formatoCop, nombreLegible } from '@/lib/formato';
import { useCarga } from '@/lib/useCarga';

const noEncontrado = (e: unknown) => e instanceof ApiError && (e.status === 404 || e.status === 400);

function Cifra({ valor, titulo }: { valor: string; titulo: string }) {
  return (
    <div className="min-w-0">
      <dd className="numeros font-display text-lg font-semibold break-words">{valor}</dd>
      <dt className="text-xs text-texto-3">{titulo}</dt>
    </div>
  );
}

export default function UniversidadDetalle() {
  const { id = '' } = useParams();
  const navegar = useNavigate();
  const [pestana, setPestana] = useState('resumen');
  const verOfertas = () => {
    setPestana('ofertas');
    requestAnimationFrame(() => document.getElementById('pestanas-universidad')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  const { datos: u, cargando, error, recargar } = useCarga(
    () => catalogo.universidad(id).catch((e: unknown) => (noEncontrado(e) ? null : Promise.reject(e))),
    [id],
  );

  const resumen = useMemo(() => {
    const ofertas = u?.ofertas ?? [];
    const costos = ofertas.map((o) => o.costo);
    return {
      n: ofertas.length,
      acreditadas: ofertas.filter((o) => o.acreditacion).length,
      min: costos.length ? Math.min(...costos) : null,
      max: costos.length ? Math.max(...costos) : null,
      carreras: [...new Set(ofertas.map((o) => nombreLegible(o.carrera)))],
      modalidades: [...new Set(ofertas.map((o) => o.modalidad))],
    };
  }, [u]);

  if (cargando && !u) {
    return (
      <>
        <title>Universidad · SAN</title>
        <h1 className="sr-only">Cargando universidad</h1>
        <Cargando filas={2} alto="h-48" />
      </>
    );
  }
  if (error) {
    return (
      <>
        <title>Universidad · SAN</title>
        <h1 className="sr-only">No pudimos cargar la universidad</h1>
        <EmptyState icono={<Building2 />} titulo="No pudimos cargar la universidad" texto={error} accion={<button type="button" className="font-medium text-acento-texto" onClick={recargar}>Intentar de nuevo</button>} />
      </>
    );
  }
  if (!u) {
    return (
      <>
        <title>Universidad no encontrada · SAN</title>
        <h1 className="sr-only">Universidad no encontrada</h1>
        <EmptyState icono={<Building2 />} titulo="No encontramos esa universidad" texto="Puede que el enlace esté mal o que ya no esté en el catálogo." accion={<Link to="/universidades" className="font-medium">Ver universidades</Link>} />
      </>
    );
  }

  const rango = resumen.min === null ? '-' : resumen.min === resumen.max ? formatoCop(resumen.min) : `${formatoCop(resumen.min)} a ${formatoCop(resumen.max!)}`;
  const comparar = () => {
    reemplazarSeleccion(u.ofertas);
    navegar('/comparar');
  };

  const resumenTab = (
    <Card relleno="lg">
      <h2 className="text-lg">Sobre esta universidad</h2>
      {resumen.n === 0 ? (
        <p className="mt-3 text-texto-2">Todavía no tiene ofertas en el catálogo.</p>
      ) : (
        <>
          <p className="mt-3 max-w-[65ch] text-texto-2">
            {u.nombre} tiene {resumen.n} {resumen.n === 1 ? 'oferta' : 'ofertas'} en el catálogo, en {ciudadLegible(u.ciudad)}.{' '}
            {resumen.acreditadas > 0 ? `${resumen.acreditadas} con acreditación.` : 'Ninguna figura con acreditación.'}
          </p>
          <h3 className="mt-5 text-sm font-medium text-texto-3">Carreras</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {resumen.carreras.map((c) => (
              <li key={c}><Badge tono="acento">{c}</Badge></li>
            ))}
          </ul>
          <h3 className="mt-5 text-sm font-medium text-texto-3">Modalidades</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {resumen.modalidades.map((m) => (
              <li key={m}><Badge>{etiquetaModalidad(m)}</Badge></li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );

  const ofertasTab =
    u.ofertas.length === 0 ? (
      <EmptyState icono={<Search />} titulo="Sin ofertas por ahora" texto="Esta universidad no tiene ofertas registradas." />
    ) : (
      <ul className="divide-y divide-borde overflow-hidden rounded-lg border border-borde bg-superficie">
        {u.ofertas.map((o) => (
          <OfertaFila key={o.id} oferta={o} titulo="carrera" />
        ))}
      </ul>
    );

  return (
    <>
      <title>{u.nombre} · SAN</title>
      <div className="grid items-start gap-6 lg:grid-cols-[20rem_1fr]">
        <Card relleno="ninguno" className="overflow-hidden lg:sticky lg:top-[calc(var(--barra)+1rem)]">
          <FotoUniversidad nombre={u.nombre} imagenUrl={u.imagenUrl} sizes="(min-width: 1024px) 20rem, 100vw" prioridad alt={`Campus de ${u.nombre}`} />
          <div className="p-5">
            <h1 className="text-2xl">{u.nombre}</h1>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-texto-2">
              <MapPin className="size-4" aria-hidden />
              {ciudadLegible(u.ciudad)}
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-borde py-4">
              <Cifra valor={String(resumen.n)} titulo="Ofertas" />
              <Cifra valor={String(resumen.acreditadas)} titulo="Acreditadas" />
              <div className="col-span-2"><Cifra valor={rango} titulo="Rango de costo por periodo" /></div>
            </dl>
            <div className="mt-5 grid gap-2">
              <Button icono={<Search className="size-4" aria-hidden />} onClick={verOfertas} disabled={u.ofertas.length === 0}>
                Ver sus ofertas
              </Button>
              <Button variante="secundario" icono={<GitCompareArrows className="size-4" aria-hidden />} onClick={comparar} disabled={u.ofertas.length < 2}>
                Comparar sus ofertas
              </Button>
              <Link to="/universidades" className={claseBoton('fantasma', 'md', 'no-underline')}>
                Todas las universidades
              </Link>
            </div>
            <p className="mt-4 text-xs text-texto-3">
              Foto de Wikimedia Commons. <a href="/campus/CREDITOS.md" className="text-texto-2">Créditos</a>
            </p>
          </div>
        </Card>

        <div id="pestanas-universidad" className="min-w-0 scroll-mt-[calc(var(--barra)+1rem)]">
        <Tabs
          valor={pestana}
          onCambio={setPestana}
          nombre="Secciones de la universidad"
          className="min-w-0"
          tabs={[
            { id: 'resumen', etiqueta: 'Resumen', contenido: resumenTab },
            { id: 'ofertas', etiqueta: `Ofertas (${resumen.n})`, contenido: ofertasTab },
          ]}
        />
        </div>
      </div>
    </>
  );
}
