import { useEffect, useId, useRef, useState, useSyncExternalStore, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { LogIn, Menu, Search, UserPlus } from 'lucide-react';
import { ComboCarrera, Logo, LinkButton } from '@/componentes';
import { carreraExacta } from '@/componentes/ComboCarrera';
import { catalogo } from '@/lib/api';
import type { Carrera } from '@/lib/modelos';
import { useCarga } from '@/lib/useCarga';
import { cn } from '@/lib/cn';
import { useSesion } from '@/lib/sesion';
import { BotonTema } from './BotonTema';
import { MenuUsuario } from './MenuUsuario';
import { ITEMS_NAV, ITEMS_PUBLICOS, estaActivo } from './navegacion';

const CONSULTA_ANCHO = '(min-width: 768px)';

function suscribirAncho(cb: () => void) {
  const mq = window.matchMedia?.(CONSULTA_ANCHO);
  mq?.addEventListener?.('change', cb);
  return () => mq?.removeEventListener?.('change', cb);
}
const anchoActual = () => window.matchMedia?.(CONSULTA_ANCHO).matches ?? true;

/** `true` cuando caben los items en línea; en pantallas angostas se vuelven un panel desplegable. */
const useAncho = () => useSyncExternalStore(suscribirAncho, anchoActual, () => true);

export type VarianteCabecera = 'app' | 'portada';

/**
 * Cabecera única de SAN (portada y aplicación): misma altura, mismo ancho, mismo logo y acciones con ícono y texto.
 * `variante="portada"` va sin buscador (el hero ya trae el suyo) y se ve transparente sobre el hero hasta que se desplaza.
 * Barra superior fija: logo, navegación con ícono y texto, búsqueda, tema y cuenta.
 * Una sola lista de enlaces: en línea desde 768 px (con etiquetas completas desde ~1100 px) y, más angosta,
 * un `popover` nativo abierto por el botón de menú (Esc, clic fuera y retorno del foco los da el navegador).
 */
export function NavSuperior({ variante = 'app' }: { variante?: VarianteCabecera }) {
  const { autenticado, esAdmin } = useSesion();
  const ubicacion = useLocation();
  const navegar = useNavigate();
  const ancho = useAncho();
  const idMenu = useId();
  const panel = useRef<HTMLUListElement>(null);
  const [consulta, setConsulta] = useState('');
  const [abierto, setAbierto] = useState(false);
  const [desplazado, setDesplazado] = useState(false);

  useEffect(() => {
    const alDesplazar = () => setDesplazado(window.scrollY > 4);
    alDesplazar();
    window.addEventListener('scroll', alDesplazar, { passive: true });
    return () => window.removeEventListener('scroll', alDesplazar);
  }, []);

  // Al pasar a diseño ancho el popover deja de existir: se reinicia el estado.
  useEffect(() => {
    if (ancho) setAbierto(false);
  }, [ancho]);

  // Carreras para las sugerencias del buscador (solo en la variante con buscador).
  const carreras = useCarga(() => (variante === 'app' ? catalogo.carreras() : Promise.resolve(null)), [variante]);
  const irACarrera = (c: Carrera) => {
    setConsulta('');
    navegar(`/carreras/${c.id}`, { viewTransition: true });
  };
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const q = consulta.trim();
    const exacta = carreraExacta(carreras.datos, q);
    if (exacta) return irACarrera(exacta);
    navegar(q ? `/carreras?nombre=${encodeURIComponent(q)}` : '/carreras', { viewTransition: true });
  };

  const items = autenticado ? ITEMS_NAV.filter((i) => !i.soloAdmin || esAdmin) : ITEMS_PUBLICOS;
  const conBuscador = variante === 'app';
  // Con muchos destinos (o con buscador) solo la página actual conserva su texto entre 768 y 1099 px.
  const compacto = conBuscador || items.length > 3;
  const cerrarPanel = () => {
    if (!ancho) panel.current?.hidePopover?.();
  };

  return (
    <header
      data-desplazado={desplazado || undefined}
      data-variante={variante}
      className={cn(
        'cabecera-san sticky top-0 z-30 border-b transition-[background-color,border-color,box-shadow] duration-[var(--dur-media)]',
        desplazado ? 'border-borde bg-fondo/85 shadow-1 backdrop-blur-md supports-[backdrop-filter]:bg-fondo/75' : 'border-transparent bg-transparent',
      )}
    >
      <div className="pagina-ancho flex flex-wrap items-center gap-x-1.5 gap-y-2 py-2 md:h-[var(--barra)] md:flex-nowrap md:gap-x-3 md:py-0">
        <button
          type="button"
          popoverTarget={idMenu}
          popoverTargetAction="toggle"
          aria-controls={idMenu}
          aria-expanded={abierto}
          className={cn(
            'grid size-10 shrink-0 place-items-center rounded-md text-texto-2 transition-colors hover:bg-superficie-2 hover:text-texto',
            ancho && 'hidden',
          )}
          style={{ anchorName: '--boton-menu' } as React.CSSProperties}
        >
          <Menu className="size-5" aria-hidden />
          <span className="sr-only">Menú</span>
        </button>

        <Link to={autenticado ? '/inicio' : '/'} viewTransition className="shrink-0 rounded-lg" aria-label="Ir al inicio de SAN">
          <Logo conNombre={false} />
        </Link>

        <nav aria-label="Principal" className="max-md:contents md:shrink-0">
          <ul
            ref={panel}
            id={idMenu}
            popover={ancho ? undefined : 'auto'}
            onToggle={(e) => setAbierto((e.nativeEvent as Event & { newState?: string }).newState === 'open')}
            className={cn(ancho ? 'flex items-center gap-0.5' : 'panel-nav m-0 list-none rounded-xl border border-borde bg-superficie p-2 text-texto shadow-3')}
          >
            {items.map((item) => {
              const activo = estaActivo(item, ubicacion.pathname, ubicacion.search);
              const Icono = item.icono;
              return (
                <li key={item.a}>
                  <Link
                    to={item.a}
                    viewTransition
                    aria-current={activo ? 'page' : undefined}
                    title={ancho && !activo ? item.etiqueta : undefined}
                    onClick={cerrarPanel}
                    className={cn(
                      'relative flex items-center gap-2.5 rounded-md text-sm font-medium no-underline transition-colors duration-[var(--dur-rapida)]',
                      ancho ? 'h-9 px-2.5' : 'h-11 px-3 text-base',
                      activo ? 'bg-acento-suave font-semibold text-acento-texto' : 'text-texto-2 hover:bg-superficie-2 hover:text-texto',
                      ancho && activo && 'after:absolute after:inset-x-2.5 after:-bottom-[0.6rem] after:h-0.5 after:rounded-full after:bg-acento',
                    )}
                  >
                    <Icono className="size-[1.15rem] shrink-0" aria-hidden />
                    <span className={cn(ancho && !activo && compacto && 'max-[1099px]:sr-only')}>{item.etiqueta}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {conBuscador ? (
          <form role="search" onSubmit={enviar} className="relative order-last basis-full md:order-none md:basis-auto md:flex-1 md:min-w-36 md:max-w-xs md:ml-auto">
            <ComboCarrera
              etiqueta="Buscar una carrera"
              etiquetaOculta
              variante="barra"
              icono={<Search />}
              placeholder="Buscar una carrera"
              carreras={carreras.datos}
              texto={consulta}
              onTexto={setConsulta}
              onElegir={irACarrera}
              maximo={6}
            />
          </form>
        ) : (
          <span aria-hidden className="hidden flex-1 md:block" />
        )}

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <BotonTema />
          {autenticado ? (
            <MenuUsuario />
          ) : (
            <>
              <LinkButton to="/ingresar" viewTransition variante="fantasma" tamano="sm" icono={<LogIn className="size-4" aria-hidden />}>
                <span className="max-sm:sr-only">Ingresar</span>
              </LinkButton>
              <LinkButton to="/registro" viewTransition tamano="sm" icono={<UserPlus className="size-4" aria-hidden />}>
                Crear cuenta
              </LinkButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
