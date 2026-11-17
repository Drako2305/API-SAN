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
