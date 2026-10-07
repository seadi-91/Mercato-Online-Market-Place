import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { PaymentsModule } from './payments.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PaymentsModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.PAYMENTS_TCP_HOST || '127.0.0.1',
        port: Number(process.env.PAYMENTS_TCP_PORT) || 4005,
      },
    },
  );
  await app.listen();
}
bootstrap();
