import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth/auth.controller';
import { UsersController } from './users/users.controller';
import { CatalogController } from './catalog/catalog.controller';
import { OrdersController } from './orders/orders.controller';
import { PaymentsController } from './payments/payments.controller';
import { UploadController } from './upload/upload.controller';
import { AdminController } from './admin/admin.controller';
import { PlatformSettingsController } from './admin/platform-settings.controller';
import { SellerController } from './seller/seller.controller';
import { CustomerController } from './customer/customer.controller';
import { DeliveryController } from './delivery/delivery.controller';
import {
  AuthGuard,
  CloudinaryModule,
  RateLimitGuard,
  RolesGuard,
  SecurityHeadersMiddleware,
} from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    CloudinaryModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET must be defined in environment configuration');
        }
        return {
          secret,
          signOptions: {
            expiresIn: config.get<string>('JWT_EXPIRATION') || '15m',
          },
        };
      },
    }),
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get<string>('AUTH_TCP_HOST') || '127.0.0.1',
            port: config.get<number>('AUTH_TCP_PORT') || 4001,
          },
        }),
      },
      {
        name: 'USERS_SERVICE',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get<string>('USERS_TCP_HOST') || '127.0.0.1',
            port: config.get<number>('USERS_TCP_PORT') || 4002,
          },
        }),
      },
      {
        name: 'CATALOG_SERVICE',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get<string>('CATALOG_TCP_HOST') || '127.0.0.1',
            port: config.get<number>('CATALOG_TCP_PORT') || 4003,
          },
        }),
      },
      {
        name: 'ORDERS_SERVICE',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get<string>('ORDERS_TCP_HOST') || '127.0.0.1',
            port: config.get<number>('ORDERS_TCP_PORT') || 4004,
          },
        }),
      },
      {
        name: 'PAYMENTS_SERVICE',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get<string>('PAYMENTS_TCP_HOST') || '127.0.0.1',
            port: config.get<number>('PAYMENTS_TCP_PORT') || 4005,
          },
        }),
      },
    ]),
  ],
  controllers: [
    AuthController,
    UsersController,
    CatalogController,
    OrdersController,
    PaymentsController,
    UploadController,
    AdminController,
    PlatformSettingsController,
    SellerController,
    CustomerController,
    DeliveryController,
  ],
  providers: [
    AuthGuard,
    RolesGuard,
    RateLimitGuard,
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
})
export class ApiGatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityHeadersMiddleware).forRoutes('*');
  }
}
