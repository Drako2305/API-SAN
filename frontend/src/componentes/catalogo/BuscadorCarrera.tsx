import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { MapPin, Search } from 'lucide-react';
import { Button, ComboCarrera, Selector } from '@/componentes';
import { carreraExacta } from '@/componentes/ComboCarrera';
import { ciudadLegible } from '@/lib/formato';
import type { Carrera } from '@/lib/modelos';
import { useCatalogoCompleto } from '@/lib/useCatalogoConteos';

/**
 * Buscador de entrada (portada e inicio): carrera con sugerencias del catálogo y ciudad.
 * Elegir una carrera lleva directo a sus ofertas (`/carreras/:id`, con la ciudad como filtro);
 * un texto que no es una carrera exacta abre el catálogo filtrado por ese texto.
 */
export function BuscadorCarrera({ className }: { className?: string }) {
  const navegar = useNavigate();
  const { datos } = useCatalogoCompleto();
  const [carrera, setCarrera] = useState('');
  const [ciudad, setCiudad] = useState('');

  const ciudades = useMemo(() => [...new Set((datos?.universidades ?? []).map((u) => u.ciudad))].sort((a, b) => a.localeCompare(b, 'es')), [datos]);

  const irACarrera = (c: Carrera) => navegar(`/carreras/${c.id}${ciudad ? `?ciudad=${encodeURIComponent(ciudad)}` : ''}`, { viewTransition: true });

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const texto = carrera.trim();
    const exacta = carreraExacta(datos?.carreras, texto);
    if (exacta) return irACarrera(exacta);
    navegar(texto ? `/carreras?nombre=${encodeURIComponent(texto)}` : '/carreras', { viewTransition: true });
  };

  return (
    <search className={className}>
      <form
        onSubmit={enviar}
        className="grid gap-2 rounded-xl border border-borde-fuerte bg-superficie p-2 shadow-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,12.5rem)_auto] sm:items-center sm:rounded-full sm:py-1.5 sm:pr-1.5 sm:pl-3"
      >
        <ComboCarrera
          etiqueta="¿Qué quieres estudiar?"
          etiquetaOculta
          variante="plano"
          icono={<Search />}
          placeholder="¿Qué quieres estudiar?"
          carreras={datos?.carreras}
          texto={carrera}
          onTexto={setCarrera}
          onElegir={irACarrera}
          className="gap-0"
        />
        <Selector
          etiqueta="Ciudad"
          etiquetaOculta
          variante="plano"
          icono={<MapPin />}
          valor={ciudad}
          onCambio={setCiudad}
          opciones={[{ valor: '', etiqueta: 'Cualquier ciudad' }, ...ciudades.map((c) => ({ valor: c, etiqueta: ciudadLegible(c) }))]}
          className="gap-0 sm:border-l sm:border-borde sm:pl-2"
          claseBoton="px-3"
        />
        <Button type="submit" tamano="lg" className="sm:rounded-full" icono={<Search className="size-4" aria-hidden />}>
          Buscar
        </Button>
      </form>
    </search>
  );
}
