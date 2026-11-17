import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  ActualizarCarreraDto,
  ActualizarOfertaDto,
  ActualizarUniversidadDto,
  CrearCarreraDto,
  CrearOfertaDto,
  CrearUniversidadDto,
  FiltroCarreraDto,
  FiltroOfertaDto,
  FiltroUniversidadDto,
} from './catalogo.dto';
import { CatalogoService } from './catalogo.service';

@ApiTags('catalogo')
@Controller()
export class CatalogoController {
  constructor(private readonly catalogoService: CatalogoService) {}

  @Get('carreras')
  listarCarreras(@Query() filtros: FiltroCarreraDto) {
    return this.catalogoService.listarCarreras(filtros.nombre, filtros.area);
  }

  @Get('carreras/:id')
  obtenerCarrera(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalogoService.obtenerCarrera(id);
  }

  @Post('carreras')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  crearCarrera(@Body() datos: CrearCarreraDto) {
    return this.catalogoService.crearCarrera(datos);
  }

  @Put('carreras/:id')
  @ApiOperation({ summary: 'Actualizar la carrera (PUT, por compatibilidad)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  actualizarCarrera(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() cambios: ActualizarCarreraDto,
  ) {
    return this.catalogoService.actualizarCarrera(id, cambios);
  }

  @Patch('carreras/:id')
  @ApiOperation({ summary: 'Actualizar parcialmente la carrera (PATCH)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  actualizarCarreraParcial(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() cambios: ActualizarCarreraDto,
  ) {
    return this.catalogoService.actualizarCarrera(id, cambios);
  }

  @Delete('carreras/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  eliminarCarrera(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalogoService.eliminarCarrera(id);
  }

  @Get('universidades')
  listarUniversidades(@Query() filtros: FiltroUniversidadDto) {
    return this.catalogoService.listarUniversidades(filtros.ciudad);
  }

  @Get('universidades/:id')
  obtenerUniversidad(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalogoService.obtenerUniversidad(id);
  }

  @Post('universidades')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  crearUniversidad(@Body() datos: CrearUniversidadDto) {
    return this.catalogoService.crearUniversidad(datos);
  }

  @Put('universidades/:id')
  @ApiOperation({
    summary: 'Actualizar la universidad (PUT, por compatibilidad)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  actualizarUniversidad(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() cambios: ActualizarUniversidadDto,
  ) {
    return this.catalogoService.actualizarUniversidad(id, cambios);
  }

  @Patch('universidades/:id')
  @ApiOperation({ summary: 'Actualizar parcialmente la universidad (PATCH)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  actualizarUniversidadParcial(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() cambios: ActualizarUniversidadDto,
  ) {
    return this.catalogoService.actualizarUniversidad(id, cambios);
  }

  @Delete('universidades/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  eliminarUniversidad(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalogoService.eliminarUniversidad(id);
  }

  @Get('ofertas')
  listarOfertas(@Query() filtros: FiltroOfertaDto) {
    return this.catalogoService.listarOfertas(filtros);
  }

  @Get('ofertas/:id')
  obtenerOferta(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalogoService.obtenerOferta(id);
  }

  @Post('ofertas')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  crearOferta(@Body() datos: CrearOfertaDto) {
    return this.catalogoService.crearOferta(datos);
  }

  @Put('ofertas/:id')
  @ApiOperation({ summary: 'Actualizar la oferta (PUT, por compatibilidad)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  actualizarOferta(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() cambios: ActualizarOfertaDto,
  ) {
    return this.catalogoService.actualizarOferta(id, cambios);
  }

  @Patch('ofertas/:id')
  @ApiOperation({ summary: 'Actualizar parcialmente la oferta (PATCH)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  actualizarOfertaParcial(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() cambios: ActualizarOfertaDto,
  ) {
    return this.catalogoService.actualizarOferta(id, cambios);
  }

  @Delete('ofertas/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  eliminarOferta(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalogoService.eliminarOferta(id);
  }
}
