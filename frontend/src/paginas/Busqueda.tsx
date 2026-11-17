import { useCallback, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router';
import { SearchX, TriangleAlert } from 'lucide-react';
import { Button, Card, EmptyState, LinkButton, Skeleton, useToast } from '@/componentes';
import { BarraComparar } from '@/componentes/busqueda/BarraComparar';
import { FilaResultado } from '@/componentes/busqueda/FilaResultado';
import { ResumenBusqueda, urlEditar } from '@/componentes/busqueda/ResumenBusqueda';
import { busquedas, mensajeError, usuarios } from '@/lib/api';
import { nombreLegible } from '@/lib/formato';
import type { Pesos } from '@/lib/modelos';
import { MAX_COMPARAR, useSeleccion } from '@/lib/seleccionComparar';
import { useSesion } from '@/lib/sesion';
import { useCarga } from '@/lib/useCarga';

function Cargando() {
  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]" aria-busy="true" aria-label="Cargando resultados">
      <Skeleton className="h-80 rounded-lg" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-56" />
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-44 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function Busqueda() {
  const { id = '' } = useParams();
  const ubicacion = useLocation();
  const { usuario, autenticado } = useSesion();
  const toast = useToast();
  const seleccion = useSeleccion();

  const { datos, cargando, error, recargar } = useCarga(
    async () => {
      const [resumen, resultados] = await Promise.all([busquedas.resumen(id), busquedas.resultados(id)]);
      return { resumen, resultados };
    },
    [id],
  );

  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!usuario) return;
    let vigente = true;
    usuarios.favoritos(usuario.id).then(
      (ids) => vigente && setFavoritos(new Set(ids)),
      () => undefined, // sin favoritos los corazones quedan vacíos; no bloquea la lista
    );
    return () => {
      vigente = false;
    };
  }, [usuario]);

  const alternarFavorito = useCallback(
    async (ofertaId: string, activo: boolean) => {
      if (!usuario) return;
      const copiar = (f: Set<string>, on: boolean) => {
        const n = new Set(f);
        if (on) n.add(ofertaId);
        else n.delete(ofertaId);
        return n;
      };
      setFavoritos((f) => copiar(f, activo));
      try {
        if (activo) await usuarios.agregarFavorito(usuario.id, ofertaId);
        else await usuarios.quitarFavorito(usuario.id, ofertaId);
      } catch (err) {
        setFavoritos((f) => copiar(f, !activo));
        toast.error(mensajeError(err, 'No pudimos actualizar tus favoritos.'));
      }
    },
    [usuario, toast],
  );

  // Pesos: los que viaja la navegación desde /buscar o, si se abre el enlace directo, los guardados en la búsqueda.
  const pesos: Pesos | undefined = (ubicacion.state as { pesos?: Pesos } | null)?.pesos ?? datos?.resumen.filtros.pesos;

  const alternarComparar = (o: Parameters<typeof seleccion.alternar>[0]) => {
    if (!seleccion.alternar(o)) toast.error(`Puedes comparar hasta ${MAX_COMPARAR} ofertas.`);
  };

  const carrera = datos ? nombreLegible(datos.resumen.filtros.carrera) : '';

  return (
    <>
      <title>{carrera ? `${carrera} · Resultados · SAN` : 'Resultados de la búsqueda · SAN'}</title>
      {cargando && !datos ? (
        <Cargando />
      ) : error || !datos ? (
        <EmptyState
          icono={<TriangleAlert />}
          titulo="No pudimos cargar esta búsqueda"
          texto={error ?? 'Intenta de nuevo en un momento.'}
          accion={
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={recargar}>Reintentar</Button>
              <LinkButton to="/buscar" variante="secundario">
                Nueva búsqueda
              </LinkButton>
            </div>
          }
        />
      ) : (
        <div className={`grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start ${seleccion.total > 0 ? 'pb-24' : ''}`}>
          <ResumenBusqueda resumen={datos.resumen} pesos={pesos} />

          <section aria-labelledby="titulo-resultados" className="min-w-0">
            <header className="mb-3">
              <h1 id="titulo-resultados" className="text-[1.5rem] md:text-[1.75rem]">
                {carrera}
              </h1>
              <p className="mt-1 text-sm text-texto-2" aria-live="polite">
                {datos.resultados.length === 1 ? '1 oferta' : `${datos.resultados.length} ofertas`}, de mayor a menor puntaje.
              </p>
            </header>

            {datos.resultados.length === 0 ? (
              <EmptyState
                icono={<SearchX />}
                titulo="Ninguna oferta cumple estos filtros"
                texto="Prueba con otra ciudad, sube el costo máximo o deja la modalidad y la jornada en cualquiera."
                accion={
                  <LinkButton to={urlEditar(datos.resumen.filtros, pesos)}>Editar búsqueda</LinkButton>
                }
              />
            ) : (
              <Card relleno="ninguno" className="overflow-hidden">
                <ul className="divide-y divide-borde">
                  {datos.resultados.map((r) => {
                    const sel = seleccion.ofertas.some((o) => o.id === r.oferta.id);
                    return (
                      <FilaResultado
                        key={r.oferta.id}
                        resultado={r}
                        pesos={pesos}
                        favorito={autenticado ? favoritos.has(r.oferta.id) : null}
                        onFavorito={(a) => void alternarFavorito(r.oferta.id, a)}
                        seleccionada={sel}
                        bloqueada={seleccion.llena && !sel}
                        onComparar={() => alternarComparar(r.oferta)}
                      />
                    );
                  })}
                </ul>
              </Card>
            )}
          </section>
        </div>
      )}
      <BarraComparar ofertas={seleccion.ofertas} onVaciar={seleccion.vaciar} />
    </>
  );
}
