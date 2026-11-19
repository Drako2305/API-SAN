# Guion de sustentación — API SAN

Video de 9 a 10 minutos. Participan los tres integrantes.

Este guion está escrito **para hablar**, no para leer código. Las frases entre comillas son lo que se dice. Los recuadros **En simple** resumen la idea sin tecnicismos. Al final hay una tabla para traducir lo técnico a palabras normales y otra con las preguntas probables.

---

## Antes de grabar

- La base de datos y la aplicación deben estar funcionando, con los datos de ejemplo cargados.
- Abrir Postman con la colección del proyecto, apuntando a la dirección donde está corriendo la aplicación.
- Correr una vez la colección completa: debe terminar **sin fallos**.
- Tener abiertas tres pestañas: GitHub, la documentación interactiva de la API y una terminal con las pruebas para mostrar el resultado en verde.
- Ensayar una vez con cronómetro. Si se pasa de 10 minutos, recortar los ejemplos, no las explicaciones.

---

## Reparto

| Integrante | Qué cuenta | Tiempo |
|---|---|---|
| Jenifer | Qué es API SAN y para qué sirve | 1 min |
| Juan Camilo | Cómo está armada por dentro y en qué orden pasa cada pedido | 1.5 min |
| Jenifer | Dónde vive la información y cómo se relaciona | 1.5 min |
| Juan Camilo | Cómo se revisan los datos y cómo se explican los errores | 1.5 min |
| Nicolás | Quién puede hacer qué y el manejo del catálogo | 2 min |
| Jenifer | Cómo encuentra la mejor opción y cómo compara | 1.5 min |
| Nicolás | Trabajo en equipo, pruebas y uso de IA | 1.5 min |

---

## 1. Qué es API SAN — Jenifer (1 min)

Pantalla: portada del repositorio.

"Hola, somos Jenifer Urbano, Juan Camilo López y Nicolás Díaz, y les presentamos **API SAN**, el Sistema Académico de Navegación.

La idea es sencilla. Un estudiante quiere estudiar Ingeniería de Sistemas en Bogotá, tiene un presupuesto y prefiere clase diurna. Hoy tendría que entrar a la página de cada universidad, mirar si ofrece la carrera, cuánto cuesta, si es presencial, si sirve la jornada. API SAN hace ese trabajo: recibe lo que el estudiante busca y le devuelve las universidades que ofrecen esa carrera, **ordenadas de la que más le conviene a la que menos**, con una nota y el detalle de por qué.

Además puede comparar dos o más opciones lado a lado, guardar favoritos y sus preferencias. Y del otro lado, un administrador mantiene actualizado el catálogo de carreras, universidades y ofertas.

Hoy tenemos cargados **42 carreras, 19 universidades y 188 ofertas** de ejemplo.

En el video no vamos a leer código. Vamos a contar qué pasa cuando alguien usa la aplicación, cómo se cuida la información y por qué el resultado es el que es."

> **En simple:** es un buscador que compara universidades y dice cuál conviene, y un panel para que el administrador mantenga los datos al día.

---

## 2. Cómo está armada por dentro — Juan Camilo (1.5 min)

Pantalla: GitHub, la carpeta de la aplicación (sin abrir archivos).

"Cuando alguien usa API SAN, manda un pedido a la aplicación. Ese pedido entra por una puerta, pasa a quien sabe hacer ese trabajo, y vuelve convertido en una respuesta. Todo el proyecto está organizado así.

Es como un restaurante: el mesero toma el pedido, la cocina lo prepara y el mesero lo devuelve. Nadie hace el trabajo del otro. En la aplicación pasa igual: hay una parte que **solo recibe** el pedido, otra que **hace el trabajo** y otra que **entrega la respuesta**.

El sistema está dividido en áreas: usuarios, carreras y universidades, búsquedas y comparaciones. Cada área tiene sus tres piezas. Y no están mezcladas: si mañana cambia la forma de buscar una carrera, se cambia en un solo lugar y todo lo demás sigue funcionando igual.

Un detalle importante: esas piezas no las armamos a mano una por una. El framework las conecta solo. Cuando un área necesita hablar con otra, se la entrega ya lista. Eso evita errores, permite reutilizar lo que ya está hecho y deja crecer el proyecto sin romper lo anterior.

