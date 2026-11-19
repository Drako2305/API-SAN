

## 1. Introduccion - JENIFER (1 min)

Pantalla: README en GitHub.

"Hola, somos Jenifer Urbano, Juan Camilo Lopez y Nicolas Diaz, y les presentamos API SAN, Sistema Academico de Navegacion. Es una API REST hecha con NestJS que ayuda a un estudiante a encontrar donde estudiar una carrera. El usuario dice que carrera quiere, en que ciudad, cuanto puede pagar, la modalidad y la jornada, y la API le devuelve las universidades que la ofrecen, ordenadas por afinidad con un puntaje. Tambien permite comparar ofertas, guardar favoritos y preferencias, y un administrador gestiona el catalogo.

Usamos NestJS como requisito, implementando PostgreSQL, TypeORM, Docker y demás. La base tiene 42 carreras, 19 universidades y 188 ofertas de prueba.


---

## 2. Ejecucion y arquitectura NestJS - JUAN CAMILO (1.5 min)

Pantalla: README (Requisitos/Instalacion) -> `docker-compose.yml` -> `app.module.ts` -> `catalogo.module.ts` -> `catalogo.controller.ts` (constructor).

"Para correr el proyecto, en el README dejamos los requisitos: Node 24, npm y Docker. Se copia `.env.example` a `.env`, se levanta PostgreSQL con `docker compose up -d postgres`, se carga la semilla con `npm run seed` y se arranca con `npm run start:dev`. Tambien se puede levantar todo en Docker: API, frontend, PostgreSQL y pgAdmin.

En NestJS la app se organiza en modulos. El modulo raiz es `AppModule`: aqui configuramos `ConfigModule` para leer variables de entorno y `TypeOrmModule.forRootAsync`, que usa `ConfigService` para conectarse a PostgreSQL. Usamos `getOrThrow`, entonces si falta una variable la app no arranca. Luego importa los cinco modulos de dominio: Auth, Usuarios, Busquedas, Catalogo y Comparacion.

Cada modulo tiene la misma estructura. Por ejemplo, `CatalogoModule` registra sus entidades con `TypeOrmModule.forFeature`, declara su controlador, su servicio como provider y exporta el servicio porque Busquedas y Comparacion lo reutilizan.

El controlador solo recibe la peticion HTTP y delega. Fijense en el constructor: `private readonly catalogoService: CatalogoService`. Eso es inyeccion de dependencias: no hacemos `new CatalogoService()`, Nest crea la instancia y nos la entrega. En el servicio pasa lo mismo con los repositorios, usando `@InjectRepository`. Asi separamos responsabilidades: el controlador maneja HTTP, el servicio la logica de negocio y el repositorio el acceso a datos."

---

## 3. Persistencia con TypeORM - JENIFER (1.5 min)

Pantalla: `oferta-academica.entity.ts` -> `usuario.entity.ts` -> `perfil.entity.ts` -> pgAdmin o Swagger (opcional).

"Yo me encargue de las entidades. Una entidad es una clase que TypeORM convierte en tabla. Por ejemplo, `OfertaAcademica`: con `@Entity('ofertas_academicas')` le damos el nombre de la tabla; el id es un UUID con `@PrimaryGeneratedColumn('uuid')`; el codigo SNIES es unico; y tenemos costo, modalidad, jornada, duracion y acreditacion. Ademas, `@CreateDateColumn` y `@UpdateDateColumn` llenan solas las fechas de registro y actualizacion.

Las relaciones: una oferta pertenece a una universidad y a una carrera, con `@ManyToOne`. Del otro lado, la universidad y la carrera tienen `@OneToMany` hacia sus ofertas. Pusimos `onDelete: 'CASCADE'`: si se borra una universidad, se borran sus ofertas.

En `Usuario` hay dos relaciones mas: `@ManyToMany` con ofertas para los favoritos, que crea una tabla intermedia, y `@OneToOne` con `Perfil`, con `cascade: true` para que al guardar el usuario se guarde su perfil. Las busquedas tienen un `@ManyToOne` opcional al usuario, con `onDelete: 'SET NULL'`, porque una busqueda se puede hacer sin estar logueado.

Las tablas se crean solas porque en desarrollo usamos `synchronize: true`; el comentario en el codigo aclara que en produccion habria que usar migraciones."

---

## 4. DTOs, validaciones y manejo de errores - JUAN CAMILO (1.5 min)

Pantalla: `main.ts` (ValidationPipe) -> `catalogo.dto.ts` -> Postman carpeta Errores -> `query-failed.filter.ts` -> consola con el log del interceptor.

"Para validar los datos que llegan usamos DTOs con `class-validator`. En `main.ts` registramos un `ValidationPipe` global con tres opciones: `whitelist` quita campos que no estan en el DTO, `forbidNonWhitelisted` rechaza la peticion si mandan un campo extra, y `transform` convierte los tipos, por ejemplo un query string a numero.

