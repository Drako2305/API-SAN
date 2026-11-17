# Arquitectura del frontend

SPA React 19 + TypeScript estricto + Vite + Tailwind v4. Código y UI en español (Colombia, con tildes en los textos visibles). Archivos, componentes, funciones y carpetas también en español.

## Carpetas (`src/`)

- `lib/` lógica sin UI: `api.ts` (cliente), `almacenSesion.ts` + `sesion.tsx` (sesión), `tema.tsx`, `modelos.ts`, `formato.ts`, `campus.ts` (fotos y créditos), `recientes.ts`, `useCarga.ts`, `useCatalogoConteos.ts`.
- `componentes/` primitivas del sistema de diseño (Button, Campo/Input/Select/Textarea, Card, Badge, Tabs, Dialog, Slider, Avatar, EmptyState, Skeleton, Toast, PuntajeBarra, Logo, EncabezadoPagina). Se importan de `@/componentes`.
- `layout/` `Shell` (riel + barra superior + nav móvil), `LayoutPublico`, `RutaPrivada`, `MenuUsuario`, `navegacion.ts`.
- `paginas/` una pantalla por archivo con `export default`, cargada con `lazy` desde `rutas.tsx`. `paginas/auth/` contiene ingreso y registro.
- `morphing/` componentes portados de amicro (importan de `framer-motion`).
- `index.css` es el único lugar de tokens (colores `light-dark()`, tipografía, radios, sombras, movimiento).

## Cómo agregar una página

1. Crea `src/paginas/MiPagina.tsx` con `export default function MiPagina()`. Empieza con `<title>Mi página · SAN</title>` y `<EncabezadoPagina ... />` (un solo `<h1>`).
2. Regístrala en `src/rutas.tsx` con `lazy(() => import('@/paginas/MiPagina'))`. Las páginas de la app van dentro de `<Shell />`; si exigen sesión, envuélvelas en `<RutaPrivada>` (`soloAdmin` para admin).
3. Si es un destino principal, agrega el item en `layout/navegacion.ts`.

Placeholders pendientes: Buscar, Busqueda, Carreras, Universidades, UniversidadDetalle, Oferta, Comparar, Perfil, Admin. Favoritos vive en `/perfil?pestana=favoritos`.

## Cliente de API (`lib/api.ts`)

`import { catalogo, busquedas, comparaciones, usuarios, auth } from '@/lib/api'`. Cada función devuelve el recurso ya desenvuelto (`{message,data}` pasa a `data` donde aplica; las lecturas públicas devuelven el recurso directo). Las ediciones usan PATCH. Los errores son `ApiError` (`status`, `message` en español, `detalles[]`); en la UI usa `mensajeError(err, 'texto por defecto')`. `status === 0` es fallo de red. URL base: `VITE_API_URL` (por defecto `http://localhost:3000`).

Cargar datos en un componente: `useCarga(() => catalogo.carreras(), [deps])` devuelve `{ datos, cargando, error, recargar }`.

## Sesión (`lib/sesion.tsx`)

`useSesion()` da `usuario`, `autenticado`, `esAdmin`, `login`, `registro`, `logout`, `actualizarSesion`. Tokens en `localStorage` (`san.accessToken`, `san.refreshToken`, `san.usuario`). El cliente agrega el `Bearer`, ante un 401 llama a `/auth/refresh` una vez (compartido entre peticiones simultáneas) y reintenta; si falla, cierra sesión y `RutaPrivada` redirige a `/ingresar?returnUrl=...`. Las búsquedas recientes se guardan con `registrarBusquedaReciente(id)` (`lib/recientes.ts`); llámalo al crear una búsqueda.

## Convenciones de UI

- Colores solo con tokens (`bg-superficie`, `text-texto-2`, `bg-acento`, `border-borde`...); nunca hex sueltos. Tema claro/oscuro automático.
- Texto de interfaz con tildes. Ciudades y nombres de la API con `ciudadLegible` / `nombreLegible`; precios con `formatoCop`.
- Todo puntaje se muestra con su desglose (`PuntajeBarra`). Ninguna cifra se inventa: sale de la API.
- Estados completos: carga (`Skeleton` con `aria-busy`), vacío/error (`EmptyState`), avisos (`useToast`).
- Modales con `Dialog` (nativo). Movimiento sobrio y compatible con `prefers-reduced-motion`.

## Comandos

`npm run dev`, `npm run build`, `npm test`, `npm run lint`.
