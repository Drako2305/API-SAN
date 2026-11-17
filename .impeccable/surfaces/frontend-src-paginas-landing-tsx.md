---
version: 1
slug: "frontend-src-paginas-landing-tsx"
primary_target: "frontend/src/paginas/Landing.tsx"
related_targets: ["frontend/src/paginas/auth"]
---

# Portada SAN (`/`) y auth

Scope: portada pública, registro en modal, `/ingresar` y `/registro`. Mode: **Persuade**.
Audience/job: bachilleres, adultos que vuelven a estudiar y orientadores; acción: crear cuenta o explorar el catálogo. Proof: conteos reales de la API y fotos de campus con crédito. Constraints: datos demostrativos, nada inventado.

## Direction contract

THESIS: Claro y sereno: tipografía grande sobre fondo casi blanco y fotos de campus como único color fuerte. Rechaza el hero oscuro con acento fosforescente de la versión anterior.

OWN-WORLD: Fondo tintado hacia añil, superficies blancas, acento añil oklch(0.5 0.19 268) (oscuro: oklch(0.73 0.13 268)), panel de marca oscuro oklch(0.2 0.045 268) solo en auth. Bricolage Grotesque para titulares y cifras, Instrument Sans para texto. Radios 6/10/14/20px; sombras suaves con desplazamiento.

STORY: Se entiende en segundos que SAN compara programas con un puntaje explicable; el modal de registro se siente ligero (correo, luego perfil).

FIRST VIEWPORT: titular grande a la izquierda con dos CTA ("Crear cuenta gratis" abre el modal, "Explorar el catálogo"), collage escalonado de cuatro fotos de campus a la derecha con pie de universidad. Debajo, franja de cifras reales.

FORM: hero editorial + collage fotográfico (referencia Meetup), auth dividido formulario/panel oscuro (referencia Square).

Signature: sliders de pesos 0-5 que muestran el mecanismo sin inventar datos; modal nativo con fondo desenfocado.

FINISH: contraste en ambos temas, 360px sin scroll horizontal, créditos de fotos visibles.
