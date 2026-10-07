import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { TieredPricing } from './entities/tiered-pricing.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('CATALOG_DB_NAME'),
        entities: [Product, Category, TieredPricing],
        synchronize: config.get<string>('DB_SYNCHRONIZE') === 'true',
      }),
    }),
    TypeOrmModule.forFeature([Product, Category, TieredPricing]),
  ],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [CatalogService, TypeOrmModule],
})
export class CatalogModule {}