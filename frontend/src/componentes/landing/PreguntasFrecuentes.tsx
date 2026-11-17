import { useRef } from 'react';
import { Link } from 'react-router';
import { ChevronDown } from 'lucide-react';
import { useRevelado } from './gsap';

const PREGUNTAS: Array<{ q: string; r: React.ReactNode }> = [
  {
    q: '¿Cómo se calcula el puntaje?',
    r: (
      <>
        Cada oferta recibe un puntaje de 0 a 100 al buscar. Sale de cuatro criterios (costo, modalidad, ubicación y acreditación), cada uno con un valor de 0 a 1 que
        ves en el desglose, combinados con los pesos que tú elegiste. El mismo catálogo con otros pesos da otro orden.
      </>
    ),
  },
  {
    q: '¿Qué son los pesos?',
    r: (
      <>
        Es cuánto importa cada criterio para ti, de 0 a 5. Un criterio en 0 no cuenta para el puntaje; uno en 5 pesa el máximo. SAN no impone un orden
        universal: la lista se ordena según lo que tú marcas en <Link to="/buscar">la búsqueda</Link>.
      </>
    ),
  },
  {
    q: '¿Qué significa que una oferta esté acreditada?',
    r: <>Cada oferta del catálogo trae una marca de acreditada o no. Se muestra como una etiqueta y cuenta como un criterio más, con el peso que le des.</>,
  },
  {
    q: '¿De dónde salen los datos?',
    r: (
      <>
        De la API de SAN: carreras, universidades y ofertas con su costo por periodo, modalidad, jornada, duración y código SNIES. Los datos del catálogo son
        demostrativos y no hay conexión en vivo con el SNIES, así que confirma costos y fechas con cada institución antes de decidir.
      </>
    ),
  },
  {
    q: '¿Necesito una cuenta?',
    r: (
      <>
        No para explorar: el catálogo, la búsqueda y la comparación (de 2 a 4 ofertas lado a lado) son públicos. Con cuenta puedes guardar favoritos y
        retomar tus búsquedas desde el perfil.
      </>
    ),
  },
];

/** Preguntas frecuentes con `<details>` nativo (sin exclusividad: se pueden abrir varias para compararlas). */
export function PreguntasFrecuentes() {
  const raiz = useRef<HTMLElement>(null);
  useRevelado(raiz, []);
  return (
    <section ref={raiz} aria-labelledby="titulo-faq" className="pagina-ancho seccion-ritmo grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
      <div>
        <h2 id="titulo-faq" className="titulo-display text-[clamp(1.5rem,3vw,2.25rem)] font-semibold">
          Preguntas frecuentes
        </h2>
        <p className="texto-medida mt-3 text-texto-2">Cómo funciona SAN, en pocas líneas.</p>
      </div>
      <div className="flex flex-col gap-2">
        {PREGUNTAS.map((p) => (
          <details key={p.q} data-revela className="faq-item group rounded-lg border border-borde bg-superficie open:border-borde-fuerte">
            <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-4 rounded-lg px-4 py-3 font-medium">
              {p.q}
              <ChevronDown className="size-5 shrink-0 text-texto-3 transition-transform duration-[var(--dur-media)] group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
            </summary>
            <p className="texto-medida px-4 pb-4 text-texto-2">{p.r}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
