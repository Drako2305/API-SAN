import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { Button, Card, LinkButton, Skeleton, Slider } from '@/componentes';
import { catalogo } from '@/lib/api';
import { fotoDeUniversidad, fotoPorSlug, type SlugCampus } from '@/lib/campus';
import { CRITERIO_ETIQUETA, ciudadLegible } from '@/lib/formato';
import { CRITERIOS, type Pesos } from '@/lib/modelos';
import { useSesion } from '@/lib/sesion';
import { useCarga } from '@/lib/useCarga';
import { useCatalogoConteos } from '@/lib/useCatalogoConteos';
import { RegistroDialog } from './auth/RegistroDialog';

function Foto({ slug, className, prioridad }: { slug: SlugCampus; className?: string; prioridad?: boolean }) {
  const f = fotoPorSlug(slug);
  return (
    <figure className={`relative m-0 overflow-hidden rounded-xl bg-superficie-2 ${className ?? ''}`}>
      <img
        src={f.sm}
        srcSet={`${f.sm} 800w, ${f.src} 1600w`}
        sizes="(min-width: 1024px) 22rem, 45vw"
        alt={`Campus de la ${f.universidad}, ${f.ciudad}`}
        width={800}
        height={450}
        loading={prioridad ? 'eager' : 'lazy'}
        fetchPriority={prioridad ? 'high' : undefined}
        className="size-full object-cover"
      />
      <figcaption className="absolute bottom-2 left-2 rounded-full bg-superficie/90 px-2.5 py-1 text-xs font-medium text-texto backdrop-blur-sm">
        {f.universidad}
      </figcaption>
    </figure>
  );
}

function Hero({ onRegistro }: { onRegistro: () => void }) {
  const { autenticado } = useSesion();
  return (
    <section className="mx-auto grid max-w-[80rem] items-center gap-12 px-4 pt-28 pb-16 md:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:pt-32 lg:pb-24">
      <div>
        <h1 className="titulo-display max-w-[16ch] text-[clamp(2.5rem,6vw,4.75rem)] leading-[1.02] font-semibold">
          Compara carreras con un puntaje que puedes explicar.
        </h1>
        <p className="mt-6 max-w-[52ch] text-lg text-texto-2">
          Busca por ciudad, costo, modalidad y jornada. Tú decides cuánto pesa cada criterio y SAN te muestra el porqué de cada resultado.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {autenticado ? (
            <LinkButton to="/buscar" tamano="lg" icono={<ArrowRight className="size-4" aria-hidden />}>
              Buscar una carrera
            </LinkButton>
          ) : (
            <Button tamano="lg" onClick={onRegistro} icono={<ArrowRight className="size-4" aria-hidden />}>
              Crear cuenta gratis
            </Button>
          )}
          <LinkButton to="/carreras" variante="secundario" tamano="lg">
            Explorar el catálogo
          </LinkButton>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4" aria-label="Fotos de campus universitarios">
        <div className="flex flex-col gap-3 sm:gap-4">
          <Foto slug="nacional" prioridad className="aspect-[4/5]" />
          <Foto slug="andes" className="aspect-[4/3]" />
        </div>
        <div className="flex flex-col gap-3 pt-10 sm:gap-4 sm:pt-14">
          <Foto slug="antioquia" className="aspect-[4/3]" />
          <Foto slug="javeriana" className="aspect-[4/5]" />
        </div>
      </div>
    </section>
  );
}

