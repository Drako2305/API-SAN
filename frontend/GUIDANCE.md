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
