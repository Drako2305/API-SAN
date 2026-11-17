---
version: 1
slug: "frontend-src-layout-shell-tsx"
primary_target: "frontend/src/layout/Shell.tsx"
related_targets: ["frontend/src/paginas","frontend/src/componentes"]
---

# App SAN (inicio, búsqueda, catálogo, comparar, perfil, admin)

Scope: shell y todas las pantallas de trabajo. Mode: **Operate**. El dato manda: scanabilidad, consistencia y estados completos.
Constraints: copy en español con tildes, datos solo de la API, AA, 360px+, tema claro/oscuro.

## Direction contract

THESIS: Un producto operativo tranquilo: superficies blancas, bordes finos, un acento añil y jerarquía clara. Rechaza la cartelera negra/lima y los controles Material.

OWN-WORLD: Mismos tokens que la portada (`frontend/src/index.css`). Riel de iconos de 68px a la izquierda, barra superior de 56px con búsqueda, tema y cuenta; barra inferior en móvil. Cards planas con borde (sin anidar), filas de lista densas con avatar, puntaje y acciones; badges para modalidad, jornada y acreditación; verde/ámbar/rojo solo para estados ("mejor oferta" en ámbar).

STORY: La persona filtra, ve filas con puntaje y desglose en barras, abre la ficha, compara y guarda favoritos; nunca duda de por qué una oferta está arriba.

FIRST VIEWPORT: `/inicio`: saludo, tres tarjetas de acción (la primaria en acento), resumen con conteos y búsquedas recientes. `/buscar`: filtros a la izquierda, resultados a la derecha.

FORM: operativo tipo dashboard de producto (referencia Upwork): riel delgado, listas densas, perfil con columna de datos y pestañas.

Signature: `PuntajeBarra`, desglose del puntaje con barras de acento que crecen al aparecer (respeta reduced motion).

FINISH: foco visible y estados hover/disabled/loading/error/empty en cada vista.
