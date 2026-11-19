import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { PayloadAccesoJwt } from './auth.dto';

/** Solicitud de Express con el payload del access token ya verificado en `usuario`. */
export type SolicitudAutenticada = Request & { usuario: PayloadAccesoJwt };

/**
 * Valida el header `Authorization: Bearer <accessToken>` y deja el payload en `request.usuario`.
 * Responde 401 si falta el header, el esquema no es Bearer o el token es invalido o esta expirado.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const solicitud = context.switchToHttp().getRequest<SolicitudAutenticada>();
    const [tipo, token] = (solicitud.headers.authorization ?? '').split(' ');
    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token de acceso requerido');
    }

    try {
      solicitud.usuario =
        await this.jwtService.verifyAsync<PayloadAccesoJwt>(token);
    } catch {
      throw new UnauthorizedException('Token de acceso invalido o expirado');
    }
    return true;
  }
}
