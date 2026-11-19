import { SetMetadata } from '@nestjs/common';
import { Rol } from '../common/constantes';

/** Clave de metadata donde `@Roles` guarda los roles permitidos. La lee `RolesGuard`. */
export const ROLES_KEY = 'roles';

/**
 * Decorador que limita el acceso a los roles indicados, por ejemplo `@Roles('admin')`.
 * Solo tiene efecto junto con `RolesGuard`.
 */
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);
