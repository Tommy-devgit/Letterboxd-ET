import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@letterboxd-et/server/src/app.module';

let cachedServer: any = null;

const allowedOrigins = new Set(
  [
    process.env.CLIENT_URL,
    'https://letterboxd-et-client.vercel.app',
    'http://localhost:3000',
  ].filter(Boolean),
);

function applyCors(request: any, response: any) {
  const origin = request.headers?.origin;
  if (origin && allowedOrigins.has(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
  }
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.setHeader('Access-Control-Max-Age', '86400');
}

async function createServer() {
  if (cachedServer) return cachedServer;

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const config = app.get(ConfigService);

  app.enableCors({
    origin: Array.from(allowedOrigins),
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
  applyCors(request, response);

  if (request.method === 'OPTIONS') {
    response.statusCode = 204;
    response.end();
    return;
  }

  try {
    const server = await createServer();
    return server(request, response);
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.end(JSON.stringify({ message: 'Internal server error' }));
  }
}
