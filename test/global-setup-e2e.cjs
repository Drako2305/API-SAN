// globalSetup: crea la base de datos e2e si no existe.
// Corre en un proceso hijo: cargar `pg` en el proceso de jest rompe el
// `require('pg')` de TypeORM dentro de las suites (modo ESM de jest).
const { spawnSync } = require('node:child_process');
const { resolverEntornoE2e } = require('./entorno-e2e.cjs');

const SCRIPT = `
const { Client } = require('pg');
(async () => {
  const nombre = process.env.POSTGRES_DB;
  const cliente = new Client({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: 'postgres',
  });
  await cliente.connect();
  try {
    const { rowCount } = await cliente.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [nombre],
    );
    if (rowCount === 0) {
      await cliente.query('CREATE DATABASE "' + nombre + '"');
    }
  } finally {
    await cliente.end();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
`;

module.exports = async function globalSetup() {
  resolverEntornoE2e();
  const resultado = spawnSync(process.execPath, ['-e', SCRIPT], {
    env: process.env,
    stdio: 'inherit',
  });
  if (resultado.status !== 0) {
    throw new Error('No se pudo crear la base de datos e2e');
  }
};
