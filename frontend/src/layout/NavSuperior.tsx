import { useEffect, useId, useRef, useState, useSyncExternalStore, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Menu, Search } from 'lucide-react';
import { Logo, LinkButton } from '@/componentes';
import { cn } from '@/lib/cn';
import { useSesion } from '@/lib/sesion';
import { BotonTema } from './BotonTema';
import { MenuUsuario } from './MenuUsuario';
import { ITEMS_NAV, estaActivo } from './navegacion';

const CONSULTA_ANCHO = '(min-width: 768px)';

function suscribirAncho(cb: () => void) {
  const mq = window.matchMedia?.(CONSULTA_ANCHO);
  mq?.addEventListener?.('change', cb);
  return () => mq?.removeEventListener?.('change', cb);
}
const anchoActual = () => window.matchMedia?.(CONSULTA_ANCHO).matches ?? true;

/** `true` cuando caben los items en línea; en pantallas angostas se vuelven un panel desplegable. */
const useAncho = () => useSyncExternalStore(suscribirAncho, anchoActual, () => true);

/**
 * Barra superior fija: logo, navegación con ícono y texto, búsqueda, tema y cuenta.
 * Una sola lista de enlaces: en línea desde 768 px (con etiquetas completas desde ~1100 px) y, más angosta,
 * un `popover` nativo abierto por el botón de menú (Esc, clic fuera y retorno del foco los da el navegador).
 */
export function NavSuperior() {
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

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const q = consulta.trim();
    navegar(q ? `/buscar?carrera=${encodeURIComponent(q)}` : '/buscar', { viewTransition: true });
  };

  const items = ITEMS_NAV.filter((i) => !i.soloAdmin || esAdmin);
  const cerrarPanel = () => {
    if (!ancho) panel.current?.hidePopover?.();
  };

  return (
    <header
      data-desplazado={desplazado || undefined}
      className={cn(
        'sticky top-0 z-30 border-b bg-fondo/85 backdrop-blur-md transition-[border-color,box-shadow] duration-[var(--dur-media)] supports-[backdrop-filter]:bg-fondo/75',
        desplazado ? 'border-borde shadow-1' : 'border-transparent',
      )}
    >
      <div className="mx-auto flex max-w-[84rem] flex-wrap items-center gap-x-2 gap-y-2 px-4 py-2 md:min-h-[var(--barra)] md:flex-nowrap md:gap-x-3 md:px-6 md:py-0">
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

        <Link to={autenticado ? '/inicio' : '/'} className="shrink-0 rounded-lg" aria-label="SAN, ir al inicio">
          <Logo conNombre={false} />
        </Link>

        <nav aria-label="Principal" className="md:shrink-0">
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
                    <span className={cn(ancho && !activo && 'max-[1099px]:sr-only')}>{item.etiqueta}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <form role="search" onSubmit={enviar} className="relative order-last basis-full md:order-none md:basis-auto md:flex-1 md:min-w-36 md:max-w-xs md:ml-auto">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-texto-3" aria-hidden />
          <input
            type="search"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            placeholder="Buscar una carrera"
            aria-label="Buscar una carrera"
            enterKeyHint="search"
            className="h-9 w-full rounded-full border border-borde bg-superficie pr-4 pl-9 text-sm placeholder:text-texto-3 hover:border-borde-fuerte focus-visible:border-acento"
          />
        </form>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <BotonTema />
          {autenticado ? (
            <MenuUsuario />
          ) : (
            <>
              <LinkButton to="/ingresar" variante="fantasma" tamano="sm" className="hidden sm:inline-flex">
                Ingresar
              </LinkButton>
              <LinkButton to="/registro" tamano="sm">
                Crear cuenta
              </LinkButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
