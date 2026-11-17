# API SAN

API SAN (Sistema Academico de Navegacion) es una API REST hecha con NestJS para buscar, consultar y comparar ofertas academicas. Dada una carrera y los parametros del usuario (ciudad, costo maximo, modalidad, jornada y pesos de preferencia), identifica las universidades que la ofrecen y las ordena por afinidad.

Los datos se guardan en PostgreSQL y se acceden con TypeORM.

La referencia de endpoints (metodos, campos, validaciones, respuestas, errores y ejemplos curl) esta en [docs/api.md](docs/api.md).

## Equipo

- Nicolas Diaz (GitHub: NicoalsD)
- Juan Camilo Lopez (GitHub: Juansit-0)
- Jenifer Urbano (GitHub: Jenifrutica)

## Requisitos

- Node.js 24 (la imagen Docker usa `node:24-alpine`).
- npm (viene con Node.js).
- Docker con Docker Compose v2 para levantar PostgreSQL. Tambien sirve para correr la API y pgAdmin en contenedores.

## Instalacion

```bash
npm install
cp .env.example .env
```

El `.env` contiene `PORT`, `CORS_ORIGIN` (origen del frontend, `http://localhost:5173`), `FRONTEND_PORT`, las variables JWT (`JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`), las variables `POSTGRES_*` y las de pgAdmin (`PGADMIN_EMAIL`, `PGADMIN_PASSWORD`, `PGADMIN_PORT`). La app no arranca si falta alguna variable de PostgreSQL o JWT, porque se leen con `getOrThrow`. El `.env` no se commitea.

## Base de datos

1. Levantar PostgreSQL:

   ```bash
   docker compose up -d postgres
   ```

   Queda expuesto en `localhost:5432` (o el valor de `POSTGRES_PORT`). Si ese puerto ya lo usa un PostgreSQL local, cambiar `POSTGRES_PORT` en `.env` (por ejemplo a `5433`).

2. Cargar el catalogo inicial:

   ```bash
   npm run seed
   ```

   Carga carreras, universidades, ofertas y un usuario demo (`nicolas@correo.com` / `12345678`, rol estudiante) y un admin demo (`admin@correo.com` / `admin12345`, rol admin). Es idempotente: se puede correr varias veces sin duplicar datos. Las tablas se crean solas porque TypeORM usa `synchronize: true`; todavia no hay migraciones.

## Ejecutar la API

### En local (desarrollo)

```bash
npm run start:dev
```

Queda en http://localhost:3000 (o el valor de `PORT`) con recarga automatica. Requiere PostgreSQL arriba.

### Todo en Docker

```bash
docker compose up -d --build
```