Por ejemplo, la búsqueda no guarda su propia copia de las carreras: le pide los datos al área de carreras, que es la única que sabe cómo consultarlos."

> **En simple:** cada pedido entra, lo atiende el área que corresponde y sale la respuesta. Las áreas no se pisan entre sí y comparten lo que ya está hecho.

---

## 3. Dónde vive la información — Jenifer (1.5 min)

Pantalla: la documentación interactiva, sección de carreras y ofertas (o una consulta en Postman).

"Toda la información vive en una base de datos, organizada como tablas que se relacionan entre sí. Tenemos cuatro grupos: usuarios, carreras, universidades y ofertas.

La pieza clave es la **oferta**, porque es la que une todo. Una oferta dice: esta universidad dicta esta carrera, en esta ciudad, con este costo, en esta modalidad, en esta jornada y durante estos años. Por ejemplo: la Universidad Nacional dicta Ingeniería de Sistemas en Bogotá, presencial, diurna, por cuatro millones y medio el semestre. Eso es una oferta.

¿Cómo se relacionan? Una universidad tiene muchas ofertas. Una carrera tiene muchas ofertas. Un usuario tiene un perfil con su ciudad, puede tener favoritos y sus búsquedas quedan guardadas a su nombre.

Tenerlo así tiene una ventaja grande: si mañana la Nacional sube el precio, se actualiza **una sola oferta** y todo lo demás se recalcula solo. La información no está repetida en varios lugares, así que no hay versiones distintas de la misma universidad.

Y cada registro guarda cuándo se creó y cuándo se actualizó, para poder rastrear los cambios."

> **En simple:** hay una tabla de universidades, una de carreras y una de ofertas que las une. Se actualiza un dato una vez y se refleja en todo el sistema.

---

## 4. Que los datos entren bien y los errores se entiendan — Juan Camilo (1.5 min)

Pantalla: Postman, carpeta de errores.

"Antes de guardar cualquier cosa, la aplicación revisa lo que le mandaron. Si falta un dato obligatorio, si un precio viene negativo, si la modalidad no es una de las permitidas o si alguien manda un campo que no existe, **no se guarda** y responde qué está mal. Nunca queda información a medias.

También hay errores que vienen de la base de datos y los traducimos a algo entendible. Por ejemplo, no puede haber dos ofertas con el mismo código del ministerio. Si alguien intenta repetirlo, en vez de un error raro aparece el aviso de que ese registro ya existe.

Vamos a verlo en vivo:

1. Mando una búsqueda con una modalidad que no existe → **400**, con el mensaje de qué campo está mal.
2. Pido una carrera con un identificador que no existe → **404**, no encontrada.
3. Intento crear una oferta con un código que ya está en el catálogo → **409**, conflicto, ese registro ya existe.

Cada respuesta trae un mensaje claro y un número. Eso importa porque quien usa la aplicación, o quien construya otra aplicación encima, necesita saber qué pasó y cómo reaccionar."

> **En simple:** la aplicación revisa antes de guardar, y cuando algo falla lo explica con un mensaje y un número, en vez de un error incomprensible.

---

## 5. Quién puede hacer qué — Nicolás (2 min)

Pantalla: Postman, carpeta de autenticación y luego catálogo. Al final, la documentación interactiva.

"Hay tres tipos de persona:

- **Visitante:** consulta el catálogo y hace búsquedas, sin cuenta.
- **Estudiante:** además tiene cuenta, guarda sus preferencias, sus favoritos y el historial de sus búsquedas.
- **Administrador:** mantiene el catálogo de carreras, universidades y ofertas.

Cuando alguien crea su cuenta, la clave **no se guarda como la escribe**. Se guarda transformada, y desde la base de datos no se puede leer. Cuando inicia sesión, el sistema le entrega una llave temporal que dura poco, y otra llave para renovarla sin volver a escribir la clave. Si la llave vence, la aplicación responde que no está autorizado y hay que volver a entrar.

Ahora los permisos. Si un estudiante con sesión válida intenta crear una carrera, la aplicación responde **prohibido**: su sesión sirve, pero su rol no alcanza. Si no hay sesión, responde **no autorizado**. Y cada estudiante solo puede ver y editar su propia información; no puede entrar a la de otro.

