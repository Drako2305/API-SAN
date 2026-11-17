import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Tema = 'sistema' | 'claro' | 'oscuro';
const CLAVE = 'san.tema';

function leer(): Tema {
  try {
    const t = localStorage.getItem(CLAVE);
    return t === 'dark' ? 'oscuro' : t === 'system' ? 'sistema' : 'claro';
  } catch {
    return 'claro';
  }
}

/** El tema por defecto es el claro; el oscuro (o seguir al sistema) solo si la persona lo eligió. Refleja el tema en <meta name="color-scheme"> y en `data-tema` (el CSS mapea ambos a `color-scheme`). */
function aplicar(t: Tema) {
  const valor = t === 'claro' ? 'light' : t === 'oscuro' ? 'dark' : 'light dark';
  document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', valor);
  if (t === 'sistema') document.documentElement.dataset.tema = 'system';
  else document.documentElement.dataset.tema = valor;
}

interface ValorTema {
  tema: Tema;
  /** Tema efectivo tras resolver "sistema". */
  efectivo: 'claro' | 'oscuro';
  fijar(t: Tema): void;
  alternar(): void;
}
const Contexto = createContext<ValorTema | null>(null);

export function TemaProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(leer);
  const [sistemaOscuro, setSistemaOscuro] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const f = () => setSistemaOscuro(mq.matches);
    mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, []);

  useEffect(() => aplicar(tema), [tema]);

  const fijar = useCallback((t: Tema) => {
    setTema(t);
    try {
      // Sin nada guardado el tema es el claro.
      if (t === 'claro') localStorage.removeItem(CLAVE);
      else localStorage.setItem(CLAVE, t === 'oscuro' ? 'dark' : 'system');
    } catch {
      /* sin almacenamiento */
    }
  }, []);

  const efectivo = tema === 'sistema' ? (sistemaOscuro ? 'oscuro' : 'claro') : tema;
  const valor = useMemo<ValorTema>(
    () => ({ tema, efectivo, fijar, alternar: () => fijar(efectivo === 'oscuro' ? 'claro' : 'oscuro') }),
    [tema, efectivo, fijar],
  );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useTema(): ValorTema {
  const v = useContext(Contexto);
  if (!v) throw new Error('useTema debe usarse dentro de <TemaProvider>');
  return v;
}