En `CrearOfertaDto` se ve: `@IsInt` y `@Min(0)` para el costo, `@IsIn(MODALIDADES)` para que la modalidad solo pueda ser presencial, virtual o hibrida, `@IsUUID` para los ids de universidad y carrera. Para actualizar no repetimos todo: `ActualizarOfertaDto extends PartialType(CrearOfertaDto)`, que vuelve todos los campos opcionales. Eso es lo que usamos en el PATCH.

Demo en Postman: mando un POST con modalidad `a distancia` -> 400 con el mensaje de validacion. Pido un id que no es UUID -> 400 por el `ParseUUIDPipe`. Pido un UUID que no existe -> 404, porque el servicio lanza `NotFoundException`. Y creo una oferta con un SNIES repetido -> 409.

Para errores de base de datos hice un filtro global, `QueryFailedFilter`. Captura los errores de TypeORM y los traduce: el codigo 23505 de PostgreSQL, que es registro duplicado, lo devuelve como 409 Conflict; el 23503, de llave foranea, tambien como 409; y cualquier otro como 500 sin exponer detalles internos.

Tambien agregue un interceptor que registra en consola cada peticion con metodo, ruta, codigo y tiempo de respuesta, y configure GitHub Actions para que en cada PR corra lint, pruebas y build."

---

## 5. Autenticacion, roles y CRUD del catalogo - NICOLAS (2 min)

Pantalla: `roles.guard.ts` -> `catalogo.controller.ts` (decoradores) -> Postman Auth + Catalogo -> Swagger `/docs`.

"Yo hice la autenticacion con JWT. Al registrarse, la clave se guarda con hash de bcrypt, nunca en texto plano. El login devuelve un `accessToken` y un `refreshToken`, y existe `/auth/refresh` para renovarlo.

La autorizacion se hace con guards. `JwtAuthGuard` verifica el token. `RolesGuard` lee el decorador `@Roles('admin')` con el `Reflector` y revisa si el rol del usuario esta permitido. Y `PropietarioGuard` hace que en `/usuarios/:id` solo puedas ver o editar tus propios datos, salvo que seas admin.

En el controlador del catalogo se ve como se combinan: los GET son publicos, y los POST, PUT, PATCH y DELETE tienen `@UseGuards(JwtAuthGuard, RolesGuard)` y `@Roles('admin')`.

Demo en Postman:

1. POST `/auth/login` con el admin -> devuelve los tokens.
2. POST `/carreras` -> 201, se crea la carrera.
3. PATCH `/carreras/:id` cambiando solo el area -> 200, solo cambia ese campo. El PUT tambien existe por compatibilidad.
4. DELETE `/carreras/:id` -> 200.
5. Login como estudiante e intento POST `/carreras` -> 403 Forbidden. Sin token -> 401.

Todo esto esta documentado en Swagger en `/docs`, donde se puede probar cada endpoint con el boton Authorize, y tambien en `docs/api.md` y la coleccion de Postman."

---

## 6. Demo de busqueda y comparacion - JENIFER (1.5 min)

Pantalla: Postman Catalogo/Busquedas/Comparaciones -> `busqueda.service.ts` -> `scoring.service.ts`.

"Ahora la funcionalidad principal. Primero el catalogo con filtros, que fueron mios: `GET /carreras?area=Ingenieria` filtra por area, `GET /universidades?ciudad=Medellin` por ciudad, y `GET /universidades/:id` trae la universidad con sus ofertas.

Ahora `POST /busquedas` con carrera `Ingenieria de Sistemas`, ciudad `Bogota`, costo maximo, modalidad presencial, jornada diurna y pesos de preferencia. Responde 201 con el id de la busqueda, el total y los resultados ordenados. En este caso devuelve dos ofertas: Universidad Nacional y Universidad de los Andes.

Ojo: los nombres del seed no llevan tilde, asi que se escribe `Ingenieria` y `Bogota`. Con `Ingeniería` no encuentra porque la comparacion es exacta salvo mayusculas.

Como funciona: en `BusquedaService` primero se filtran las ofertas que cumplen los criterios. Despues `ScoringService` calcula el puntaje: cada criterio, que son costo, modalidad, ubicacion y acreditacion, da un valor entre 0 y 1, se multiplica por el peso que eligio el usuario y se normaliza a 0-100. Por eso cada resultado trae un desglose. Yo agregue el desempate: si dos ofertas tienen el mismo puntaje gana la mas barata y luego se ordena por nombre de universidad. Tambien corregi que la ciudad se compare sin importar mayusculas. La busqueda queda guardada y se puede consultar con `GET /busquedas/:id/resultados`; si se manda `usuarioId`, se asocia al usuario.

Un detalle honesto: la ciudad y la modalidad son filtros duros, por eso en los resultados esos dos criterios siempre valen 1; el orden lo deciden el costo y la acreditacion. Si quisieramos que la ubicacion fuera una preferencia suave, no filtrariamos y la puntuariamos 0 o 1.

