import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CorreoDisponibleDto,
  LoginDto,
  RefreshDto,
  RegistroDto,
} from './auth.dto';
import { AuthService } from './auth.service';

/**
 * Rutas publicas de autenticacion (`/auth/*`). Solo recibe y responde HTTP; la logica esta en AuthService.
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Registra un usuario nuevo con rol `estudiante` y devuelve tokens (201). */
  @Post('registro')
  registrar(@Body() datos: RegistroDto) {
    return this.authService.registrar(datos);
  }

  /** Indica si un correo esta libre para registrarse. Responde 200 aunque el correo ya exista. */
  @Post('correo-disponible')
  @HttpCode(HttpStatus.OK)
  correoDisponible(@Body() datos: CorreoDisponibleDto) {
    return this.authService.correoDisponible(datos.correo);
  }

  /** Inicia sesion con correo y clave y devuelve tokens (201). */
  @Post('login')
  login(@Body() datos: LoginDto) {
    return this.authService.login(datos);
  }

  /** Renueva accessToken y refreshToken a partir de un refresh token vigente (201). */
  @Post('refresh')
  refresh(@Body() datos: RefreshDto) {
    return this.authService.refresh(datos.refreshToken);
  }
}