Lo vemos en vivo:

1. Entro como administrador.
2. Creo una carrera → **201**, creada.
3. La edito cambiando solo el área → **200**, y los demás datos quedan igual.
4. La elimino → **200**, eliminada.
5. Entro como estudiante e intento crear una carrera → **403**, prohibido.
6. Lo intento sin sesión → **401**, no autorizado.

Todo esto también se puede probar desde la documentación interactiva de la API, que viene incluida en el proyecto, y está descrita en la guía de endpoints."

> **En simple:** cada persona puede hacer solo lo que le corresponde, y la clave nunca se guarda tal cual.

---

## 6. Cómo encuentra la mejor opción — Jenifer (1.5 min)

Pantalla: Postman, búsqueda y luego comparación.

"Esta es la parte central. El estudiante dice qué quiere: la carrera, la ciudad, cuánto puede pagar, si la quiere presencial o virtual, y en qué jornada. Opcionalmente dice **qué le importa más**: si el precio, la modalidad, la ubicación o que esté acreditada.

Qué pasa, paso a paso:

1. **Se descartan** las ofertas que no cumplen lo que pidió. Si dijo Bogotá, no aparece Medellín. Si dijo máximo 25 millones, no aparece lo que cuesta más.
2. A cada oferta que queda **se le pone una nota de 0 a 100**. Se miran cuatro cosas: qué tan barata es, si la modalidad coincide con lo que prefiere, si está en su ciudad y si está acreditada. Cada cosa pesa según lo que el estudiante dijo que le importaba.
3. Se **ordenan** de mayor a menor nota.
4. Si dos empatan, **gana la más barata**. Ese desempate lo agregamos nosotros.
5. La búsqueda **queda guardada**, con su resultado, y se puede volver a consultar.

Lo hacemos en vivo con Ingeniería de Sistemas, Bogotá, presencial, diurna y hasta 25 millones. Devuelve dos opciones: la Universidad Nacional con 93 y la Universidad de los Andes con 67.

Un detalle que queremos contar con honestidad: como la ciudad y la modalidad ya se usaron para descartar, todas las que quedan cumplen eso. Por eso, al final, la nota la mueven sobre todo el **precio** y la **acreditación**. Si quisiéramos que la ubicación fuera solo una preferencia y no un requisito, mostraríamos también opciones de otras ciudades con menor nota. Funciona así porque lo decidimos nosotros, y sabemos cómo cambiarlo.

Y para comparar: se eligen entre dos y cuatro ofertas y la aplicación arma una tabla con lo que cuesta el semestre, lo que cuesta la carrera completa, cuántos años dura, si está acreditada y una nota final que premia que sea acreditada y económica. Al final dice cuál conviene. No se puede comparar una oferta consigo misma ni repetir la misma."

> **En simple:** primero filtra lo que no sirve, después le pone nota a lo que queda, ordena y guarda. La nota depende de lo que el estudiante dijo que le importaba.

---

## 7. Trabajo en equipo, pruebas y uso de IA — Nicolás (1.5 min)

Pantalla: GitHub, contribuyentes, ramas y solicitudes de integración. Luego la terminal con las pruebas.

"**Trabajo en equipo.** Cada funcionalidad se hizo en su propia rama, con un nombre que dice qué se estaba haciendo. Cuando terminaba, se abría una solicitud para integrarla, y esa solicitud tenía que ser **revisada y aprobada por los otros dos** antes de entrar. Así, ningún cambio llegó a la versión principal sin que alguien más lo hubiera revisado. Los tres hicimos aportes: el trabajo de los tres se ve en el historial.

**Pruebas.** Tenemos pruebas automáticas que revisan las partes importantes sin tener que probar a mano cada vez. Son **147 pruebas rápidas** y **43 pruebas de punta a punta**, que levantan la aplicación de verdad contra una base de datos aparte, para no tocar los datos reales. Se ejecutan solas cada vez que alguien propone un cambio: si algo se rompe, no deja integrarlo. (Mostrar el resultado en verde.)

**Uso de IA.** La usamos como apoyo: para revisar errores, proponer pruebas y mejorar la documentación. No reemplazó el trabajo del equipo. Cada cambio pasó por una persona, se probó y quedó en una solicitud revisada por otro compañero. Y como acabamos de mostrar, cada uno puede explicar lo que hizo y por qué.

