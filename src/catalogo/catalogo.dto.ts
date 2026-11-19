import { PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Matches,
  Min,
} from 'class-validator';
import { JORNADAS, MODALIDADES } from '../common/constantes';

export class CrearCarreraDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre: string;

  @IsOptional()
  @IsString()
  @Matches(/^(\/|https:\/\/)\S+$/, {
    message: 'imagenUrl debe ser una ruta relativa (/...) o una URL https',
  })
  @MaxLength(255)
  imagenUrl?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  area?: string;
}

export class ActualizarCarreraDto extends PartialType(CrearCarreraDto) {}

export class CrearUniversidadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  ciudad: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  imagenUrl?: string;
}

export class ActualizarUniversidadDto extends PartialType(
  CrearUniversidadDto,
) {}

export class CrearOfertaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  snies: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  ciudad: string;

  @IsInt()
  @Min(0)
  costo: number;

  @IsIn(MODALIDADES)
  modalidad: string;

  @IsIn(JORNADAS)
  jornada: string;

  @IsInt()
  @Min(1)
  duracion: number;

  @IsBoolean()
  acreditacion: boolean;

  @IsUUID()
  universidadId: string;

  @IsUUID()
  carreraId: string;
}

export class ActualizarOfertaDto extends PartialType(CrearOfertaDto) {}

export class FiltroOfertaDto {
  @IsOptional()
  @IsUUID()
  carreraId?: string;

  @IsOptional()
  @IsUUID()
  universidadId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  ciudad?: string;

  @IsOptional()
  @IsIn(MODALIDADES)
  modalidad?: string;
}

export class FiltroCarreraDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  area?: string;
}

export class FiltroUniversidadDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  ciudad?: string;
}

export class CarreraDto {
  id: string;
  nombre: string;
  imagenUrl: string | null;
  area: string | null;
}

export class UniversidadDto {
  id: string;
  nombre: string;
  ciudad: string;
  imagenUrl: string | null;
}

export class OfertaAcademicaDto {
  id: string;
  universidadId: string;
  carreraId: string;
  universidad: string;
  carrera: string;
  imagenUrl: string | null;
  carreraImagenUrl: string | null;
  ciudad: string;
  costo: number;
  modalidad: string;
  jornada: string;
  duracion: number;
  acreditacion: boolean;
  snies: string;
}

export class UniversidadDetalleDto extends UniversidadDto {
  ofertas: OfertaAcademicaDto[];
}
