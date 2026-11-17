import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { limpiarPruebas } from './common/limpiar-pruebas';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const borrados = await limpiarPruebas(app.get(DataSource));
  console.log('Basura de pruebas eliminada:', borrados);
  await app.close();
}

bootstrap();
