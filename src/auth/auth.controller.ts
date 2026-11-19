import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CorreoDisponibleDto,
  LoginDto,
  RefreshDto,
  RegistroDto,
} from './auth.dto';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  registrar(@Body() datos: RegistroDto) {
    return this.authService.registrar(datos);
  }

  @Post('correo-disponible')
  @HttpCode(HttpStatus.OK)
  correoDisponible(@Body() datos: CorreoDisponibleDto) {
    return this.authService.correoDisponible(datos.correo);
  }

  @Post('login')
  login(@Body() datos: LoginDto) {
    return this.authService.login(datos);
  }

  @Post('refresh')
  refresh(@Body() datos: RefreshDto) {
    return this.authService.refresh(datos.refreshToken);
  }
}
