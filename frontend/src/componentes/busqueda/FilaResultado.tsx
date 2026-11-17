import { Link, useLocation } from 'react-router';
import { Heart } from 'lucide-react';
import { Badge, PuntajeBarra } from '@/componentes';
import { FotoConFallback } from '@/componentes/catalogo';
import { ciudadLegible, etiquetaJornada, etiquetaModalidad, formatoCop, nombreLegible } from '@/lib/formato';
import { fotoCarrera } from '@/lib/fotos';
import type { Pesos, ResultadoBusqueda } from '@/lib/modelos';
import { HeartMorph, MorphingRing } from '@/morphing';

interface Props {
  resultado: ResultadoBusqueda;
  pesos?: Pesos;
  /** `null` si no hay sesión: el corazón lleva a ingresar. */
  favorito: boolean | null;
  onFavorito: (activo: boolean) => void;
  seleccionada: boolean;
  /** Ya hay 4 elegidas y esta no es una de ellas. */
  bloqueada: boolean;
  onComparar: () => void;
}

export function FilaResultado({ resultado, pesos, favorito, onFavorito, seleccionada, bloqueada, onComparar }: Props) {
  const { oferta, puntaje, desglose } = resultado;
  const ubicacion = useLocation();
  const carrera = nombreLegible(oferta.carrera);
  const foto = fotoCarrera({ nombre: oferta.carrera, imagenUrl: oferta.carreraImagenUrl });

  return (
    <li className="grid gap-x-5 gap-y-4 p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_17rem]">
      <div className="flex min-w-0 gap-3.5">
        <FotoConFallback
          src={foto.src}
          sm={foto.sm}
          sizes="80px"
          width={160}
          height={160}
          className="size-16 shrink-0 self-start rounded-lg sm:size-20"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg leading-snug">
            <Link to={`/ofertas/${oferta.id}`} className="text-texto no-underline hover:text-acento-texto hover:underline">
              {carrera}
            </Link>
          </h3>
          <p className="text-sm text-texto-2">
            {oferta.universidad} · {ciudadLegible(oferta.ciudad)}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <Badge>{etiquetaModalidad(oferta.modalidad)}</Badge>
            <Badge>{etiquetaJornada(oferta.jornada)}</Badge>
            <Badge tono={oferta.acreditacion ? 'ok' : 'neutro'}>{oferta.acreditacion ? 'Acreditada' : 'Sin acreditación'}</Badge>
          </div>
          <p className="mt-3 text-sm text-texto-2">
            <span className="numeros font-display text-lg font-semibold text-texto">{formatoCop(oferta.costo)}</span> por periodo ·{' '}
            <span className="numeros">{oferta.duracion}</span> periodos
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <label className="inline-flex min-h-8 cursor-pointer items-center gap-2 text-sm font-medium has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
              <input
                type="checkbox"
                className="size-4 cursor-pointer accent-[var(--color-acento)] disabled:cursor-not-allowed"
                checked={seleccionada}
                disabled={bloqueada}
                onChange={onComparar}
                title={bloqueada ? 'Ya elegiste 4 ofertas para comparar' : undefined}
              />
              Comparar<span className="sr-only"> {carrera} en {oferta.universidad}</span>
            </label>
            {favorito === null ? (
              <Link
                to={`/ingresar?returnUrl=${encodeURIComponent(ubicacion.pathname + ubicacion.search)}`}
                className="inline-flex min-h-8 items-center gap-1.5 text-sm font-medium no-underline"
                aria-label={`Inicia sesión para guardar ${carrera} en ${oferta.universidad} en favoritos`}
              >
                <Heart className="size-5" aria-hidden />
                Guardar
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                <HeartMorph
                  activo={favorito}
                  onCambio={onFavorito}
                  tamano={22}
                  color="var(--color-acento)"
                  etiqueta={favorito ? `Quitar ${carrera} en ${oferta.universidad} de favoritos` : `Guardar ${carrera} en ${oferta.universidad} en favoritos`}
                  className="size-8"
                />
                <span aria-hidden>{favorito ? 'Guardada' : 'Guardar'}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-borde pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-5">
        <div className="flex items-center gap-3">
          <MorphingRing valor={puntaje} cargando={false} tamano={52} color="var(--color-acento)" className="shrink-0" />
          <p className="text-sm text-texto-2">Puntaje de afinidad</p>
        </div>
        <PuntajeBarra puntaje={puntaje} desglose={desglose} pesos={pesos} className="gap-0 [&>div:first-child]:hidden" />
      </div>
    </li>
  );
}
