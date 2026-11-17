# Guía aplicada (modern-web-guidance, skill-version 2026_11_09-5bcc021b)

- `dialog`: "Use the native `<dialog>` element for modal and non-modal dialogs." Aplicado en `src/componentes/Dialog.tsx` con `showModal()`, sin `role`/`aria-modal` manuales y nombre con `aria-labelledby`.
- `light-dismiss-a-dialog`: "`closedby="any"` enables light-dismiss". Activo por defecto, con respaldo por puntero donde falta `closedBy` (Safari) y desactivado en el paso 2 del registro (datos sin enviar).
- `platform-controls-dismiss-dialog`: Esc y gesto atrás los da `showModal()` de forma nativa; no hay manejador propio.
- `prevent-page-scroll-under-modal-dialog`: "overscroll-behavior: contain" en `dialog:modal` y `::backdrop` (src/index.css), sin `overflow: hidden` en body.
- `animate-to-from-top-layer`: "transition display and overlay for top-layer elements" con `@starting-style` y `allow-discrete`, solo con `prefers-reduced-motion: no-preference`.
- `validate-input-after-interaction`: "`:user-invalid` ... defer the error state until the user has committed to a value". Clase `.campo-control:user-invalid` y mensaje visible con icono "Error" en `Campo.tsx`.
- `accessible-error-announcement`: "`aria-invalid` ... at the exact same moment the visual state applies". `Campo` sincroniza `aria-invalid` y `aria-describedby` en blur/input/invalid.
- `autofill-sign-in-form` y `autofill-sign-up-form`: valores `autocomplete` (`username`, `current-password`, `new-password`, `email`, `given-name`, `family-name`) en Ingresar y FormularioRegistro.
- `dark-mode`: "Declare support for both light and dark themes" con `<meta name="color-scheme">` y `color-scheme: light dark` en `:root`; tokens con `light-dark()`.
- `dark-mode-toggle`: el interruptor actualiza `<meta name="color-scheme">` y `data-tema`, guarda en `localStorage` (`san.tema`) y por defecto sigue al sistema (`src/lib/tema.tsx`).
- `motion`: "Prefer to animate `opacity` and `transform`"; `prefers-reduced-motion` reduce transiciones y `MotionConfig reducedMotion="user"` envuelve la app.
- `tabs`: patrón tablist con flechas/Inicio/Fin y paneles `hidden="until-found"` sincronizados con `beforematch` (`Tabs.tsx`). No se usó `focusgroup` por soporte limitado: se usa roving tabindex.
- `same-document-transitions`: navegación con `viewTransition` de react-router en el riel y las tarjetas; `::view-transition-*` ajustado y desactivado con reduced motion.

## Catálogo

- `optimize-image-priority`: "Never use `loading="lazy"` on the LCP image" y "add `fetchpriority="high"` to the `<img>` element for the LCP candidate". Aplicado en `FotoUniversidad` (`prioridad` solo en la foto del perfil de universidad); las tarjetas del listado usan `loading="lazy"` sin `fetchpriority`, con `width`/`height` 800x450 y `aspect-[16/9]` para evitar CLS, más `srcSet` 800w/1920w y `sizes`.
- `card`: "use `<article>` as the card root" y "keep links and buttons for independent actions as separate native controls". Aplicado en las tarjetas de carrera (`article` + enlace "Buscar" + `details` con las ofertas); en universidades toda la tarjeta es un único enlace sin controles anidados. `aspect-ratio` y `object-fit: cover` van en la propia `<img>`.
- `search` (consulta "search filter input"): campo `type="search"` dentro de `<search>`, con etiqueta visible y búsqueda con retardo de 300 ms que escribe `?nombre` en la URL; los filtros de ciudad son botones con `aria-pressed` y quedan en `?ciudad`.

## Búsqueda y comparación

- `slider`: "Use a labeled `<input type="range">` rather than recreating a slider with `<div>` elements". Los pesos de `/buscar` usan el `Slider` nativo con `accent-color` y `aria-valuetext` ("3 de 5" / "No cuenta"), sin pseudo-elementos generados.
- `brand-consistent-forms`: "`accent-color` ... retain the browser's native rendering". Las casillas "Comparar" y los sliders toman el acento con `accent-color` (token `--color-acento`).
- `responsive-table`: "Apply `position: sticky` to both column headers and row headers" y contenedor con `tabindex="0"`, `role="region"` y nombre accesible. La tabla de `/comparar` usa `<table>` semántica con `<caption>`, `th scope` y primera columna `sticky left-0` con fondo propio; en móvil desplaza en horizontal dentro del contenedor (no se usó la variante apilada porque comparar exige ver las columnas lado a lado).
- `dynamic-sort`/`accessibility`: el contador de resultados se anuncia con `aria-live="polite"`; las filas se leen como lista con el desglose como `ul` con nombre.

## Perfil y administración

