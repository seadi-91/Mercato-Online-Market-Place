import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { UsersModule } from './users.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UsersModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.USERS_TCP_HOST || '127.0.0.1',
        port: Number(process.env.USERS_TCP_PORT) || 4002,
      },
    },
  );
  await app.listen();
  console.log('[UsersMicroservice] TCP service started on port 4002 with compliance doc support');
}
bootstrap();
