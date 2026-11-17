import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  Group,
  LineBasicMaterial,
  LineSegments,
  NormalBlending,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from 'three';

/** Convierte cualquier color CSS (oklch, light-dark resuelto, etc.) a sRGB 0-1 usando un elemento y un canvas 2D. */
function leerColor(variable: string): Color {
  const sonda = document.createElement('span');
  sonda.style.color = `var(${variable})`;
  sonda.style.display = 'none';
  document.documentElement.appendChild(sonda);
  const css = getComputedStyle(sonda).color;
  sonda.remove();
  const c = document.createElement('canvas');
  c.width = c.height = 1;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx) return new Color(0.63, 0.11, 0.13);
  ctx.fillStyle = '#000';
  ctx.fillStyle = css;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return new Color().setRGB(r! / 255, g! / 255, b! / 255, 'srgb');
}

const luminancia = (c: Color) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;

function spriteCirculo(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.9)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new CanvasTexture(c);
}

export interface Escena {
  dispose: () => void;
}

const NODOS = 260;
const RADIO = 1.7;

/** Globo de partículas con aristas entre vecinos cercanos. Pausa fuera de pantalla y con la pestaña oculta. */
export function crearEscena(canvas: HTMLCanvasElement, contenedor: HTMLElement): Escena {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  const escena = new Scene();
  const camara = new PerspectiveCamera(40, 1, 0.1, 50);
  camara.position.z = 5.2;

  // Puntos en espiral de Fibonacci sobre la esfera.
  const pos = new Float32Array(NODOS * 3);
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < NODOS; i++) {
    const y = 1 - (i / (NODOS - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = phi * i;
    pos[i * 3] = Math.cos(t) * r * RADIO;
    pos[i * 3 + 1] = y * RADIO;
    pos[i * 3 + 2] = Math.sin(t) * r * RADIO;
  }

  // Aristas entre vecinos cercanos (máx. 3 por nodo), una sola vez.
  const lineas: number[] = [];
  const umbral = RADIO * 0.36;
  const vistos = new Set<number>();
  for (let i = 0; i < NODOS; i++) {
    let n = 0;
    for (let j = i + 1; j < NODOS && n < 3; j++) {
      const dx = pos[i * 3]! - pos[j * 3]!;
      const dy = pos[i * 3 + 1]! - pos[j * 3 + 1]!;
      const dz = pos[i * 3 + 2]! - pos[j * 3 + 2]!;
      if (dx * dx + dy * dy + dz * dz < umbral * umbral && !vistos.has(i * NODOS + j)) {
        vistos.add(i * NODOS + j);
        lineas.push(pos[i * 3]!, pos[i * 3 + 1]!, pos[i * 3 + 2]!, pos[j * 3]!, pos[j * 3 + 1]!, pos[j * 3 + 2]!);
        n++;
      }
    }
  }

  const geoPuntos = new BufferGeometry();
  geoPuntos.setAttribute('position', new BufferAttribute(pos, 3));
  const geoLineas = new BufferGeometry();
  geoLineas.setAttribute('position', new BufferAttribute(new Float32Array(lineas), 3));

  const sprite = spriteCirculo();
  const matPuntos = new PointsMaterial({ size: 0.075, map: sprite, transparent: true, depthWrite: false, sizeAttenuation: true });
  const matLineas = new LineBasicMaterial({ transparent: true, depthWrite: false });
  const globo = new Group();
  globo.add(new LineSegments(geoLineas, matLineas), new Points(geoPuntos, matPuntos));
  escena.add(globo);

  function aplicarTema() {
    const acento = leerColor('--color-acento');
    const oscuro = luminancia(leerColor('--color-fondo')) < 0.4;
    matPuntos.color.copy(acento);
    matLineas.color.copy(acento);
    matPuntos.blending = oscuro ? AdditiveBlending : NormalBlending;
    matLineas.blending = oscuro ? AdditiveBlending : NormalBlending;
    matPuntos.opacity = oscuro ? 0.95 : 0.85;
    matLineas.opacity = oscuro ? 0.22 : 0.3;
    matPuntos.needsUpdate = matLineas.needsUpdate = true;
  }
  aplicarTema();

  function tamano() {
    const { width, height } = contenedor.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(width, height, false);
    camara.aspect = width / height;
    // A lo ancho el globo va a la derecha, junto al texto; en pantallas estrechas queda centrado y más pequeño.
    const ancho = camara.aspect >= 1.15;
    globo.position.x = ancho ? Math.min(2.4, camara.aspect * 0.95) : 0;
    globo.position.y = ancho ? 0 : -0.2;
    const s = ancho ? 1 : Math.max(0.55, camara.aspect * 0.95);
    globo.scale.setScalar(s);
    camara.updateProjectionMatrix();
    dibujar();
  }

  const objetivo = { x: 0, y: 0 };
  const puntero = (e: PointerEvent) => {
    const r = contenedor.getBoundingClientRect();
    objetivo.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    objetivo.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
  };
  window.addEventListener('pointermove', puntero, { passive: true });

  let visible = true;
  let pestanaVisible = !document.hidden;
  let raf = 0;
  let giro = 0;
  let ultimo = performance.now();

  function dibujar() {
    globo.rotation.y = giro + objetivo.x * 0.35;
    globo.rotation.x = 0.35 + objetivo.y * 0.18;
    renderer.render(escena, camara);
  }

  function cuadro(ahora: number) {
    raf = 0;
    if (!visible || !pestanaVisible) return;
    const dt = Math.min(0.05, (ahora - ultimo) / 1000);
    ultimo = ahora;
    giro += dt * 0.12;
    dibujar();
    raf = requestAnimationFrame(cuadro);
  }
  function arrancar() {
    if (!raf && visible && pestanaVisible) {
      ultimo = performance.now();
      raf = requestAnimationFrame(cuadro);
    }
  }

  const io = new IntersectionObserver(([e]) => {
    visible = !!e?.isIntersecting;
    if (visible) arrancar();
  });
  io.observe(contenedor);
  const alCambiarPestana = () => {
    pestanaVisible = !document.hidden;
    if (pestanaVisible) arrancar();
  };
  document.addEventListener('visibilitychange', alCambiarPestana);

  const ro = new ResizeObserver(tamano);
  ro.observe(contenedor);

  // Cambio de tema: atributo data-tema de <html> o preferencia del sistema.
  const mo = new MutationObserver(() => {
    aplicarTema();
    dibujar();
  });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-tema'] });
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const alTema = () => {
    aplicarTema();
    dibujar();
  };
  mq.addEventListener('change', alTema);

  tamano();
  arrancar();

  return {
    dispose() {
      cancelAnimationFrame(raf);
      raf = 0;
      visible = false;
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      mq.removeEventListener('change', alTema);
      document.removeEventListener('visibilitychange', alCambiarPestana);
      window.removeEventListener('pointermove', puntero);
      geoPuntos.dispose();
      geoLineas.dispose();
      matPuntos.dispose();
      matLineas.dispose();
      sprite.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
