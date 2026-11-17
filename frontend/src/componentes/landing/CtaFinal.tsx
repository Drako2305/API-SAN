import { ArrowRight } from 'lucide-react';
import { Button, LinkButton } from '@/componentes';
import { useSesion } from '@/lib/sesion';
import { TextMorph } from '@/morphing';

/** Cierre de la portada: la palabra que cambia (Encuentra, Compara, Decide) es decorativa; el titular completo va en texto. */
export function CtaFinal({ onRegistro }: { onRegistro: () => void }) {
  const { autenticado } = useSesion();
  return (
    <section aria-labelledby="titulo-final" className="fondo-esquirlas esquirlas">
      <div className="pagina-ancho py-24 text-center">
        <p aria-hidden className="logotipo mb-8 text-[clamp(3rem,9vw,6rem)] text-sobre-panel">
          APi-SAN
        </p>
        <h2 id="titulo-final" className="titulo-display font-semibold">
          <span className="sr-only">Encuentra, compara y decide tu carrera.</span>
          <span aria-hidden className="flex flex-col items-center gap-1 text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.05]">
            <TextMorph
              palabras={['Encuentra', 'Compara', 'Decide']}
              duracion={1.8}
              decorativo
              className="h-[1.15em]! min-w-0! text-[1em]! font-semibold! text-sobre-panel"
            />
            <span className="text-sobre-panel-2">tu carrera con el porqué a la vista.</span>
          </span>
        </h2>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {autenticado ? (
            <LinkButton to="/buscar" variante="sobrePanel" tamano="lg" icono={<ArrowRight className="size-4" aria-hidden />}>
              Buscar una carrera
            </LinkButton>
          ) : (
            <Button variante="sobrePanel" tamano="lg" onClick={onRegistro} icono={<ArrowRight className="size-4" aria-hidden />}>
              Crear cuenta gratis
            </Button>
          )}
          <LinkButton to="/comparar" variante="contornoPanel" tamano="lg">
            Comparar ofertas
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