Levanta todos los servicios: PostgreSQL, la API (http://localhost:3000, o `PORT`), el frontend (http://localhost:5173, o `FRONTEND_PORT`) y pgAdmin. El contenedor de la API no ejecuta el seed: si la base esta vacia, correr `npm run seed` desde el host (con `POSTGRES_HOST=localhost` en `.env`).

Para detener todo: `docker compose down`. Agregar `-v` solo si se quiere borrar el volumen `postgres_data` (se pierden los datos).

### Prueba rapida

```bash
curl http://localhost:3000/carreras
```

Documentacion interactiva (Swagger UI): http://localhost:3000/docs. El esquema en JSON esta en http://localhost:3000/docs-json.

## Probar con Postman

La coleccion esta en [docs/postman/api-san.postman_collection.json](docs/postman/api-san.postman_collection.json) (Postman Collection v2.1). Cubre todos los endpoints de [docs/api.md](docs/api.md), con carpetas Auth, Catalogo, Busquedas, Comparaciones, Usuarios y Errores.

1. Levantar la API y cargar el seed (`npm run seed`).
2. En Postman, usar **Import** y elegir `docs/postman/api-san.postman_collection.json`.
3. Ejecutar primero **Auth / Login admin**. Guarda `accessToken`, `refreshToken` y `adminUsuarioId` en las variables de la coleccion. Las escrituras del catalogo (POST, PUT, PATCH y DELETE) necesitan ese token de admin; con un estudiante responden 403.
4. Ejecutar el resto de carpetas. Ojo: **Auth / Login estudiante** tambien guarda `accessToken`. Si se ejecuta despues del login admin, las escrituras del catalogo vuelven a responder 403.

Variables de la coleccion:

| Variable | Uso |
|---|---|
| `baseUrl` | URL de la API (`http://localhost:3000`). Cambiarla si `PORT` es otro valor |
| `accessToken`, `refreshToken` | Los llenan los requests de login y refresh. No hace falta editarlas |
| `usuarioId`, `adminUsuarioId` | IDs del estudiante y del admin del seed |
| `carreraId`, `universidadId`, `ofertaId` | IDs del seed. Los GET de listado vuelven a leerlos del primer resultado que encuentran |
| `ofertaSecundariaId` | Oferta del seed (EAFIT) usada en comparaciones y favoritos |
| `busquedaId`, `comparacionId` | Se llenan al crear la busqueda y la comparacion |
| `carreraNuevaId`, `universidadNuevaId`, `ofertaNuevaId` | Registros creados por los POST del catalogo. Los PUT, PATCH y DELETE actuan sobre ellos, asi el seed no se modifica |

Los nombres de prueba llevan `{{$timestamp}}`, asi que la coleccion se puede repetir sin errores 409.

Para correrla completa desde la consola (con la API arriba):

```bash
npx newman run docs/postman/api-san.postman_collection.json
```

Newman ejecuta las carpetas en el mismo orden, asi que el login admin queda antes de las escrituras.

## pgAdmin

```bash
docker compose up -d pgadmin
```

Abrir http://localhost:5050 e ingresar con `PGADMIN_EMAIL` y `PGADMIN_PASSWORD` del `.env` (por defecto `admin@apisan.com` / `admin`). El servidor "API SAN" (host `postgres`, puerto 5432, base `api_san`) se precarga desde `docker/pgadmin/servers.json` la primera vez que se crea el volumen `pgadmin_data`. La contrasena de la base se pide al conectar (`POSTGRES_PASSWORD`, por defecto `postgres`).

## Frontend

SPA en React que consume esta API para buscar ofertas, consultar carreras y universidades, comparar ofertas y administrar el catalogo. Vive en `frontend/`.

### Stack

- React 19 con TypeScript.
- Vite como servidor de desarrollo y bundler.
- Tailwind CSS v4.
- React Router para las rutas.
- framer-motion para las animaciones.
- Componentes morphing adaptados de [amicro](https://amicro.dev/morphing) (licencia MIT, ver `frontend/src/morphing/LICENSE-amicro.md`), en `frontend/src/morphing`.

### Ejecutar en local

Requiere la API y PostgreSQL arriba (ver [Base de datos](#base-de-datos) y [Ejecutar la API](#ejecutar-la-api)).

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Queda en http://localhost:5173. En `frontend/.env`, `VITE_API_URL` apunta a la API (por defecto http://localhost:3000). La API solo acepta peticiones del origen indicado en `CORS_ORIGIN` del `.env` de la raiz, que debe ser `http://localhost:5173`. Si se cambia el puerto del frontend, cambiar tambien `CORS_ORIGIN`.

| Comando | Descripcion |
|---|---|
| `npm run dev` | Servidor de desarrollo en http://localhost:5173 |
| `npm run lint` | Chequeo de tipos con `tsc` |
| `npm run build` | Compila la SPA a `dist/` |
| `npm test` | Pruebas unitarias con Vitest y Testing Library |

### Docker

```bash
docker compose up -d --build
```

El servicio `frontend` queda en http://localhost:5173 (o `FRONTEND_PORT`). La imagen compila la SPA con `VITE_API_URL=http://localhost:${PORT:-3000}` y la sirve con nginx, que devuelve `index.html` para las rutas de React Router. `VITE_API_URL` se fija al compilar: si cambia `PORT`, volver a correr `docker compose up -d --build`.

### Rutas

| Ruta | Acceso |
|---|---|
| `/` | Publico |
| `/ingresar` | Publico |
| `/registro` | Publico |
| `/inicio` | Usuario autenticado |
| `/buscar` | Publico |
| `/busquedas/:id` | Publico |
| `/carreras` | Publico |
| `/universidades` | Publico |
| `/universidades/:id` | Publico |
| `/ofertas/:id` | Publico |
| `/comparar` | Publico |
| `/perfil` | Usuario autenticado |
| `/admin` | Solo admin |

Cualquier otra ruta muestra la pagina de no encontrado.

### Credenciales demo

Salen del seed (`npm run seed`, ver [Base de datos](#base-de-datos)):

- Estudiante: `nicolas@correo.com` / `12345678`
- Admin: `admin@correo.com` / `admin12345`

### Documentacion del frontend

- [frontend/ARQUITECTURA.md](frontend/ARQUITECTURA.md): estructura de carpetas, cliente de API, sesion y convenciones de UI.
- [frontend/GUIDANCE.md](frontend/GUIDANCE.md): guia aplicada al catalogo, busqueda, comparacion, perfil y administracion.

## Comandos

| Comando | Descripcion |
|---|---|
| `npm run build` | Compila `src/` a `dist/` con Nest CLI |
| `npm run start` | Arranca la app con `nest start` |
| `npm run start:dev` | Arranca en modo desarrollo con watch |
| `npm run start:debug` | Arranca con debugger y watch |
| `npm run start:prod` | Ejecuta `dist/main` (requiere `npm run build` antes) |
| `npm run seed` | Compila y carga el catalogo inicial (`dist/seed`) |
| `npm run lint` | Lint con oxlint sobre `src/` y `test/` |
| `npm run format` | Formatea `src/` y `test/` con Prettier |
| `npm test` | Pruebas unitarias (`src/**/*.spec.ts`). No necesitan PostgreSQL |
| `npm test -- auth` | Corre solo las pruebas que coinciden con `auth` |
| `npm run test:watch` | Pruebas unitarias en modo watch |
| `npm run test:cov` | Pruebas unitarias con cobertura |
| `npm run test:e2e` | Pruebas e2e (`test/`). Requiere PostgreSQL arriba |

Los scripts de prueba ya incluyen `NODE_OPTIONS=--experimental-vm-modules`, porque `@nestjs/common` es ESM puro. No quitarlo ni la configuracion de `jest.config.ts` y `test/jest-e2e.json`.

## Estructura de carpetas

Una carpeta por recurso dentro de `src/`. Cada recurso tiene su controller (solo HTTP), su service (toda la logica), sus DTOs, su modulo y sus entidades.

```
api-san/
├── src/
│   ├── main.ts                 # arranque y ValidationPipe global
│   ├── app.module.ts           # ConfigModule, TypeORM y modulos de recurso
│   ├── env.model.ts            # interfaz Env con las variables de .env
│   ├── seed.ts                 # entrada de npm run seed
│   ├── common/
│   │   └── semilla.ts          # datos iniciales (idempotentes)
│   ├── auth/                   # registro, login, refresh, guards JWT y roles
│   ├── usuarios/               # preferencias y favoritos
│   ├── busquedas/              # busqueda y scoring.service.ts
│   ├── catalogo/               # carreras, universidades y ofertas
│   └── comparacion/            # comparaciones entre ofertas
├── test/                       # e2e (app.e2e-spec.ts, jest-e2e.json)
├── docker/pgadmin/servers.json # servidor precargado en pgAdmin
├── docs/api.md                 # referencia de endpoints
├── docs/postman/              # coleccion de Postman
├── frontend/                   # SPA en React (Vite), ver seccion Frontend
├── .editorconfig
├── docker-compose.yml
├── Dockerfile
└── AGENTS.md                   # reglas del proyecto (arquitectura, git, convenciones)
```

Dentro de cada carpeta de recurso:

- `<recurso>.controller.ts`, `<recurso>.service.ts`, `<singular>.dto.ts`, `<singular>.module.ts`, `<singular>.entity.ts`.
- Los archivos `*.spec.ts` son las pruebas unitarias del recurso.

## Arquitectura

Un modulo de NestJS por recurso, dentro de `src/`:

- `AuthModule`: registro, login, refresh, guards JWT y roles.
- `UsuarioModule`: usuarios, perfil, preferencias y favoritos.
- `BusquedaModule`: busquedas y calculo de puntajes (`scoring.service.ts`).
- `CatalogoModule`: carreras, universidades y ofertas.
- `ComparacionModule`: comparaciones entre ofertas.

`AppModule` importa los modulos de recurso y registra los providers globales.

Capas dentro de cada recurso:

- **Controller**: solo HTTP (rutas, guards y decoradores de Swagger).
- **Service**: toda la logica y el acceso a datos con repositorios de TypeORM.
- **DTO**: validacion de entrada con class-validator (`*.dto.ts`).
- **Entity**: tablas de TypeORM (`*.entity.ts`).

Los services reciben sus dependencias por inyeccion en el constructor (`@InjectRepository` para los repositorios).

Piezas transversales:

- `ValidationPipe` global en `src/main.ts` con `whitelist`, `forbidNonWhitelisted` y `transform`.
- `QueryFailedFilter` (`src/common/filtros/query-failed.filter.ts`), registrado como `APP_FILTER`: traduce errores de PostgreSQL a respuestas HTTP (violacion de unicidad o de llave foranea a 409, lo demas a 500).
- `LoggingInterceptor` (`src/common/interceptores/logging.interceptor.ts`), registrado como `APP_INTERCEPTOR`: registra metodo, ruta, estado y tiempo de cada request.
- Autenticacion JWT: `JwtAuthGuard` valida el Bearer, `RolesGuard` con `@Roles('admin')` protege el catalogo y `PropietarioGuard` limita `/usuarios/{id}` al propio usuario o a un admin.
- Documentacion Swagger en http://localhost:3000/docs, generada con el plugin CLI de NestJS y los decoradores de `@nestjs/swagger`.

## Flujo de trabajo Git

- Cada cambio va en una rama `feature/<nombre>` creada desde `develop` actualizado. No se commitea directo a `develop`.
- Commits convencionales en espanol: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:` o `test:`, seguidos de una descripcion corta. Ejemplo: `feat: agregar capa auth con registro y login`.
- Los PR van siempre a `develop` y necesitan 2 aprobaciones para mergear (ruleset de GitHub).
- La plantilla del cuerpo del PR y las reglas de aprobacion estan en `.agents/workflow.md`.

## Alcance actual

- Los services usan repositorios de TypeORM.
- Autenticacion con JWT (`@nestjs/jwt`, sin passport) y claves con bcrypt. `accessToken` (15m) y `refreshToken` (7d) se firman con secretos distintos. Roles: `estudiante` y `admin`.
- Protegido: todo `/usuarios/{id}...` (solo el propio usuario o un admin) y `POST`/`PUT`/`PATCH`/`DELETE` del catalogo (solo admin). Publicos: `/auth`, `/busquedas`, `/comparaciones` y las lecturas del catalogo. Detalle en `docs/api.md`.
- `PUT` y `PATCH` aceptan el mismo body en carreras, universidades, ofertas y usuarios, y en los dos casos la actualizacion es parcial. En preferencias (`/usuarios/{id}/preferencias`) los cuatro campos son obligatorios tanto en `PUT` como en `PATCH`.
- No hay Prisma, Redis ni integracion con SNIES. Ver `AGENTS.md`.
