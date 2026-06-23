import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@letterboxd-et/server/src/app.module';

let cachedServer: any = null;

async function createServer() {
  if (cachedServer) return cachedServer;

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const config = app.get(ConfigService);

  app.enableCors({
    origin: config.get<string>('CLIENT_URL') ?? process.env.CLIENT_URL ?? true,
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.init();
  cachedServer = app.getHttpAdapter().getInstance();
  return cachedServer;
}

export default async function handler(request: any, response: any) {
  const server = await createServer();
  return server(request, response);
}
