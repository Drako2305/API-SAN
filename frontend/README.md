# Frontend API SAN

SPA en React (Vite, TypeScript) que consume la API de la raíz del repositorio.

La guía de ejecución, comandos, rutas y Docker está en la [sección Frontend del README principal](../README.md#frontend).

- [ARQUITECTURA.md](ARQUITECTURA.md): estructura de carpetas, cliente de API, sesión y convenciones de UI.
- [GUIDANCE.md](GUIDANCE.md): guía aplicada a catálogo, búsqueda, comparación, perfil y administración.

## Cómo ejecutar, probar y compilar

Los comandos salen de `package.json`. Ejecútalos dentro de `frontend/`.

```bash
cp .env.example .env   # define VITE_API_URL (por defecto http://localhost:3000)
npm install
npm run dev            # servidor de desarrollo en http://localhost:5173
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo de Vite. |
| `npm run build` | Revisa tipos con `tsc -b` y compila la SPA a `dist/` con `vite build`. |
| `npm run preview` | Sirve localmente lo que dejó `npm run build` en `dist/`. |
| `npm test` | Ejecuta una vez las pruebas con Vitest (`vitest run`) en el entorno jsdom. |
| `npm run lint` | Revisa tipos con `tsc --noEmit -p tsconfig.app.json`. |

`VITE_API_URL` se lee al arrancar el servidor o al compilar: si cambia, reinicia `npm run dev` o vuelve a ejecutar `npm run build`.

Las pruebas usan Vitest con Testing Library. Están junto al código (`*.test.ts` y `*.test.tsx` en `src/`) y la configuración global está en `src/test/setup.ts`.
