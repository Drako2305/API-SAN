# Auditoria de la rubrica del proyecto final - API SAN

- Fecha: 2026-11-17
- Base de evaluacion: `origin/develop` (rama por defecto, lo que ve quien clona el repo).
- Rama de trabajo revisada: `feature/patch-y-sincronizacion` (HEAD, 10 commits sobre develop, incluye el codigo de los PR #36, #37 y #38 que aun no estan mergeados).
- Alcance: lectura de codigo, historial y PRs con comandos de solo lectura. No se levanto la API, no se ejecutaron las pruebas e2e (requieren PostgreSQL) y no se modifico ningun archivo distinto de este.
- Estados: **Cumple**, **Parcial**, **En progreso** (trabajo activo en `feature/patch-y-sincronizacion`), **Falta**.
- Lineas: las referencias son al arbol de trabajo actual. Hay archivos con cambios sin commit de otros agentes (`catalogo.controller.ts`, `usuario.controller.ts`, entidades de catalogo, `app.module.ts`); en esos casos se cita el decorador o la ruta, porque las lineas se mueven.

## Resumen

- **Fortalezas:** NestJS con 5 modulos de recurso, 7 entidades TypeORM con relaciones 1:N, 1:1 y N:M, `ValidationPipe` global, CI en verde en develop, 35 de 38 PR mergeados con 2 aprobaciones de distintos integrantes y participacion de los tres integrantes en commits y PR.
- **Pendiente critico:** PR #36, #37 y #38 estan abiertos con 0 aprobaciones. Hasta que se mergeen, develop no tiene escrituras del catalogo (POST/PUT/DELETE), ni autenticacion JWT, ni Swagger. Develop expone 21 rutas; HEAD, 31; el arbol de trabajo, 36.
- **Falta:** solo el video de sustentacion (no existe en el repo).
- **En progreso:** PATCH, timestamps del catalogo, coleccion Postman y cuatro secciones del README (Equipo, Postman, Arquitectura, Flujo Git).

---

## 1. Funcionamiento de la API

| Item | Estado | Evidencia | Accion |
|---|---|---|---|
| NestJS como framework | Cumple | `package.json` (`@nestjs/core` ^12.0.1); `src/main.ts:9` `NestFactory.create(AppModule)` | Ninguna |
| CRUD de escrituras del catalogo (POST/PUT/DELETE de carreras, universidades y ofertas) | Parcial | Solo en PR #36 (abierto, 0 aprobaciones). Develop no tiene ningun `@Post` en `catalogo.controller.ts`. HEAD si (`catalogo.controller.ts` lineas 45, 82, 119) | Aprobar y mergear PR #36 |
| Autenticacion (registro, login, refresh) | Parcial | PR #37 abierto (0 aprobaciones). `src/auth/auth.controller.ts:11,16,21` en HEAD; no existe en develop | Aprobar y mergear PR #37 |
| Swagger en `/docs` | Parcial | PR #38 abierto (0 aprobaciones). `src/main.ts:25` `SwaggerModule.setup('docs', ...)` en HEAD; no existe en develop | Aprobar y mergear PR #38 |
| Endpoints de usuarios, favoritos, busquedas y comparaciones | Cumple | En develop: `usuario.controller.ts` (GET/PUT, preferencias, favoritos), `busqueda.controller.ts:18,23,28`, `comparacion.controller.ts:19,24,29` | Ninguna |
| PATCH en recursos | En progreso | Solo en el arbol de trabajo: `usuario.controller.ts` (`@Patch(':id')`, `@Patch(':id/preferencias')`) y `catalogo.controller.ts` (`@Patch` en carreras, universidades y ofertas). No hay PATCH en develop ni en HEAD | Terminar y commitear en `feature/patch-y-sincronizacion` |
| Conteo de rutas | Informativo | `@Get/@Post/@Put/@Patch/@Delete` en `src/**/*.controller.ts`: develop 21, HEAD 31, arbol de trabajo 36 | Ninguna |
| Codigos HTTP adecuados | Cumple | POST responde 201 (default de Nest); `src/busquedas/busqueda.service.ts:28,106` lanza `NotFoundException` (404); `src/common/filtros/query-failed.filter.ts` traduce `23505` y `23503` a 409; guards responden 401 y 403 | Ninguna |
| Consistencia de la forma de respuesta | Parcial | Escrituras del catalogo con `{ message, data }`; lecturas devuelven el recurso directo. Esta documentado en `docs/api.md` (seccion Convenciones), pero es una forma mixta | Decidir y sustentar, o unificar |
| Validacion de entrada | Cumple | `src/main.ts:11-15` `ValidationPipe` con `whitelist`, `forbidNonWhitelisted` y `transform` | Ninguna |
| Manejo global de errores de BD | Cumple | `src/common/filtros/query-failed.filter.ts` registrado con `APP_FILTER` en `src/app.module.ts:40` | Ninguna |
| Pruebas unitarias | Cumple | `npm test`: 17 suites y 116 pruebas pasando (arbol de trabajo). Dos suites nuevas sin commit (`catalogo.controller.spec.ts`, `usuario.controller.spec.ts`, 5 pruebas). Sin ellas: 15 suites y 111 pruebas (HEAD). Develop no se midio | Commitear los specs nuevos |
| Pruebas e2e | Parcial | 4 archivos en `test/` (`app`, `busquedas`, `catalogo`, `usuarios`). Job `e2e` en `.github/workflows/ci.yml` con PostgreSQL 17. No se ejecutaron en esta auditoria. Las ultimas ejecuciones de CI en develop terminaron en success | Correrlas en local (`docker compose up -d postgres`) antes de la demo |
| Lint | Cumple | `npx oxlint src/ test/` sin errores (exit 0) | Ninguna |
| Chequeo de tipos | Cumple (build) / Parcial (specs) | `npx tsc -p tsconfig.build.json --noEmit` exit 0. `npx tsc -p tsconfig.json --noEmit` reporta 92 errores, todos en `*.spec.ts` (ej. `src/auth/auth.service.spec.ts:43`). Jest los ignora y pasa | Corregir tipos de los specs (riesgo menor) |
| Docker | Cumple | `Dockerfile` multi-etapa sobre `node:24-alpine`, `USER node`, `HEALTHCHECK`; `docker-compose.yml` con `postgres`, `api` y `pgadmin` | Ninguna |
| Seed de datos | Cumple | `npm run seed` -> `src/seed.ts`; `src/common/semilla.ts:229,244,287,344` busca antes de insertar (idempotente) | Ninguna |

## 2. Git y GitHub

| Item | Estado | Evidencia | Accion |
|---|---|---|---|
| Commits de los tres integrantes | Cumple | `git shortlog -sn origin/develop`: Nicolas Diaz 54, Jenifer Urbano 26, Juan Camilo Lopez Diaz 26 | Vigilar el desequilibrio (51% de los commits de develop son de una persona) |
| Ramas por funcionalidad | Cumple | 37 ramas `origin/feature/*` con nombre `feature/<nombre>` (`AGENTS.md:7`) | Ninguna |
| PR por integrante | Cumple | 38 PR: Nicolas 18 (3 abiertos), Jenifer 10, Juan 10 (`gh pr list --state all`) | Ninguna |
| Revisiones y aprobaciones | Cumple | 35 PR mergeados; cada uno con 2 aprobaciones de integrantes distintos. Aprobaciones dadas: Juan 25, Jenifer 25, Nicolas 20 | Ninguna |
| PR pendientes de aprobacion | En progreso (riesgo) | PR #36, #37 y #38 abiertos, 0 reviews | Dos aprobaciones por PR, sin comentarios (`.agents/workflow.md:18-19`) |
| Convencion de commits | Cumple | Prefijos `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:` en el historial | Ninguna |
| Plantilla de PR y banner | Parcial | Definidos en `.agents/workflow.md:20,43`. No se reviso el cuerpo de cada PR | Revisar los PR abiertos contra la plantilla |
| Regla de no atribucion a IA | Parcial | `AGENTS.md:11` la prohibe. Los commits `8d65676` (PR #6) y `fa82037` incluyen un trailer de atribucion a IA en el mensaje | Decision del equipo (ver riesgos) |
| README: descripcion | Cumple | `README.md:3-7` | Ninguna |
| README: requisitos | Cumple | `README.md:9-13` (Node 24, npm, Docker con Compose v2) | Ninguna |
| README: configuracion de la base de datos | Cumple | `README.md:24-40` (`docker compose up -d postgres`, `npm run seed`, variables `POSTGRES_*`) | Ninguna |
| README: ejecucion | Cumple | `README.md:42-68` (local, todo en Docker, prueba con curl) | Ninguna |
| README: seccion Equipo | En progreso | No existe en `README.md` (encabezados en lineas 1-129) | Agregar en progreso |
| README: seccion Postman | En progreso | No existe seccion ni `docs/postman/` | Agregar en progreso |
| README: seccion Arquitectura | En progreso | No existe (solo "Estructura de carpetas", `README.md:98`) | Agregar en progreso |
| README: seccion Flujo Git | En progreso | No existe | Agregar en progreso |

## 3. Conocimientos

### 3.1 Arquitectura NestJS

| Item | Estado | Evidencia | Accion |
|---|---|---|---|
| Modulos por recurso | Cumple | `src/app.module.ts:33-37`: `AuthModule`, `UsuarioModule`, `BusquedaModule`, `CatalogoModule`, `ComparacionModule` | Ninguna |
| Controladores solo HTTP | Cumple | `src/catalogo/catalogo.controller.ts:36-38` delega en `catalogoService.listarCarreras`; el mismo patron en los 5 controladores | Ninguna |
| Servicios con la logica | Cumple | `src/busquedas/busqueda.service.ts:22` (`crear`), `src/busquedas/scoring.service.ts:14` (`ScoringService`); 5 services con `@InjectRepository` (auth, busquedas, catalogo, comparacion, usuarios) | Ninguna |
| Inyeccion de dependencias | Cumple | Constructores con `private readonly` (ej. `src/usuarios/usuario.controller.ts:28`); `ComparacionModule` importa `CatalogoModule` | Ninguna |
| Guards, filtros e interceptores | Cumple | `JwtAuthGuard`, `RolesGuard`, `PropietarioGuard` (`src/auth/`); `QueryFailedFilter` y `LoggingInterceptor` registrados como `APP_FILTER` y `APP_INTERCEPTOR` en `src/app.module.ts:40-41` | Ninguna |

### 3.2 API REST (GET, POST, PUT, PATCH, DELETE)

| Item | Estado | Evidencia | Accion |
|---|---|---|---|
| GET | Cumple | `catalogo.controller.ts` (listas y detalle de carreras, universidades y ofertas), `busqueda.controller.ts:23,28`, `usuario.controller.ts` (`@Get`) | Ninguna |
| POST | Cumple | `auth.controller.ts:11,16,21`, `busqueda.controller.ts:18`, `comparacion.controller.ts:19`, `usuario.controller.ts` (`POST :id/favoritos`); catalogo en PR #36 | Ninguna |
| PUT | Cumple | `usuario.controller.ts` (`PUT :id`, `PUT :id/preferencias`); `catalogo.controller.ts` (`PUT` de carreras, universidades y ofertas) | Ninguna |
| PATCH | En progreso | Solo en el arbol de trabajo: 2 rutas en usuarios y 3 en catalogo. Ver seccion 1 | Terminar en `feature/patch-y-sincronizacion` |
| DELETE | Cumple | `comparacion.controller.ts:29`, `usuario.controller.ts` (`DELETE :id/favoritos/:ofertaId`), `catalogo.controller.ts` (`DELETE` de carreras, universidades y ofertas) | Ninguna |

### 3.3 DTOs y validaciones

| Item | Estado | Evidencia | Accion |
|---|---|---|---|
| DTOs con class-validator | Cumple | En `src/**/*.dto.ts`: 20 `@IsNotEmpty`, 17 `@IsString`, 14 `@IsOptional`, 7 `@IsUUID`, 7 `@IsInt`, 4 `@IsIn`, 3 `@ValidateNested`, 2 `@IsEmail`, entre otros | Ninguna |
| DTOs de actualizacion | Cumple | `PartialType` en `src/catalogo/catalogo.dto.ts:22,42,81` y `src/usuarios/usuario.dto.ts:43` | Ninguna |
| Validacion de IDs | Cumple | `ParseUUIDPipe` en los parametros `:id` (ej. `usuario.controller.ts:31`); `@IsUUID` en filtros y DTOs | Ninguna |
| Mensajes de validacion | Parcial | Los DTOs no tienen mensajes propios: salen en ingles (`docs/api.md`, Convenciones), aunque `AGENTS.md` pide mensajes en espanol | Agregar mensajes en espanol o documentarlo como decision |

### 3.4 Persistencia con TypeORM y entidades

| Item | Estado | Evidencia | Accion |
|---|---|---|---|
| Conexion TypeORM | Cumple | `src/app.module.ts:19-30` `TypeOrmModule.forRootAsync` con `ConfigService.getOrThrow` | Ninguna |
| Entidades | Cumple | 7 entidades: `Usuario`, `Perfil`, `Carrera`, `Universidad`, `OfertaAcademica`, `Busqueda`, `Comparacion` | Ninguna |
| Relaciones | Cumple | 1:N `carrera.entity.ts:20` y `universidad.entity.ts:26`; N:1 `oferta-academica.entity.ts:39,45`; 1:1 `usuario.entity.ts:44-45` (perfil, con cascade); N:M favoritos `usuario.entity.ts:40-43` (`usuario_favoritos`); N:M `comparacion.entity.ts:19`; N:1 `busqueda.entity.ts:23` | Ninguna |
| Repositorios | Cumple | `@InjectRepository` en 5 services | Ninguna |
| Timestamps | En progreso | `usuario.entity.ts:48,51` y `perfil.entity.ts:23,26` ya los tienen. En catalogo (`carrera`, `universidad`, `oferta-academica`) hay cambios sin commit con `timestamptz` | Commitear en `feature/patch-y-sincronizacion` |
| Migraciones | Parcial | `synchronize: true` en `src/app.module.ts:29` (con el comentario "solo para desarrollo"). No hay carpeta de migraciones | Sustentar; migraciones antes de produccion |
| Seed idempotente | Cumple | `src/common/semilla.ts:229,244,287,344` (`findOneBy` antes de insertar) | Ninguna |

### 3.5 Buenas practicas

| Item | Estado | Evidencia | Accion |
|---|---|---|---|
| Organizacion por recurso | Cumple | `src/<recurso>/` con controller, service, dto, module y entity; documentado en `README.md:98-127` y `AGENTS.md` | Ninguna |
| Separacion de responsabilidades | Cumple | Controllers sin logica de negocio; services lanzan excepciones de Nest (29 usos en `src/**/*.service.ts`) | Ninguna |
| Configuracion por entorno | Cumple | `src/env.model.ts`; `ConfigModule.forRoot({ isGlobal: true })` en `src/app.module.ts:16-18`; `.env` ignorado por git (`git check-ignore .env` lo confirma) | Ninguna |
| CORS configurable | Cumple | `src/main.ts:18` con `CORS_ORIGIN` | Ninguna |
| Credenciales | Cumple | `bcrypt.hash` con `RONDAS_HASH = 10` (`src/auth/auth.service.ts:21,45`) y `bcrypt.compare` en el login (`auth.service.ts:61`). Pendiente de merge (PR #37) | Ninguna |
| Autorizacion | Cumple | `JwtAuthGuard` + `PropietarioGuard` en `UsuarioController`; `JwtAuthGuard` + `RolesGuard` + `@Roles('admin')` en las escrituras del catalogo. Pendiente de merge (PR #37 y #36) | Mergear PR #36 y #37 |
| Logging de peticiones | Cumple | `src/common/interceptores/logging.interceptor.ts` registra metodo, URL, status y duracion; `APP_INTERCEPTOR` en `src/app.module.ts:41` | Ninguna |
| Pruebas | Cumple | 17 suites unitarias; 4 archivos e2e; `test/jest-e2e.json:7` `maxWorkers: 1` (las suites comparten BD) | Ninguna |
| CI | Cumple | `.github/workflows/ci.yml`: job `calidad` (lint, build, pruebas unitarias) y job `e2e` (PostgreSQL 17). Ejecuciones recientes en develop: success | Ninguna |
| Imagen Docker | Cumple | `Dockerfile`: multi-etapa, `USER node`, `HEALTHCHECK` | Ninguna |
| Documentacion de la API | Parcial | `docs/api.md` describe los endpoints de la rama, pero no lista PATCH ni hay coleccion Postman; Swagger esta en PR #38 | Actualizar al terminar PATCH |

## 4. Investigacion y uso de IA (conceptos extra)

| Item | Estado | Evidencia | Accion |
|---|---|---|---|
| Referencias externas usadas | Parcial | `AGENTS.md:19,41` cita `IvonneBarco/book-nestjs-5a` y `5b` como estilo de referencia | Explicar en el README o en el video que referencia se uso y que se adapto |
| Uso de IA documentado | Parcial | `AGENTS.md` y `.agents/workflow.md` son reglas para agentes (git, arquitectura, convenciones). No hay un documento en `docs/` que explique para que se uso IA, con que criterio y como se verifico lo generado | Redactar una seccion breve (herramienta, uso, verificacion humana) |
| Conceptos extra implementados | Cumple | CI con e2e (`ci.yml`), Docker con healthcheck, pgAdmin precargado (`docker/pgadmin/servers.json`), log HTTP, scoring ponderado con desempate (PR #31). JWT y Swagger pendientes de merge (PR #37, #38) | Mostrarlos en la demo |

---

## Entregables

| Entregable | Estado | Evidencia | Accion |
|---|---|---|---|
| Repositorio con contribuciones de todos | Cumple | Ver seccion 2 (commits, PR, aprobaciones) | Ninguna |
| README (descripcion, requisitos, configuracion de BD, ejecucion) | Cumple | `README.md:3-68` | Completar Equipo, Postman, Arquitectura y Flujo Git |
| API demostrable con Postman o Insomnia | En progreso | No hay coleccion en el repo (`docs/` solo tiene `api.md`). Trabajo en `docs/postman/` en progreso | Cubrir registro, login, busqueda, comparacion, PATCH y casos 401, 403, 404 y 409 |
| Sustentacion (video de 5 minutos o mas) | Falta | No existe en el repo. Guion sugerido abajo | Grabar con los tres integrantes |

---

## Riesgos y pendientes del equipo

1. **PR #36, #37 y #38 sin aprobaciones (0 de 2 cada uno).** Develop no tiene escrituras del catalogo, autenticacion ni Swagger. `feature/patch-y-sincronizacion` ya contiene sus commits (HEAD es develop mas 10 commits), asi que su PR arrastrara cambios no mergeados. Accion: dos aprobaciones por PR, sin comentarios (`.agents/workflow.md:19`), o acordar el orden de merge.
2. **Video de sustentacion inexistente (Falta).** Grabarlo con el guion de abajo.
3. **`docker-desktop-x86_64.rpm` (446 MB) en la raiz.** Sin trackear y sin entrada en `.gitignore`. No commitearlo. Moverlo fuera del repo o agregarlo a `.gitignore` (decision del equipo; no se modifico nada).
4. **Cambios sin commit en `src/` y `test/`.** Incluyen `app.module.ts`, entidades de catalogo, controladores, `test/catalogo.e2e-spec.ts` y 2 specs nuevos. Es trabajo en progreso de otros agentes; las lineas de este documento pueden moverse.
5. **Atribucion a IA en el historial.** Los commits `8d65676` (PR #6) y `fa82037` incluyen un trailer de atribucion a IA, contrario a `AGENTS.md:11`. Reescribir historia ya mergeada en develop es disruptivo; es decision del equipo. La regla aplica a los commits y PR nuevos.
6. **Chequeo de tipos.** `tsc -p tsconfig.json` reporta 92 errores, todos en archivos `*.spec.ts`. El build de produccion (`tsconfig.build.json`) pasa.
7. **`synchronize: true` sin migraciones** (`src/app.module.ts:29`). Aceptable para la entrega si se explica; no para produccion.
8. **Desequilibrio de commits.** En develop, Nicolas tiene 54 de 106 commits. Todas las ramas suman 127 commits (Nicolas 75, con dos correos). Cada integrante debe poder explicar su parte en la sustentacion.
9. **Correos en el historial.** Nicolas y Jenifer tienen dos correos cada uno. Verificar que el correo de los commits este asociado a su cuenta de GitHub para que cuenten en su perfil.
10. **Ramas del frontend.** Los commits del frontend Angular estan en `feature/frontend-base`, no en `feature/frontend-react` (el brief indica React). Confirmar cual es la rama oficial.
11. **E2E no ejecutadas en esta auditoria.** La evidencia de CI en develop es la ultima ejecucion en success. Correrlas en local antes de la demo.

---

## Guion sugerido de sustentacion (5 minutos o mas)

Reparto segun quien autoro cada PR (`gh pr list --state all`):

- **Nicolas Diaz** (NicoalsD, 18 PR): #1, #4, #5, #6, #9, #10, #13, #16, #17, #20, #23, #26, #29, #32, #35, #36, #37, #38.
- **Juan Camilo Lopez Diaz** (Juansit-0, 10 PR): #2, #7, #11, #14, #18, #21, #24, #27, #30, #33.
- **Jenifer Urbano** (Jenifrutica, 10 PR): #3, #8, #12, #15, #19, #22, #25, #28, #31, #34.

| Bloque | Quien | Tiempo | Contenido | Archivos a mostrar |
|---|---|---|---|---|
| 1. Introduccion y arquitectura | Nicolas | 1:00 | Problema que resuelve la API, capas controller-service-repositorio, arranque | `src/main.ts`, `src/app.module.ts`, Swagger en `/docs` |
| 2. Persistencia | Juan | 1:30 | TypeORM con `ConfigService`, Postgres en Docker, `synchronize` y su riesgo, scoring con pesos y desempate | `src/app.module.ts:19-30`, `src/busquedas/scoring.service.ts`, `docker-compose.yml` |
| 3. Modelo de datos y catalogo | Jenifer | 1:30 | Entidades y relaciones (1:N, 1:1, N:M), perfil 1:1, catalogo y comparacion, filtros | `src/catalogo/*.entity.ts`, `src/usuarios/perfil.entity.ts`, `src/comparacion/comparacion.controller.ts` |
| 4. Seguridad y escrituras | Nicolas | 1:30 | JWT con bcrypt, roles, `PropietarioGuard`, escrituras solo para admin, PATCH | `src/auth/auth.service.ts`, `src/auth/roles.guard.ts`, `src/auth/propietario.guard.ts` |
| 5. Calidad | Juan | 0:45 | Pruebas unitarias y e2e, CI, healthcheck de Docker, error de BD traducido a 409 | `.github/workflows/ci.yml`, `src/common/filtros/query-failed.filter.ts`, `Dockerfile` |
| 6. Demo en vivo | Los tres | 1:30 | Registro, login, busqueda, comparacion, PATCH, y un 403 con estudiante | Postman (en progreso) o Swagger |

Total aproximado: 7:45 con margen para preguntas.

## Preguntas probables del profesor

1. **Por que PUT y PATCH si el DTO ya es parcial?** En `usuario.controller.ts`, PUT y PATCH llaman al mismo metodo (`usuarioService.actualizar`), y el DTO usa `PartialType` (`usuario.dto.ts:43`). PUT se mantiene por compatibilidad; la semantica estricta (reemplazo completo) no se implementa. Admitirlo.
2. **Como se validan los datos de entrada?** `src/main.ts:11-15`: `ValidationPipe` con `whitelist` y `forbidNonWhitelisted` (campos no declarados -> 400) y `transform`. Las reglas estan en los DTOs (`src/catalogo/catalogo.dto.ts`) con class-validator.
3. **Como se protege un endpoint?** `JwtAuthGuard` valida el Bearer; `RolesGuard` con `@Roles('admin')` protege las escrituras del catalogo; `PropietarioGuard` deja a cada usuario ver solo sus datos (`src/auth/`).
4. **Que pasa si un estudiante intenta crear una carrera?** Responde 403 con "No tienes permisos para esta accion" (`src/auth/roles.guard.ts`).
5. **Como se maneja un duplicado, por ejemplo un SNIES repetido?** `src/common/filtros/query-failed.filter.ts` traduce el error `23505` de PostgreSQL a 409. El correo duplicado en el registro se valida en `src/auth/auth.service.ts` (ConflictException). El SNIES es `unique` en `oferta-academica.entity.ts`.
6. **Por que `synchronize: true` y que pasa en produccion?** Crea y ajusta tablas automaticamente (`src/app.module.ts:29`). En produccion puede borrar datos al cambiar entidades; hay que pasar a migraciones de TypeORM antes de desplegar.
7. **Como se calcula el puntaje de una oferta?** `src/busquedas/scoring.service.ts:19,34-39`: suma ponderada por criterio (costo, modalidad, ubicacion, acreditacion) con pesos del usuario o por defecto, y desempate en resultados (PR #31).
8. **Como funciona el seed y por que es idempotente?** `npm run seed` ejecuta `src/seed.ts`; `src/common/semilla.ts` busca cada registro (`findOneBy`) antes de insertarlo, asi que se puede correr varias veces sin duplicar datos.
