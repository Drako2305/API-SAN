import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PayloadAccesoJwt } from './auth.dto';
import { SolicitudAutenticada } from './jwt-auth.guard';

/**
 * Parametro de handler que entrega el payload del access token (`{ sub, correo, rol }`).
 * Requiere que `JwtAuthGuard` ya haya validado el token; sin el, el valor es `undefined`.
 */
export const UsuarioActual = createParamDecorator(
  (_dato: unknown, context: ExecutionContext): PayloadAccesoJwt =>
    context.switchToHttp().getRequest<SolicitudAutenticada>().usuario,
);
