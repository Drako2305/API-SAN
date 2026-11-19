import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { Badge, EmptyState, EncabezadoPagina, Input, claseBoton } from '@/componentes';
import { Cargando, FotoConFallback } from '@/componentes/catalogo';
import { catalogo } from '@/lib/api';
import { cn } from '@/lib/cn';
import { etiquetaArea, iconoArea } from '@/lib/areas';
import { fotoCarrera } from '@/lib/fotos';
import { nombreLegible } from '@/lib/formato';
import type { Carrera, OfertaAcademica } from '@/lib/modelos';
import { useCarga } from '@/lib/useCarga';
import { useTituloPagina } from '@/lib/useTituloPagina';

const CHIP = 'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors';

function TarjetaCarrera({ carrera, ofertas }: { carrera: Carrera; ofertas: OfertaAcademica[] | null }) {
  const nombre = nombreLegible(carrera.nombre);
  const n = ofertas?.length;
  const proximamente = n === 0;
  const foto = fotoCarrera(carrera);
  return (
    <li>
      <article
        className={cn(
          'group relative flex h-full flex-col overflow-hidden rounded-lg border border-borde bg-superficie transition-[box-shadow,border-color] duration-[var(--dur-rapida)]',
          !proximamente && 'hover:border-borde-fuerte hover:shadow-2',
        )}
      >
        <FotoConFallback
          src={foto.src}
          sm={foto.sm}
          sizes="(min-width: 1280px) 22rem, (min-width: 640px) 45vw, 100vw"
          width={800}
          height={450}
          area={carrera.area}
          className={cn('aspect-[16/9]', proximamente && 'opacity-60 saturate-50')}
        />
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="min-w-0">
            <h2 className="line-clamp-2 min-h-[2.75rem] text-base font-semibold">{nombre}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
              {carrera.area && <Badge tono="acento">{etiquetaArea(carrera.area)}</Badge>}
              <span className="numeros text-sm text-texto-3">
                {n === undefined ? ' ' : proximamente ? 'Próximamente' : `${n} ${n === 1 ? 'oferta' : 'ofertas'}`}
              </span>
            </div>
          </div>
          {proximamente ? (
            <p className="mt-auto text-sm text-texto-3">Aún no hay universidades que la ofrezcan.</p>
          ) : (
            <Link
              to={`/carreras/${carrera.id}`}
              viewTransition
              className={claseBoton('secundario', 'sm', 'mt-auto no-underline after:absolute after:inset-0 after:content-[""]')}
            >
              Ver ofertas <span className="sr-only">de {nombre}</span>
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
        </div>
      </article>
    </li>
  );
}

export default function Carreras() {
  useTituloPagina('Carreras');
  const [params, setParams] = useSearchParams();
  const nombre = params.get('nombre') ?? '';
  const area = params.get('area') ?? '';
  const [texto, setTexto] = useState(nombre);
  const busquedaRef = useRef<HTMLElement>(null);

  // Atajo "/": enfoca el campo de búsqueda, salvo que la persona ya esté escribiendo en un campo.
  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || e.isComposing || e.defaultPrevented) return;
      const destino = e.target as HTMLElement | null;
      if (destino?.isContentEditable || destino?.tagName === 'INPUT' || destino?.tagName === 'TEXTAREA' || destino?.tagName === 'SELECT') return;
      const campo = busquedaRef.current?.querySelector('input');
      if (!campo) return;
      e.preventDefault();
      campo.focus();
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, []);

  // Búsqueda con retardo: la URL (?nombre) se actualiza cuando la persona deja de escribir.
  useEffect(() => {
    const t = setTimeout(() => {
      const limpio = texto.trim();
      if (limpio === nombre) return;
      const siguiente = new URLSearchParams(params);
      if (limpio) siguiente.set('nombre', limpio);
      else siguiente.delete('nombre');
      setParams(siguiente, { replace: true });
    }, 300);
    return () => clearTimeout(t);
  }, [texto, nombre, params, setParams]);

  const elegirArea = (a: string) => {
    const siguiente = new URLSearchParams(params);
    if (a) siguiente.set('area', a);
    else siguiente.delete('area');
    setParams(siguiente, { replace: true });
  };

  const todas = useCarga(() => catalogo.carreras(), []);
  const carreras = useCarga(() => catalogo.carreras({ nombre: nombre || undefined, area: area || undefined }), [nombre, area]);
  const areas = useMemo(() => [...new Set((todas.datos ?? []).flatMap((c) => (c.area ? [c.area] : [])))].sort((a, b) => a.localeCompare(b, 'es')), [todas.datos]);
  const ofertas = useCarga(() => catalogo.ofertas(), []);

  const porCarrera = useMemo(() => {
    const m = new Map<string, OfertaAcademica[]>();
    for (const o of ofertas.datos ?? []) {
      const k = o.carreraId ?? o.carrera;
      m.set(k, [...(m.get(k) ?? []), o]);
    }
    return m;
  }, [ofertas.datos]);
  const deCarrera = (c: Carrera) => (ofertas.datos ? (porCarrera.get(c.id) ?? porCarrera.get(c.nombre) ?? []) : null);

  const lista = carreras.datos;

  return (
    <>
      <EncabezadoPagina titulo="Carreras" descripcion="Elige una carrera para ver en qué universidades se ofrece, cuánto cuesta y en qué modalidad." />

      <search ref={busquedaRef} className="mb-4 block max-w-md">
        <Input etiqueta="Buscar carrera" type="search" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Por ejemplo, Psicología" autoComplete="off" aria-keyshortcuts="/" />
      </search>

      {areas.length > 0 && (
        <div role="group" aria-label="Filtrar por área" className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
          {[['', 'Todas'], ...areas.map((a) => [a, etiquetaArea(a)])].map(([valor, etiqueta]) => {
            const activo = valor === area;
            const Icono = valor ? iconoArea(valor) : GraduationCap;
            return (
              <button
                key={valor}
                type="button"
                aria-pressed={activo}
                onClick={() => elegirArea(valor!)}
                className={cn(CHIP, activo ? 'border-acento-borde bg-acento-suave text-acento-texto' : 'border-borde bg-superficie text-texto-2 hover:bg-superficie-2')}
              >
                <Icono className="size-4" aria-hidden />
                {etiqueta}
              </button>
            );
          })}
        </div>
      )}

      <p role="status" className="numeros mb-4 min-h-5 text-sm text-texto-3">
        {lista && !carreras.cargando ? `${lista.length} ${lista.length === 1 ? 'carrera' : 'carreras'}` : ''}
      </p>

      {carreras.error ? (
        <EmptyState icono={<GraduationCap />} titulo="No pudimos cargar las carreras" texto={carreras.error} accion={<button type="button" className="font-medium text-acento-texto" onClick={carreras.recargar}>Intentar de nuevo</button>} />
      ) : !lista ? (
        <Cargando filas={3} alto="h-64" />
      ) : lista.length === 0 ? (
        <EmptyState icono={<GraduationCap />} titulo="Ninguna carrera coincide" texto={nombre ? `No hay carreras que contengan "${nombre}"${area ? ` en ${etiquetaArea(area)}` : ''}. Prueba con otra palabra.` : `No hay carreras en el área ${etiquetaArea(area)}.`} accion={<button type="button" className="font-medium text-acento-texto" onClick={() => { setTexto(''); setParams({}, { replace: true }); }}>Ver todas las carreras</button>} />
      ) : (
        <ul aria-busy={carreras.cargando} className="rejilla-tarjetas">
          {lista.map((c) => (
            <TarjetaCarrera key={c.id} carrera={c} ofertas={deCarrera(c)} />
          ))}
        </ul>
      )}
    </>
  );
}
