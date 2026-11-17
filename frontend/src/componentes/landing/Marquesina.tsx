import { useState } from 'react';
import { Link } from 'react-router';
import { Pause, Play } from 'lucide-react';
import { FotoConFallback } from '@/componentes/catalogo';
import { catalogo } from '@/lib/api';
import { Building2 } from 'lucide-react';
import { fotoUniversidad } from '@/lib/fotos';
import { ciudadLegible } from '@/lib/formato';
import type { Universidad } from '@/lib/modelos';
import { useCarga } from '@/lib/useCarga';

const CSS = `
.lp-pista { display: flex; width: max-content; gap: var(--gap-grilla); }
@media (prefers-reduced-motion: no-preference) {
  .lp-pista--mov { animation: lp-marquesina 60s linear infinite; }
  .lp-marco:hover .lp-pista--mov, .lp-marco:focus-within .lp-pista--mov, .lp-marco[data-pausa='true'] .lp-pista--mov { animation-play-state: paused; }
}
@media (prefers-reduced-motion: reduce) {
  .lp-pista { width: auto; flex-wrap: wrap; }
  .lp-lista { flex-wrap: wrap; }
  .lp-copia, .lp-pausa { display: none; }
}
@keyframes lp-marquesina { to { transform: translateX(calc(-50% - var(--gap-grilla) / 2)); } }
`;

function Item({ u }: { u: Universidad }) {
  const f = fotoUniversidad(u);
  return (
    <li className="h-20 w-72 shrink-0">
      <Link
        to={`/universidades/${u.id}`}
        className="flex h-full items-center gap-3 rounded-lg border border-borde bg-superficie p-2 pr-4 text-texto no-underline transition-colors hover:bg-superficie-2"
      >
        {/* Miniatura de tamaño fijo (con o sin foto) para que todas las fichas midan lo mismo. */}
        <FotoConFallback src={f.sm} width={800} height={450} icono={Building2} relleno className="h-full w-[5.5rem] shrink-0 rounded-md" />
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 block min-h-[2.5rem] text-sm leading-5 font-medium">{u.nombre}</span>
          <span className="block truncate text-xs text-texto-3">{ciudadLegible(u.ciudad)}</span>
        </span>
      </Link>
    </li>
  );
}

/** Tira infinita de universidades (animación CSS, pausa con hover/foco/botón). Con reduced motion es una lista estática. */
export function Marquesina() {
  const { datos, error } = useCarga(() => catalogo.universidades(), []);
  const [pausa, setPausa] = useState(false);
  if (error || (datos && datos.length === 0)) return null;
  return (
    <section aria-labelledby="titulo-unis" className="seccion-ritmo">
      <style>{CSS}</style>
      <div className="pagina-ancho mb-6 flex items-end justify-between gap-4">
        <h2 id="titulo-unis" className="titulo-display text-[clamp(1.5rem,3vw,2.25rem)] font-semibold">
          Universidades en el catálogo
        </h2>
        <button
          type="button"
          onClick={() => setPausa((p) => !p)}
          className="lp-pausa inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-texto-2 hover:bg-superficie-2 hover:text-texto"
        >
          {pausa ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
          {pausa ? 'Reanudar movimiento' : 'Pausar movimiento'}
        </button>
      </div>
      <div className="lp-marco overflow-hidden px-4 md:px-0" data-pausa={pausa} aria-busy={!datos} style={{ minHeight: '5rem' }}>
        {datos && (
          <div className="lp-pista lp-pista--mov">
            <ul className="lp-lista pista-tarjetas" aria-label="Universidades">
              {datos.map((u) => (
                <Item key={u.id} u={u} />
              ))}
            </ul>
            {/* Copia para el bucle continuo: oculta a lectores de pantalla y fuera del orden de tabulación. */}
            <ul className="lp-copia pista-tarjetas" aria-hidden inert>
              {datos.map((u) => (
                <Item key={u.id} u={u} />
              ))}
            </ul>
          </div>
        )}
      </div>
      <p className="pagina-ancho mt-4 text-xs text-texto-3">
        Fotos de Wikimedia Commons con licencia libre.{' '}
        <a href="/campus/CREDITOS.md" className="text-texto-2">
          Ver créditos
        </a>
        .
      </p>
    </section>
  );
}
