import { DataSource, EntityManager } from 'typeorm';

// Correos que generan las pruebas e2e (test/*.e2e-spec.ts).
const PREFIJOS_CORREO = [
  'ana-',
  'preferencias-',
  'favoritos-',
  'perfil-',
  'registro-',
  'crud-',
];
const CORREOS_DEMO = ['nicolas@correo.com', 'admin@correo.com'];

// En DELETE ... RETURNING, `query` de TypeORM/pg puede devolver [filas, cantidad].
async function borrar<T extends object>(
  manager: EntityManager,
  sql: string,
  parametros: unknown[] = [],
): Promise<T[]> {
  const resultado = await manager.query(sql, parametros);
  return Array.isArray(resultado[0]) ? resultado[0] : resultado;
}

/**
 * Borra registros sobrantes de pruebas e2e antiguas que corrieron contra la
 * base de desarrollo: carreras `Carrera <8 hex>`, universidades
 * `Universidad <8 hex>` (con sus ofertas) y usuarios con correos de prueba.
 * Nunca toca a los usuarios demo de la semilla.
 */
export async function limpiarPruebas(dataSource: DataSource) {
  return dataSource.transaction(async (manager) => {
    const ofertas = await borrar(
      manager,
      `DELETE FROM ofertas_academicas
       WHERE "carreraId" IN (SELECT id FROM carreras WHERE nombre ~ '^Carrera [0-9a-f]{8}$')
          OR "universidadId" IN (SELECT id FROM universidades WHERE nombre ~ '^Universidad [0-9a-f]{8}$')
          OR snies ~ '^T-[0-9a-f]{8}$'
       RETURNING id`,
    );
    const carreras = await borrar(
      manager,
      `DELETE FROM carreras WHERE nombre ~ '^Carrera [0-9a-f]{8}$' RETURNING id`,
    );
    const universidades = await borrar(
      manager,
      `DELETE FROM universidades WHERE nombre ~ '^Universidad [0-9a-f]{8}$' RETURNING id`,
    );
    const usuarios = await borrar<{ perfil_id: string | null }>(
      manager,
      `DELETE FROM usuarios WHERE correo LIKE ANY($1) AND correo <> ALL($2) RETURNING perfil_id`,
      [
        PREFIJOS_CORREO.map((prefijo) => `${prefijo}%@correo.com`),
        CORREOS_DEMO,
      ],
    );
    const perfilIds = usuarios
      .map((fila) => fila.perfil_id)
      .filter((id) => id !== null);
    if (perfilIds.length > 0) {
      await manager.query(`DELETE FROM perfiles WHERE id = ANY($1)`, [
        perfilIds,
      ]);
    }

    return {
      ofertas: ofertas.length,
      carreras: carreras.length,
      universidades: universidades.length,
      usuarios: usuarios.length,
    };
  });
}
