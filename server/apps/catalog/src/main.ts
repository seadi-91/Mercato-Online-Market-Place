import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { CatalogModule } from './catalog.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CatalogModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.CATALOG_TCP_HOST || '127.0.0.1',
        port: Number(process.env.CATALOG_TCP_PORT) || 4003,
      },
    },
  );
  await app.listen();
}
bootstrap();