- `responsive-table`: "Use standard `<table>` elements with `<thead>`, `<tbody>`, and `<th>` elements" y "the `<thead>` is hidden ... accessible headers are injected into each cell". Aplicado en `componentes/admin/SeccionCrud.tsx`: contenedor con `role="region"`, `tabindex="0"` y nombre, `<caption>` oculta, `scope="col"`; en móvil la tabla pasa a tarjetas con `data-etiqueta` y `::before` (variantes `max-md:`), sin duplicar el DOM. No se usó `@container` ni encabezado fijo porque las listas son cortas.
- `dialog` y `light-dismiss-a-dialog`: confirmación de borrado y formularios con el `Dialog` nativo compartido. El formulario de crear/editar desactiva el cierre por clic fuera ("datos sin guardar"); la confirmación lo conserva.
- `validate-input-after-interaction` y `accessible-error-announcement`: los campos usan `Input`/`Select` (`:user-invalid` tras interactuar, `aria-invalid` sincronizado) con `required`, `min`, `maxLength`, `type="email"`/`url`. Los errores del servidor (409, 400 con `detalles[]`) salen en un bloque `role="alert"` dentro del formulario.
- `accordion` (details): "Use native `<details>`" para las secciones plegables "Actividad" y "Cuenta" del panel de perfil (`componentes/perfil/PanelLateral.tsx`), con `<summary>` focalizable y marcador propio que rota solo sin `prefers-reduced-motion`.
- `autofill-sign-up-form`: `autocomplete` `given-name`, `family-name`, `email` y `address-level2` en el formulario de datos.

## Navegación superior y fotos

- `navbar`: "Use one `<nav>` landmark for narrow and wide layouts" y "`aria-current="page"` to identify the current page". `layout/NavSuperior.tsx` usa una sola lista de enlaces con ícono y texto: en línea desde 768 px (etiquetas completas desde ~1100 px; entre medias solo la página actual muestra su texto y las demás lo conservan como `sr-only`/`title`) y, más angosta, un `popover="auto"` abierto con `popovertarget` + `aria-controls`. Esc, clic fuera y retorno del foco son nativos; `aria-expanded` se sincroniza con el evento `toggle`. No se usó `role="menu"` ni flechas: son enlaces en el orden de tabulación. Se difirió el cálculo por `ResizeObserver` de la guía a favor de `matchMedia` (los breakpoints son fijos y el contenido de la barra es conocido); el atributo `popover` se quita en el diseño ancho.
- `navbar` (posicionamiento): el panel usa `anchor(--boton-menu bottom)` con un `inset-block-start` fijo de respaldo declarado antes ("Browsers without anchor() keep this one") y entra con `@starting-style`, `transition-behavior: allow-discrete` aparte del shorthand, solo `opacity`/`translate` y solo con `prefers-reduced-motion: no-preference`.
- `content-first-noise-reduction` (aplicado por su descripción: navegación persistente compacta, secundario bajo demanda): barra compacta y fija (`backdrop-blur` leve y borde/sombra solo al desplazarse); en móvil la búsqueda pasa a una segunda fila en lugar de ocultarse y los destinos secundarios viven tras el botón de menú.
- `html` (solo su descripción, "native interactive APIs (Dialog, Popover, Details)"): el menú de la cuenta y el panel de navegación comparten el mismo mecanismo nativo, sin manejadores propios de Esc ni foco.
- `deliver-optimized-decorative-images` (consulta "image fallback"; aplicado por su descripción: formatos modernos y varias densidades): variantes WebP de 800 y 1600 px con `srcset` y `sizes`; `FotoConFallback` fija `width`/`height`, usa `loading="lazy"` (y `fetchpriority="high"` solo con `prioridad`) y, si `onError` dispara, sustituye la imagen por un degradado con el ícono del área (lucide) en lugar de una imagen rota. En la banda de la oferta, `ocultarSiFalla` deja el fondo liso del panel.

## Landing animada

- `motion` (consultas "reduced motion", "scroll driven animations"): "Prefer to animate `opacity` and `transform`" y "Use `@media (prefers-reduced-motion: no-preference)` when the reduced-motion strategy is to not have the animation at all". Todo el GSAP de la portada vive en `gsap.matchMedia()` con `(prefers-reduced-motion: no-preference)` (`componentes/landing/gsap.ts`); sin esa condición el contenido queda completo y estático (puntaje 87, cifras finales, galería con scroll nativo). La marquesina usa el mismo criterio en CSS.
- `motion` (accesibilidad): "Provide a pause mechanism ... a visible control to pause, stop, or hide it". La marquesina tiene un botón "Pausar movimiento" (sin `aria-pressed`, el texto cambia), pausa con hover y foco, y su copia para el bucle va `aria-hidden` e `inert`.
- `motion`: "Keep the final state": el estado inicial del React (puntaje 87, desglose completo) es el final; GSAP solo parte de 0 dentro de la consulta y lo restaura al revertir.
- `parallax-scroll-effects` (consulta "scroll driven animations"): se evaluó `animation-timeline` en CSS, pero el pin con scrub, `containerAnimation` y el avance del puntaje requieren coordinar varias líneas de tiempo, así que se usó ScrollTrigger solo para eso; el parallax del collage y de la galería usa solo `transform`.
- `optimize-image-priority`: "Never use `loading="lazy"` on the LCP image" y "add `fetchpriority="high"`". La foto del hero usa `prioridad` (eager + high) y el resto (galería, collage, marquesina) va diferido con ancho/alto fijos; Three.js se carga con `import()` tras `requestIdleCallback`, fuera del LCP, y se omite con reduced motion, `saveData` o sin WebGL (queda el degradado).
- `performance` (consulta "lazy load heavy script"): el chunk de Three.js (`escena`) es independiente del de la portada; la escena limita el DPR a 1.75, se pausa fuera de pantalla (IntersectionObserver) y con la pestaña oculta, y libera geometrías, materiales, textura y contexto al desmontar.
- Conteo de cifras (consulta "count up number animation", sin guía específica): el número animado es `aria-hidden` y un `sr-only` da la cifra real; un span invisible reserva el ancho final para evitar saltos.