function Cifras() {
  const { datos, cargando, error } = useCatalogoConteos();
  if (error) return null;
  const items = datos
    ? [
        { n: datos.carreras, t: datos.carreras === 1 ? 'carrera' : 'carreras' },
        { n: datos.universidades, t: datos.universidades === 1 ? 'universidad' : 'universidades' },
        { n: datos.ofertas, t: datos.ofertas === 1 ? 'oferta académica' : 'ofertas académicas' },
        { n: datos.ciudades.length, t: datos.ciudades.length === 1 ? 'ciudad' : 'ciudades' },
      ]
    : [];
  return (
    <section aria-label="El catálogo en cifras" className="border-y border-borde bg-superficie">
      <dl className="mx-auto grid max-w-[80rem] grid-cols-2 gap-6 px-4 py-8 md:grid-cols-4 md:px-8" aria-busy={cargando}>
        {cargando && [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}
        {items.map((c) => (
          <div key={c.t} className="flex items-baseline gap-2.5">
            <dd className="numeros font-display text-4xl font-semibold">{c.n}</dd>
            <dt className="text-sm text-texto-2">{c.t}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Pesos() {
  const [pesos, setPesos] = useState<Pesos>({ costo: 3, modalidad: 2, ubicacion: 3, acreditacion: 4 });
  return (
    <section className="mx-auto grid max-w-[80rem] items-center gap-10 px-4 py-20 md:px-8 lg:grid-cols-2 lg:gap-20">
      <div>
        <h2 className="titulo-display max-w-[20ch] text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold">Tú pones los pesos, SAN hace la cuenta.</h2>
        <p className="mt-4 max-w-[56ch] text-texto-2">
          Para una persona lo que más pesa es el costo; para otra, la jornada nocturna o la acreditación. Cada criterio va de 0 a 5 y el puntaje de cada oferta
          muestra cuánto aportó cada uno.
        </p>
        <Link to="/buscar" className="mt-6 inline-flex items-center gap-1.5 font-medium">
          Probar una búsqueda <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      <Card variante="elevada" relleno="lg" aria-label="Ejemplo de pesos por criterio">
        <p className="mb-5 text-sm text-texto-2">Mueve los controles: así eliges qué importa en tu búsqueda.</p>
        <div className="flex flex-col gap-5">
          {CRITERIOS.map((c) => (
            <Slider key={c} etiqueta={CRITERIO_ETIQUETA[c]} valor={pesos[c]} onCambio={(v) => setPesos((p) => ({ ...p, [c]: v }))} />
          ))}
        </div>
      </Card>
    </section>
  );
}

function Universidades() {
  const { datos, cargando, error } = useCarga(() => catalogo.universidades(), []);
  if (error) return null;
  return (
    <section className="mx-auto max-w-[80rem] px-4 pb-20 md:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="titulo-display text-[clamp(1.5rem,3vw,2.25rem)] font-semibold">Universidades en el catálogo</h2>
        <Link to="/universidades" className="shrink-0 text-sm font-medium">
          Ver todas
        </Link>
      </div>
      <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-3 md:mx-0 md:px-0" aria-busy={cargando}>
        {cargando && [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-56 w-64 shrink-0 rounded-lg" />)}
        {datos?.map((u) => {
          const f = fotoDeUniversidad(u.nombre);
          return (
            <li key={u.id} className="w-64 shrink-0 snap-start">
              <Link to={`/universidades/${u.id}`} className="group block overflow-hidden rounded-lg border border-borde bg-superficie text-texto no-underline transition-shadow hover:shadow-2">
                <div className="aspect-[16/9] bg-superficie-2">
                  {f && <img src={f.sm} alt="" width={800} height={450} loading="lazy" className="size-full object-cover" />}
                </div>
                <div className="p-3.5">
                  <p className="line-clamp-2 min-h-[2.5rem] font-medium">{u.nombre}</p>
                  <p className="mt-0.5 text-sm text-texto-3">{ciudadLegible(u.ciudad)}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs text-texto-3">
        Fotos de Wikimedia Commons con licencia libre.{' '}
        <a href="/campus/CREDITOS.md" className="text-texto-2">
          Ver créditos
        </a>
        .
      </p>
    </section>
  );
}

export default function Landing() {
  const [registro, setRegistro] = useState(false);
  return (
    <>
      <title>SAN · Encuentra y compara carreras en Colombia</title>
      <Hero onRegistro={() => setRegistro(true)} />
      <Cifras />
      <Pesos />
      <Universidades />
      <RegistroDialog abierto={registro} onCerrar={() => setRegistro(false)} />
    </>
  );
}
