import { Link } from 'react-router';
import { BookOpen, Building2, Camera, GitCompareArrows, GraduationCap, Heart, Home, LogIn, Search, UserPlus, UserRound, type LucideIcon } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { useSesion } from '@/lib/sesion';

const EQUIPO = ['Nicolas Diaz', 'Juan Camilo López', 'Jenifer Urbano'];

interface Enlace {
  t: string;
  icono: LucideIcon;
  a: string;
  /** Enlace a un recurso fuera de la aplicación (documento o API). */
  externo?: boolean;
}

const ENLACE =
  'inline-flex min-h-9 items-center gap-2 rounded-md text-sm text-sobre-panel no-underline hover:underline focus-visible:outline-sobre-panel';

function Columna({ titulo, enlaces }: { titulo: string; enlaces: Enlace[] }) {
  return (
    <nav aria-label={titulo}>
      <h2 className="text-sm font-semibold text-sobre-panel-2">{titulo}</h2>
      <ul className="m-0 mt-2 flex list-none flex-col p-0">
        {enlaces.map((e) => (
          <li key={e.t}>
            {e.externo ? (
              <a href={e.a} target="_blank" rel="noopener noreferrer" className={ENLACE}>
                <e.icono className="size-4 shrink-0" aria-hidden />
                {e.t}
                <span className="sr-only"> (se abre en otra pestaña)</span>
              </a>
            ) : (
              <Link to={e.a} viewTransition className={ENLACE}>
                <e.icono className="size-4 shrink-0" aria-hidden />
                {e.t}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Pie de marca: panel carmesí con esquirlas, enlaces con ícono, documentación de la API, créditos de las fotos y equipo. */
export function PiePortada() {
  const { autenticado } = useSesion();
  const explora: Enlace[] = [
    { t: 'Buscar carreras', icono: Search, a: '/buscar' },
    { t: 'Catálogo', icono: GraduationCap, a: '/carreras' },
    { t: 'Universidades', icono: Building2, a: '/universidades' },
    { t: 'Comparar ofertas', icono: GitCompareArrows, a: '/comparar' },
  ];
  const cuenta: Enlace[] = autenticado
    ? [
        { t: 'Mi inicio', icono: Home, a: '/inicio' },
        { t: 'Favoritos', icono: Heart, a: '/perfil?pestana=favoritos' },
        { t: 'Mi perfil', icono: UserRound, a: '/perfil' },
      ]
    : [
        { t: 'Ingresar', icono: LogIn, a: '/ingresar' },
        { t: 'Crear cuenta', icono: UserPlus, a: '/registro' },
      ];
  const recursos: Enlace[] = [
    { t: 'Documentación de la API', icono: BookOpen, a: `${API_URL}/docs`, externo: true },
    { t: 'Créditos de las fotos', icono: Camera, a: '/campus/CREDITOS.md', externo: true },
  ];
  return (
    <footer className="fondo-esquirlas esquirlas">
      <div className="pagina-ancho grid gap-10 py-12 md:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))] md:py-14">
        <div>
          <p aria-hidden className="logotipo text-[clamp(2.5rem,6vw,3.75rem)] text-sobre-panel">
            APi-SAN
          </p>
          <p className="mt-3 max-w-[32ch] text-sm text-sobre-panel-2">Sistema Académico de Navegación. Los datos del catálogo son demostrativos.</p>
        </div>
        <Columna titulo="Explora" enlaces={explora} />
        <Columna titulo="Cuenta" enlaces={cuenta} />
        <Columna titulo="Recursos" enlaces={recursos} />
      </div>
      <div className="border-t border-sobre-panel/25">
        <p className="pagina-ancho py-4 text-sm text-sobre-panel-2">
          Equipo: {EQUIPO.join(', ')}. Fotos de campus de Wikimedia Commons con licencia libre.
        </p>
      </div>
    </footer>
  );
}
