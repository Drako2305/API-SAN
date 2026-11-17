# Micro-interacciones de morphing

Componentes de `src/morphing/` adaptados de [amicro](https://amicro.dev/morphing) (MIT, (c) Syed Subhan). La licencia original esta en [`LICENSE-amicro.md`](./LICENSE-amicro.md).

## Requisitos

- `framer-motion` (la animacion usa `motion` de ese paquete). No se instala desde esta carpeta.
- React 18+ y Tailwind v4. Los colores se heredan con `currentColor` o se pasan como variables CSS (`var(--color-accent)`), asi que siguen el tema claro/oscuro.

## Uso basico

```tsx
import { MorphingRing, TextMorph, MorphingShape } from './morphing'; // ajustar la ruta relativa segun el archivo que importa

<TextMorph palabras={['Buscando', 'Ordenando']} />
<MorphingShape tamano={32} color="var(--color-accent)" etiqueta="Buscando ofertas" />
<MorphingRing valor={87} cargando={false} />
```

## Accesibilidad y reduced motion

- Todos los componentes usan `useReducedMotion()`. Con `prefers-reduced-motion: reduce` muestran un estado estatico (sin bucles ni transiciones).
- Los loaders (`TextMorph`, `MorphingShape`, `MorphLoader`, `LoaderMorphing`, `MorphDotRing`, `MorphingBars`, `AppleIconMorph`, y `MorphingRing` mientras `cargando`) son `role="status"` con una etiqueta oculta visualmente (`etiqueta`, por defecto "Cargando").
- Con `decorativo` el loader pasa a `aria-hidden` y no lleva etiqueta. Usarlo cuando el texto de al lado ya informa el estado.
- Los controles (`PlayPauseMorph`, `HeartMorph`) son `button` con `aria-label`. `HeartMorph` usa `aria-pressed`; `PlayPauseMorph` cambia la etiqueta segun el estado (no usa `aria-pressed`).

## Componentes

Props comunes a casi todos: `className`, `etiqueta` (texto para lectores de pantalla), `decorativo` (boolean) y `color` (por defecto `currentColor`).

| Componente | Props | Descripcion |
|---|---|---|
| `TextMorph` | `palabras: string[]` (def. `['Cargando', 'Espera']`), `duracion` (seg. por palabra, def. 1.5), `etiqueta`, `decorativo`, `className` | Alterna palabras con desplazamiento vertical. Con 1 palabra queda fija. |
| `MorphingShape` | `tamano` (px, def. 40), `color`, `etiqueta`, `decorativo`, `className` | Cuadrado que se redondea, gira y pulsa. |
| `MorphLoader` | `size` (px, def. 40), `color`, `etiqueta`, `decorativo`, `className` | Cuadrado redondeado que cambia de forma y gira. |
| `LoaderMorphing` | `size` (px, def. 40), `color`, `duration` (seg., def. 2), `etiqueta`, `decorativo`, mas props de `motion.div` (sin `children`) | Squircle que pasa a circulo mientras gira. Acepta `className` y el resto de props de `motion.div`. |
| `MorphingRing` | `valor` (0-100, se redondea y limita), `cargando` (def. true), `tamano` (def. 40), `color`, `etiqueta`, `etiquetaValor` (def. "Puntaje N de 100"), `decorativo`, `className` | Anillo que se deforma mientras `cargando` y luego se asienta en circulo mostrando `valor`. |
| `MorphDotRing` | `tamano` (def. 24), `color`, `etiqueta`, `decorativo`, `className` | Cuatro puntos que se juntan, se separan y giran. |
| `MorphingBars` | `altura` (px, def. 32), `color`, `etiqueta`, `decorativo`, `className` | Tres barras con altura y separacion animadas. |
| `AppleIconMorph` | `tamano` (px, def. 32), `color`, `etiqueta`, `decorativo`, `className` | Forma que pasa de cuadrado a circulo girando en cuatro pasos. |
| `PlayPauseMorph` | `reproduciendo` (controlado, opcional), `onCambio(boolean)`, `tamano` (def. 40), `color`, `etiquetaReproducir`, `etiquetaPausar`, `className` | Icono que interpola entre pausa y play con dos paths (`d`). |
| `HeartMorph` | `activo` (controlado, opcional), `onCambio(boolean)`, `tamano` (def. 24), `color`, `etiqueta` (def. "Favorito"), `className` | Corazon de contorno a relleno con pulso al activarse. Derivado del corazon de `ShapesHeartMorph` (upstream). |
| `ContenedorLoader` | `etiqueta`, `decorativo`, `className`, `style`, `children` | Envoltorio accesible usado por los loaders. Util para crear loaders propios. |
| `useReducedMotion()` | (sin props), devuelve `boolean` | Hook que lee `prefers-reduced-motion` y se actualiza si cambia. |

## Usos sugeridos en la app

- **TextMorph → estados de carga.** Texto de espera en botones o listas, por ejemplo `palabras={['Cargando', 'Espera']}` mientras se consulta la API.
- **MorphingShape / MorphLoader → busqueda en curso.** Indicador junto a la barra de busqueda o en la pagina de resultados (`etiqueta="Buscando ofertas"`).
- **MorphingRing → puntaje de afinidad.** Mientras el servicio de scoring responde, `cargando` en true; al llegar el resultado pasar `valor={puntaje}` con `cargando={false}`. El anillo se asienta y muestra el numero. Para el color usar `color="var(--color-accent)"`.
- **HeartMorph → favorito.** Boton de favorito en una oferta, controlado con `activo` y `onCambio` para llamar al endpoint de favoritos.
- **PlayPauseMorph → toggles de dos estados.** Sirve para reproducir/pausar o cualquier alternancia con un icono de dos formas. No trae iconos de copiar ni de tema claro-oscuro: para esos habria que definir nuevos paths siguiendo el mismo patron (`animate={{ d }}` con el mismo numero de comandos en cada par).

## Notas de adaptacion

- Los colores de Tailwind del original (zinc, blue, white) se reemplazaron por `currentColor` o por props de color.
- El registro upstream mezcla `framer-motion` y `motion/react`; aqui todos los componentes importan de `framer-motion`.
- Los componentes no usan `lucide-react` porque ninguno de los portados lo necesita.
- Se omitieron componentes que no encajan con el alcance (ver el reporte de la tarea).
