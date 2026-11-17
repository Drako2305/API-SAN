import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Logo, Skeleton } from '@/componentes';
import { fotoPorSlug, type SlugCampus } from '@/lib/campus';
import { useCatalogoConteos } from '@/lib/useCatalogoConteos';
import { BotonTema } from '@/layout/BotonTema';

/** Auth a pantalla completa: formulario a la izquierda, panel oscuro con foto de campus y cifras reales a la derecha. */
export function AuthSplit({ children, foto = 'andes' }: { children: ReactNode; foto?: SlugCampus }) {
  const f = fotoPorSlug(foto);
  const { datos, cargando } = useCatalogoConteos();
  const cifras = datos
    ? [
        { n: datos.ofertas, t: 'ofertas académicas' },
        { n: datos.universidades, t: 'universidades' },
        { n: datos.ciudades.length, t: 'ciudades' },
      ]
    : [];

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="SAN, inicio">
            <Logo />
          </Link>
          <BotonTema />
        </div>
        <main id="contenido" className="mx-auto flex w-full max-w-[26rem] flex-1 flex-col justify-center py-10">
          {children}
        </main>
        <p className="text-xs text-texto-3">SAN es un proyecto académico. Los datos del catálogo son demostrativos.</p>
      </div>

      <aside
        aria-label="Sobre SAN"
        className="fondo-esquirlas esquirlas hidden lg:m-3 lg:flex lg:flex-col lg:justify-between lg:rounded-xl lg:p-12"
      >
        <img src={f.src} alt="" className="absolute inset-0 -z-30 size-full object-cover" />
        <div className="absolute inset-0 -z-20 bg-panel/90" />
        <div>
          <p aria-hidden className="logotipo mb-8 text-[clamp(3.5rem,7vw,6rem)]">
            APi-SAN
          </p>
          <p className="max-w-[18ch] font-display text-4xl leading-[1.08] font-semibold tracking-tight text-balance">
            Cada puntaje viene con su porqué.
          </p>
          <p className="mt-4 max-w-[44ch] text-sobre-panel-2">
            Busca programas por ciudad, costo, modalidad y jornada, y ordénalos según lo que pesa para ti.
          </p>
        </div>
        <div>
          <dl className="grid grid-cols-3 gap-4 border-t border-white/20 pt-6" aria-busy={cargando}>
            {cargando && [0, 1, 2].map((i) => <Skeleton key={i} className="h-14 bg-white/10" />)}
            {cifras.map((c) => (
              <div key={c.t}>
                <dd className="numeros font-display text-4xl font-semibold">{c.n}</dd>
                <dt className="text-sm text-sobre-panel-2">{c.t}</dt>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-xs text-sobre-panel-2">
            {f.universidad}, {f.ciudad}. Foto: {f.autor},{' '}
            <a href={f.fuente} className="text-sobre-panel underline" target="_blank" rel="noreferrer">
              {f.licencia}
            </a>
            .
          </p>
        </div>
      </aside>
    </div>
  );
}