Por ultimo, `POST /comparaciones` con entre 2 y 4 ofertas: arma una tabla con costo total, duracion, acreditacion y un puntaje, y dice cual es la mejor oferta. Si repito una oferta da 400. La comparacion se puede consultar y borrar con DELETE."

---

## 7. Git, trabajo colaborativo, pruebas e IA - NICOLAS (1.5 min)

Pantalla: GitHub > Insights/Contributors > Branches > Pull requests cerradas (abrir una, por ejemplo #34 de Jenifer o #33 de Juan) -> terminal con `npm test`.

"Sobre el trabajo en equipo: usamos un Git Flow simplificado. La rama de integracion es `develop`, y cada funcionalidad se hizo en una rama `feature/...`, por ejemplo `feature/auth-jwt`, `feature/frontend-react`, `feature/swagger` o `feature/mejoras-interfaz`. Cada rama se integro con un Pull Request; hay mas de 45 PR mergeados y los tres participamos con commits y PRs propios. Los commits siguen Conventional Commits: `feat`, `fix`, `test`, `docs`, `refactor`, `chore`.

Sobre calidad: tenemos 147 pruebas unitarias con Jest, que no necesitan base de datos porque mockeamos los repositorios, y 43 pruebas end-to-end que corren contra una base de datos aislada para no tocar los datos reales. Corren en cada PR con GitHub Actions. (Mostrar `npm test` en verde.)

Como trabajo adicional investigamos Swagger, JWT con refresh token, guards personalizados, filtros e interceptores globales, Docker y un frontend en React que consume la API.

Sobre la inteligencia artificial: la usamos como apoyo para resolver dudas, revisar errores y generar pruebas y documentacion. Pero cada cambio paso por nosotros en un PR, y como acaban de ver, cada uno puede explicar el codigo que hizo y por que tomamos cada decision.

Eso es API SAN. Gracias por su atencion."

---

## Preguntas probables

| Pregunta | Quien | Respuesta corta |
|---|---|---|
| Que es la inyeccion de dependencias? | Juan | Nest crea las instancias de los providers y las pasa por el constructor; el modulo declara que providers existen y cuales exporta. |
| Diferencia PUT vs PATCH? | Nicolas | En REST PUT reemplaza y PATCH actualiza parcialmente. En nuestra implementacion, por compatibilidad, PUT y PATCH comparten el DTO parcial; el recomendado es PATCH. Un PUT estricto exigiria todos los campos. |
| Que pasa si mando un campo extra? | Juan | `forbidNonWhitelisted` responde 400. |
| Por que UUID y `ParseUUIDPipe`? | Jenifer | Ids no adivinables; el pipe rechaza con 400 antes de llegar a la base. |
| Que hace `synchronize: true`? | Jenifer | Crea y ajusta tablas desde las entidades; solo para desarrollo. En produccion, migraciones. |
| Como se calcula el puntaje? | Jenifer | Promedio ponderado de cuatro criterios (0-1) por los pesos, normalizado a 0-100. Ciudad y modalidad son filtros duros; el orden lo deciden costo y acreditacion. |
| Como se protege una ruta solo para admin? | Nicolas | `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('admin')`. |
| Como se maneja un SNIES duplicado? | Juan | `QueryFailedFilter` convierte el 23505 de PostgreSQL en 409. |
| Por que algunas respuestas son `{message, data}` y otras el recurso? | Cualquiera | Es una decision de compatibilidad: las escrituras devuelven mensaje y data, las lecturas el recurso. Esta documentado en `docs/api.md`; reconocerlo como inconsistencia menor. |
| Como se calcula el puntaje de la comparacion? | Jenifer | 50 puntos por acreditacion + 50 proporcional al costo total (`50 * (1 - costoTotal / maxCostoTotal)`). |

## Pequenas modificaciones para practicar

- Agregar un campo a una entidad y su validacion en el DTO (por ejemplo `descripcion` en `Carrera` con `@IsOptional()` y `@IsString()`).
- Agregar un filtro nuevo por query. `jornada` ya existe en `FiltroOfertaDto`; para practicar uno nuevo, usar `duracionMax` o `snies`.
- Hacer publico o solo-admin un endpoint cambiando los decoradores.
- Cambiar los limites de la comparacion (`@ArrayMinSize(2)` y `@ArrayMaxSize(4)` en `comparacion.dto.ts`).
- Cambiar el peso de un criterio en `PESOS_POR_DEFECTO` y explicar como cambia el orden.

## Verificacion antes de grabar

- Cronometrar un ensayo: cada bloque cabe en el tiempo marcado (total 9-10 min; minimo exigido 5).
- `npm test` en verde.
- `npm run test:e2e` en verde (requiere PostgreSQL).
- `npx newman run docs/postman/api-san.postman_collection.json --env-var baseUrl=http://localhost:<puerto>` con 0 fallos.
- Revisar que el puerto de Postman, Swagger y los `curl` sea el mismo.
- No mostrar archivos locales que no esten en el repositorio (por ejemplo instaladores o `.env`).
