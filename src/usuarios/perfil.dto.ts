import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { EsAvatar } from './avatar.validator';

export class CrearPerfilDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellido: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  ciudad: string;

  @IsOptional()
  @EsAvatar()
  avatar?: string | null;
}

export class ActualizarPerfilDto extends PartialType(CrearPerfilDto) {}
