import { useId, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { MapPin, Search } from 'lucide-react';
import { Button } from '@/componentes';
import { ciudadLegible, nombreLegible } from '@/lib/formato';
import { useCatalogoCompleto } from '@/lib/useCatalogoConteos';
import { cn } from '@/lib/cn';

/**
 * Buscador de entrada (portada e inicio): carrera con sugerencias del catálogo y ciudad. Lleva a /buscar?carrera=&ciudad=.
 * Las sugerencias y las ciudades salen de la API; sin datos sigue funcionando como texto libre.
 */
export function BuscadorCarrera({ className }: { className?: string }) {
  const navegar = useNavigate();
  const idLista = useId();
  const { datos } = useCatalogoCompleto();
  const [carrera, setCarrera] = useState('');
  const [ciudad, setCiudad] = useState('');

  const ciudades = useMemo(() => [...new Set((datos?.universidades ?? []).map((u) => u.ciudad))].sort((a, b) => a.localeCompare(b, 'es')), [datos]);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (carrera.trim()) params.set('carrera', carrera.trim());
    if (ciudad) params.set('ciudad', ciudad);
    const q = params.toString();
    navegar(q ? `/buscar?${q}` : '/buscar', { viewTransition: true });
  };

  return (
    <search className={className}>
      <form
        onSubmit={enviar}
        className="grid gap-2 rounded-xl border border-borde-fuerte bg-superficie p-2 shadow-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,13rem)_auto] sm:items-center sm:rounded-full sm:py-1.5 sm:pr-1.5 sm:pl-5"
      >
        <label className="relative flex items-center">
          <span className="sr-only">¿Qué quieres estudiar?</span>
          <Search className="pointer-events-none absolute left-3 size-4 text-texto-3 sm:left-0" aria-hidden />
          <input
            type="text"
            list={idLista}
            value={carrera}
            onChange={(e) => setCarrera(e.target.value)}
            placeholder="¿Qué quieres estudiar?"
            autoComplete="off"
            enterKeyHint="search"
            className="h-11 w-full rounded-lg bg-transparent pr-3 pl-9 text-base placeholder:text-texto-3 focus-visible:outline-offset-0 sm:pl-7"
          />
          <datalist id={idLista}>
            {(datos?.carreras ?? []).map((c) => (
              <option key={c.id} value={c.nombre} label={nombreLegible(c.nombre)} />
            ))}
          </datalist>
        </label>
        <label className="relative flex items-center sm:border-l sm:border-borde sm:pl-3">
          <span className="sr-only">Ciudad</span>
          <MapPin className="pointer-events-none absolute left-3 size-4 text-texto-3 sm:left-6" aria-hidden />
          <select
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            className={cn('h-11 w-full rounded-lg bg-transparent pr-2 pl-9 text-base sm:pl-8', ciudad ? 'text-texto' : 'text-texto-3')}
          >
            <option value="">Cualquier ciudad</option>
            {ciudades.map((c) => (
              <option key={c} value={c}>
                {ciudadLegible(c)}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" tamano="lg" className="sm:rounded-full" icono={<Search className="size-4" aria-hidden />}>
          Buscar
        </Button>
      </form>
    </search>
  );
}
