import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded, static as expressStatic } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { ApiGatewayModule } from './api-gateway.module';
import { GlobalExceptionFilter } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', expressStatic(uploadsDir));

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
      ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
        return;
      }
      try {
        const url = new URL(origin);
        const host = url.hostname;
        if (
          host === 'localhost' ||
          host === '127.0.0.1' ||
          host.startsWith('192.168.') ||
          host.startsWith('10.') ||
          host.startsWith('172.') ||
          host.endsWith('.local')
        ) {
          callback(null, true);
          return;
        }
      } catch {
        // invalid URL
      }
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'x-chapa-signature',
      'x-telebirr-token',
    ],
  });

  const port = process.env.API_GATEWAY_PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`[ApiGateway] Listening on 0.0.0.0:${port}`);

  // Support legacy GITHUB_CALLBACK_URL on port 8000 by forwarding to frontend /github-callback
  try {
    const http = await import('http');
    const proxyServer = http.createServer((req: any, res: any) => {
      if (
        req.url?.startsWith('/api/auth/github/callback') ||
        req.url?.startsWith('/auth/github/callback')
      ) {
        const parsed = new URL(req.url, 'http://localhost:8000');
        const code = parsed.searchParams.get('code') || '';
        const state = parsed.searchParams.get('state') || '';
        res.writeHead(302, {
          Location: `http://localhost:3000/github-callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
        });
        res.end();
        return;
      }
      res.writeHead(404);
      res.end('Not found');
    });
    proxyServer.listen(8000, '0.0.0.0', () => {
      console.log('[ApiGateway] OAuth callback helper listening on 0.0.0.0:8000');
    });
    proxyServer.on('error', (err: any) => {
      console.log(
        '[ApiGateway] Port 8000 helper not started (port likely in use or restricted):',
        err.message,
      );
    });
  } catch (err: any) {
    // harmless if port 8000 cannot be bound
  }
}
bootstrap();

