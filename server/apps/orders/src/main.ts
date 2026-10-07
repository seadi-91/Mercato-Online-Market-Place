import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { OrdersModule } from './orders.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    OrdersModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.ORDERS_TCP_HOST || '127.0.0.1',
        port: Number(process.env.ORDERS_TCP_PORT) || 4004,
      },
    },
  );
  await app.listen();
}
bootstrap();