Para cerrar: API SAN resuelve un problema real —elegir dónde estudiar— con una aplicación ordenada, segura y probada. Gracias por su atención."

> **En simple:** cada uno hizo su parte en una rama, otro la revisó antes de integrarla, y las pruebas automáticas avisan si algo se rompe.

---

## Cierre (15 segundos, los tres)

"Eso es API SAN: qué hace, cómo está armado, cómo cuida los datos y cómo decide cuál universidad conviene. Muchas gracias."

---

## Si preguntan

| Pregunta | Respuesta en palabras simples |
|---|---|
| ¿Qué es una API? | Es la forma en que dos programas se hablan. Uno pide y el otro responde con datos. |
| ¿Cómo está organizado el proyecto? | Por áreas (usuarios, catálogo, búsquedas, comparaciones). Cada área tiene quien recibe el pedido, quien hace el trabajo y quien entrega la respuesta. |
| ¿Qué es la inyección de dependencias? | Que las piezas no se crean a mano: el framework las entrega ya conectadas. Así una parte puede usar otra sin armarla desde cero. |
| ¿Dónde están las validaciones? | Antes de guardar. Se revisa el dato, y si está mal no se guarda y se explica qué falló. |
| ¿Qué diferencia hay entre PUT y PATCH? | Los dos actualizan. En teoría PUT reemplaza todo y PATCH cambia una parte. En el proyecto los dos aceptan cambios parciales por comodidad del frontend; lo más correcto sería usar PATCH. |
| ¿Por qué la ciudad y la modalidad no cambian el orden? | Porque se usan para descartar. Todo lo que queda ya cumple eso, así que la nota la mueven el precio y la acreditación. Si quisiéramos que fueran solo preferencia, dejaríamos de filtrar y las puntuaríamos. |
| ¿Cómo se calcula la nota de la comparación? | La mitad por estar acreditada y la otra mitad por ser económica frente a la más costosa de las comparadas. Es distinto del puntaje de la búsqueda. |
| ¿Cómo se guardan las claves? | Transformadas, nunca en texto plano. Desde la base no se pueden leer. |
| ¿Qué pasa si se vence la sesión? | La aplicación responde que no está autorizado; con la segunda llave se renueva sin volver a escribir la clave. |
| ¿Por qué `Ingeniería` con tilde no encuentra? | Porque la comparación es exacta salvo mayúsculas y los datos de ejemplo no llevan tilde. Es una mejora pendiente: normalizar los textos. |
| ¿Las tablas se crean solas? | Sí, en desarrollo. En producción se usarían migraciones controladas. |
| ¿Qué pasa si mando un campo que no existe? | Se rechaza con un mensaje que dice cuál sobra. |
| ¿Por qué algunas respuestas traen un mensaje y otras el dato directo? | Es una decisión de comodidad: al crear o editar se devuelve un mensaje con el dato, al consultar se devuelve el dato. Reconocemos que se podría uniformar. |

---

## Cómo decirlo sin tecnicismos

| Si ibas a decir… | Di… |
|---|---|
| módulo | área del sistema |
| controlador | quien recibe el pedido |
| servicio | quien hace el trabajo |
| DTO / validación | revisión de los datos antes de guardar |
| entidad | tabla de la base de datos |
| repositorio | quien consulta la base de datos |
| inyección de dependencias | el framework entrega las piezas ya conectadas |
| guard | portero que revisa permisos |
| endpoint / ruta | dirección a la que se manda el pedido |
| JWT / token | llave temporal de sesión |
| interceptor | registro de cada pedido |
| migración | cambios controlados en las tablas |

---

## Ensayo y verificación

- Cronometrar: cada bloque debe caber en su tiempo; total 9 a 10 minutos (el mínimo pedido es 5).
- Las pruebas deben terminar en verde.
- La colección de Postman debe terminar sin fallos.
- Revisar que la dirección que se usa en Postman sea la misma donde está corriendo la aplicación.
- No mostrar archivos ni ventanas que no formen parte del proyecto.
- Hablar despacio: es mejor decir menos y que se entienda, que leer todo rápido.
