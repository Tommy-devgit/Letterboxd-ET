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
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  response.setHeader('Access-Control-Max-Age', '86400');
}

function normalizeRequestUrlForNest(request: any) {
  const host = request.headers?.host ?? 'localhost';
  const current = new URL(request.url, `https://${host}`);
  const catchAllPath = getCatchAllPath(request);
  const pathname = catchAllPath
    ? `/api/${catchAllPath}`
    : current.pathname;
  const normalizedPath = pathname.startsWith('/api')
    ? pathname
    : `/api${pathname.startsWith('/') ? pathname : `/${pathname}`}`;

  if (catchAllPath) {
    current.searchParams.delete('path');
    current.searchParams.delete('path[]');
    if (request.query) {
      delete request.query.path;
      delete request.query['path[]'];
    }
  }

  request.url = `${normalizedPath}${current.search}`;
  request.originalUrl = request.url;
  request._parsedUrl = undefined;
}

function getCatchAllPath(request: any) {
  const rawPath = request.query?.path ?? request.query?.['path[]'];
  if (!rawPath) return null;

  const parts = Array.isArray(rawPath) ? rawPath : [rawPath];
  const cleanParts = parts
    .flatMap((part) => String(part).split('/'))
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => part !== '[...path]');

  return cleanParts.length ? cleanParts.map(encodeURIComponent).join('/') : null;
}

async function createServer() {
  if (cachedServer) return cachedServer;

  await import('reflect-metadata');
  const [{ ValidationPipe }, { ConfigService }, { NestFactory }] = await Promise.all([
    import('@nestjs/common'),
    import('@nestjs/config'),
    import('@nestjs/core'),
  ]);
  const { AppModule } = require('../../server/src/app.module');
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
      forbidNonWhitelisted: false,
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

  normalizeRequestUrlForNest(request);

  const pathname = new URL(request.url, `https://${request.headers.host ?? 'localhost'}`).pathname;
  if (pathname === '/api/_debug/cors' || pathname === '/_debug/cors') {
    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json');
    const databaseUrl = process.env.DATABASE_URL ?? '';
    response.end(
      JSON.stringify({
        ok: true,
        path: pathname,
        url: request.url,
        origin: request.headers?.origin ?? null,
        clientUrl: process.env.CLIENT_URL ?? null,
        hasDatabaseUrl: Boolean(databaseUrl),
        databaseUrlLooksLocal: /localhost|127\.0\.0\.1/i.test(databaseUrl),
      }),
    );
    return;
  }

  try {
    const server = await createServer();
    return server(request, response);
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.setHeader('Content-Type', 'application/json');
    response.end(
      JSON.stringify({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
}
