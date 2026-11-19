# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 19 + TypeScript estricto + Vite + Tailwind CSS v4 + react-router 7 + motion/framer-motion + lucide-react, dentro de `frontend/`. Consume la API REST NestJS de este mismo repositorio (`src/`). Decidido por el usuario.

## Users

Cualquier persona que quiera buscar y comparar carreras universitarias en Colombia. El producto atiende tres apartados:

- **Bachilleres** que eligen su primera carrera y necesitan ver opciones por ciudad, costo y modalidad.
- **Adultos que vuelven a estudiar**, para quienes la jornada (nocturna, mixta) y la modalidad (virtual, híbrida) pesan tanto como la carrera.
- **Padres y orientadores** que acompañan la decisión y comparan costos totales y acreditación.

## Product Purpose

SAN (Sistema Académico de Navegación) permite buscar ofertas académicas por carrera, ciudad, costo máximo, modalidad y jornada, y ordenarlas por afinidad según pesos personales (costo, modalidad, ubicación, acreditación), mostrando un puntaje y su desglose por criterio. También permite comparar de 2 a 4 ofertas lado a lado (costo total, duracion, acreditacion, mejor oferta) y guardar favoritos en un perfil. El exito es que la persona termine con una lista corta y justificada de opciones.

## Positioning

El orden de los resultados no es una caja negra: cada oferta trae su puntaje y el desglose de por qué obtuvo ese puntaje, calculado con los pesos que la propia persona eligió.

## Operating Context

- Búsqueda → resultados ordenados → ficha de la oferta → comparar → guardar en favoritos.
- Sesión opcional: las vistas de catálogo, búsqueda y comparación son públicas; perfil, preferencias y favoritos requieren cuenta (JWT). Un rol `admin` gestiona el catálogo (carreras, universidades, ofertas).
- Uso típico en celular y en computador de casa o de colegio.

## Capabilities and Constraints

- Catálogo: carreras, universidades (con ciudad e imagen opcional) y ofertas académicas (SNIES, costo por periodo, modalidad `presencial|virtual|hibrida`, jornada `diurna|nocturna|mixta`, duración en periodos, acreditación).
- Puntaje de búsqueda 0-100 con desglose 0-1 por criterio; comparación con `costoTotal = costo x duracion` y `mejorOfertaId`.
- Los nombres de ciudades del catalogo van sin tilde (`Bogota`, `Medellin`) porque asi los guarda la API.
- No hay integración real con SNIES/MEN.

## Brand Commitments

- Nombre: **SAN – Sistema Académico de Navegación**.
- Copy en español, directo y cercano (tuteo).
- Marca: **API SAN**, rojo carmesí `#a11b22` con esquirlas angulares `#b0272f` y logotipo "APi-SAN" en blanco con letra manual y robusta (Londrina Solid, solo para el logotipo y acentos de marca; nunca en cuerpo ni titulares de interfaz).
- Dirección visual: interfaz operativa clara, calmada y precisa, con modo oscuro completo. Superficies blancas y neutros cálidos (matiz 20) con croma mínimo hacia el rojo; un único acento **rojo de marca** (claro `oklch(0.46 0.168 25)` = #a11b22; oscuro `oklch(0.7 0.16 24)`) para acción, foco, selección, enlaces y barras de puntaje. Verde y ámbar solo como estados; el **error es frambuesa** (matiz 350) y siempre lleva icono y texto, para que el rojo de marca no se lea como error. Panel de marca carmesí con esquirlas (CSS) en auth y cierre de la portada. Tipografía: Bricolage Grotesque (títulos y cifras) + Instrument Sans (texto). Estructura: barra superior con búsqueda, saludo con tarjetas de acción, listas densas, auth dividido. Tarjetas uniformes (mismo ancho en tiras, misma altura por fila, títulos a 2 líneas, pie anclado) y espaciado en escala 4/8: ver `frontend/DISENO-GRILLA.md`. Tokens en `frontend/src/index.css`; detalle en `.impeccable/surfaces/`.

## Evidence on Hand

- Datos del catálogo: semilla de `src/common/semilla.ts` (5 carreras, 7 universidades en Bogota, Medellin, Cali y Barranquilla, 10 ofertas). Son **demostrativos**: no inventar precios, acreditaciones, rankings, testimonios ni cifras nuevas; toda cifra visible sale de la API.
- Fotos de campus con licencia libre de Wikimedia Commons en `frontend/public/campus/` con créditos en `CREDITOS.md` y `creditos.json` (cuando estén disponibles). No se usan imágenes de las referencias visuales (tienen copyright).
- No hay testimonios, clientes, prensa ni métricas de uso.

## Product Principles

1. Explicar antes que ordenar: todo puntaje se acompaña de su desglose.
2. La persona decide los pesos; el sistema no impone un "mejor" universal.
3. Pocas opciones bien comparadas valen más que una lista larga.
4. Nada se inventa: si un dato no viene de la API, no se muestra como hecho.

## Accessibility & Inclusion

WCAG 2.1 AA: contraste suficiente, foco visible, navegación completa por teclado (diálogos nativos, pestañas, carrusel), responsive desde 360px y respeto de `prefers-reduced-motion`.
