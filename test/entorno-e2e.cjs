// Resuelve la base de datos de las pruebas e2e: nunca la de desarrollo.
// Usa POSTGRES_DB_E2E si existe; si no, `<POSTGRES_DB>_e2e`.
const { existsSync } = require('node:fs');

function resolverEntornoE2e() {
  if (existsSync('.env')) {
    // No pisa las variables que ya estan definidas en el entorno.
    process.loadEnvFile('.env');
  }
  const base = process.env.POSTGRES_DB ?? 'api_san';
  const nombre = process.env.POSTGRES_DB_E2E ?? `${base}_e2e`;
  if (!/^[A-Za-z0-9_]+$/.test(nombre)) {
    throw new Error(`Nombre de base e2e invalido: ${nombre}`);
  }
  // Idempotente: el globalSetup y cada suite lo llaman en el mismo entorno.
  process.env.POSTGRES_DB_E2E = nombre;
  process.env.POSTGRES_DB = nombre;
  return nombre;
}

module.exports = { resolverEntornoE2e };
