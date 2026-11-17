import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Avatar, Badge, Card, EmptyState, EncabezadoPagina, Skeleton, Tabs } from '@/componentes';
import { FormularioDatos } from '@/componentes/perfil/FormularioDatos';
import { FotoPerfil } from '@/componentes/perfil/FotoPerfil';
import { ListaFavoritos } from '@/componentes/perfil/ListaFavoritos';
import { PanelLateral } from '@/componentes/perfil/PanelLateral';
import { PanelPreferencias } from '@/componentes/perfil/PanelPreferencias';
import { usuarios } from '@/lib/api';
import { ciudadLegible } from '@/lib/formato';
import type { UsuarioDetalle } from '@/lib/modelos';
import { busquedasRecientes } from '@/lib/recientes';
import { useSesion } from '@/lib/sesion';
import { useCarga } from '@/lib/useCarga';
import { TextMorph } from '@/morphing';

const PESTANAS = ['datos', 'preferencias', 'favoritos'] as const;
type Pestana = (typeof PESTANAS)[number];

function Cifra({ n, t }: { n: number | string; t: string }) {
  return (
    <div>
      <dt className="text-sm text-texto-2">{t}</dt>
      <dd className="numeros mt-1 font-display text-2xl font-semibold">{n}</dd>
    </div>
  );
}

export default function Perfil() {
  const { usuario } = useSesion();
  const [params, setParams] = useSearchParams();
  const pedida = params.get('pestana');
  const pestana: Pestana = (PESTANAS as readonly string[]).includes(pedida ?? '') ? (pedida as Pestana) : 'datos';

  const id = usuario?.id ?? '';
  const carga = useCarga(() => usuarios.obtener(id), [id]);
  const favs = useCarga(() => usuarios.favoritos(id), [id]);
  const [cambiado, setCambiado] = useState<UsuarioDetalle | null>(null);
  const [quitados, setQuitados] = useState<string[]>([]);
  const detalle = cambiado ?? carga.datos;
  const ids = (favs.datos ?? []).filter((x) => !quitados.includes(x));

  if (!usuario) return null;

  const cambiarPestana = (p: string) => {
    const n = new URLSearchParams(params);
    if (p === 'datos') n.delete('pestana');
    else n.set('pestana', p);
    setParams(n, { replace: true });
  };

  const cabecera = () => {
    if (carga.cargando && !detalle) {
      return (
        <Card relleno="lg" aria-busy>
          <div className="flex items-center gap-4">
            <Skeleton className="size-14 rounded-full" />
            <Skeleton className="h-10 w-56" />
          </div>
          <div className="mt-3 text-sm text-texto-2">
            <TextMorph palabras={['Cargando tu perfil', 'Un momento']} />
          </div>
        </Card>
      );
    }
    const apellido = detalle?.perfil?.apellido ?? '';
    const nombreCompleto = `${detalle?.nombre ?? usuario.nombre} ${apellido}`.trim();
    return (
      <Card relleno="lg">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
          <div className="flex min-w-0 items-center gap-4">
            {detalle ? (
              <FotoPerfil variante="compacta" detalle={detalle} nombre={nombreCompleto} onGuardado={setCambiado} />
            ) : (
              <Avatar nombre={nombreCompleto} tamano="lg" />
            )}
            <div className="min-w-0">
              <p className="truncate font-display text-xl font-semibold">{nombreCompleto}</p>
              <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-texto-2">
                {detalle?.perfil?.ciudad && <span>{ciudadLegible(detalle.perfil.ciudad)}</span>}
                <Badge tono={usuario.rol === 'admin' ? 'acento' : 'neutro'}>{usuario.rol === 'admin' ? 'Administrador' : 'Estudiante'}</Badge>
              </p>
            </div>
          </div>
          <dl className="ml-auto flex gap-8">
            <Cifra n={favs.cargando ? '-' : ids.length} t="Favoritas" />
            <Cifra n={busquedasRecientes().length} t="Búsquedas guardadas" />
          </dl>
        </div>
      </Card>
    );
  };

  const errorCarga = carga.error && !detalle;

  return (
    <>
      <title>Mi perfil · SAN</title>
      <EncabezadoPagina titulo="Mi perfil" descripcion="Tus datos, tus pesos de búsqueda y tus ofertas guardadas." />
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="min-w-0">
          {cabecera()}
          {errorCarga ? (
            <EmptyState
              className="mt-6"
              titulo="No pudimos cargar tu perfil"
              texto={carga.error ?? undefined}
              accion={
                <button type="button" className="font-medium text-acento-texto underline" onClick={carga.recargar}>
                  Reintentar
                </button>
              }
            />
          ) : (
            <Tabs
              className="mt-6"
              nombre="Secciones del perfil"
              valor={pestana}
              onCambio={cambiarPestana}
              tabs={[
                {
                  id: 'datos',
                  etiqueta: 'Datos',
                  contenido:
                    pestana === 'datos' &&
                    (detalle ? <FormularioDatos key={detalle.id} detalle={detalle} onGuardado={setCambiado} /> : <Skeleton className="h-48 max-w-2xl" />),
                },
                {
                  id: 'preferencias',
                  etiqueta: 'Preferencias',
                  contenido:
                    pestana === 'preferencias' &&
                    (detalle ? (
                      <PanelPreferencias usuarioId={detalle.id} inicial={detalle.preferencias} onGuardado={(p) => setCambiado({ ...detalle, preferencias: p })} />
                    ) : (
                      <Skeleton className="h-48 max-w-2xl" />
                    )),
                },
                {
                  id: 'favoritos',
                  etiqueta: 'Favoritos',
                  contenido:
                    pestana === 'favoritos' &&
                    (favs.cargando ? (
                      <div aria-busy>
                        <Skeleton className="h-24" />
                      </div>
                    ) : favs.error ? (
                      <EmptyState titulo="No pudimos cargar tus favoritos" texto={favs.error} />
                    ) : (
                      <ListaFavoritos usuarioId={id} ids={ids} onQuitado={(x) => setQuitados((q) => [...q, x])} />
                    )),
                },
              ]}
            />
          )}
        </div>
        <PanelLateral />
      </div>
    </>
  );
}
