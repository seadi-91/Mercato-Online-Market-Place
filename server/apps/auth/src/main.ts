import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthModule } from './auth.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.AUTH_TCP_HOST || '127.0.0.1',
        port: Number(process.env.AUTH_TCP_PORT) || 4001,
      },
    },
  );
  await app.listen();
}
bootstrap();
