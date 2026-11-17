# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 19 + TypeScript estricto + Vite + Tailwind CSS v4 + react-router 7 + motion/framer-motion + lucide-react, dentro de `frontend/`. Consume la API REST NestJS de este mismo repositorio (`src/`). Decidido por el usuario.

## Users

Cualquier persona que quiera buscar y comparar carreras universitarias en Colombia. El producto atiende tres apartados:

- **Bachilleres** que eligen su primera carrera y necesitan ver opciones por ciudad, costo y modalidad.
- **Adultos que vuelven a estudiar**, para quienes la jornada (nocturna, mixta) y la modalidad (virtual, hibrida) pesan tanto como la carrera.
- **Padres y orientadores** que acompañan la decision y comparan costos totales y acreditacion.

## Product Purpose

SAN (Sistema Academico de Navegacion) permite buscar ofertas academicas por carrera, ciudad, costo maximo, modalidad y jornada, y ordenarlas por afinidad segun pesos personales (costo, modalidad, ubicacion, acreditacion), mostrando un puntaje y su desglose por criterio. Tambien permite comparar de 2 a 4 ofertas lado a lado (costo total, duracion, acreditacion, mejor oferta) y guardar favoritos en un perfil. El exito es que la persona termine con una lista corta y justificada de opciones.

## Positioning

El orden de los resultados no es una caja negra: cada oferta trae su puntaje y el desglose de por que obtuvo ese puntaje, calculado con los pesos que la propia persona eligio.

## Operating Context

- Busqueda → resultados ordenados → ficha de la oferta → comparar → guardar en favoritos.
- Sesion opcional: las vistas de catalogo, busqueda y comparacion son publicas; perfil, preferencias y favoritos requieren cuenta (JWT). Un rol `admin` gestiona el catalogo (carreras, universidades, ofertas).
- Uso tipico en celular y en computador de casa o de colegio.

## Capabilities and Constraints

- Catalogo: carreras, universidades (con ciudad e imagen opcional) y ofertas academicas (SNIES, costo por periodo, modalidad `presencial|virtual|hibrida`, jornada `diurna|nocturna|mixta`, duracion en periodos, acreditacion).
- Puntaje de busqueda 0-100 con desglose 0-1 por criterio; comparacion con `costoTotal = costo x duracion` y `mejorOfertaId`.
- Los nombres de ciudades del catalogo van sin tilde (`Bogota`, `Medellin`) porque asi los guarda la API.
- No hay integracion real con SNIES/MEN.

## Brand Commitments

- Nombre: **SAN – Sistema Academico de Navegacion**.
- Copy en español, directo y cercano (tuteo).
- Direccion visual (reemplaza la anterior negro/lima): interfaz operativa clara, calmada y precisa, con modo oscuro completo. Superficies blancas y neutros con matiz minimo hacia el acento; un unico acento **añil** (azul tinta, oklch hue 268) para accion, foco y barras de puntaje; verde, ambar y rojo solo como estados. Tipografia: Bricolage Grotesque (titulos y cifras) + Instrument Sans (texto). Estructura tomada de referencias de producto: riel de iconos delgado, barra superior con busqueda, saludo con tarjetas de accion, listas densas, auth dividido con panel oscuro de foto de campus. Tokens en `frontend/src/index.css`; detalle en `.impeccable/surfaces/`.

## Evidence on Hand

- Datos del catalogo: semilla de `src/common/semilla.ts` (5 carreras, 7 universidades en Bogota, Medellin, Cali y Barranquilla, 10 ofertas). Son **demostrativos**: no inventar precios, acreditaciones, rankings, testimonios ni cifras nuevas; toda cifra visible sale de la API.
- Fotos de campus con licencia libre de Wikimedia Commons en `frontend/public/campus/` con creditos en `CREDITOS.md` y `creditos.json` (cuando esten disponibles). No se usan imagenes de las referencias visuales (tienen copyright).
- No hay testimonios, clientes, prensa ni metricas de uso.

## Product Principles

1. Explicar antes que ordenar: todo puntaje se acompaña de su desglose.
2. La persona decide los pesos; el sistema no impone un "mejor" universal.
3. Pocas opciones bien comparadas valen mas que una lista larga.
4. Nada se inventa: si un dato no viene de la API, no se muestra como hecho.

## Accessibility & Inclusion

WCAG 2.1 AA: contraste suficiente, foco visible, navegacion completa por teclado (dialogos nativos, pestañas, carrusel), responsive desde 360px y respeto de `prefers-reduced-motion`.
