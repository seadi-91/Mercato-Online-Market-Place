import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductUnit } from '../enums/product-unit.enum';

export enum StockAction {
  RESERVE = 'RESERVE',
  DEDUCT = 'DEDUCT',
  REPLENISH = 'REPLENISH',
}

export class TieredPricingItemDto {
  @IsInt()
  @Min(1)
  minQuantity: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxQuantity?: number;

  @IsNumber()
  @Min(0)
  discountedPricePerUnit: number;
}

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  nameAmharic?: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  iconUrl?: string;

  @IsUUID()
  @IsOptional()
  parentCategoryId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  nameAmharic?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  iconUrl?: string;

  @IsUUID()
  @IsOptional()
  parentCategoryId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsNumber()
  @Min(0)
  retailPrice: number;

  @IsNumber()
  @Min(0)
  wholesalePrice: number;

  @IsInt()
  @Min(1)
  minOrderQuantity: number;

  @IsEnum(ProductUnit)
  unit: ProductUnit;

  @IsInt()
  @Min(0)
  stockQuantity: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  lowStockThreshold?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TieredPricingItemDto)
  @IsOptional()
  tieredPricing?: TieredPricingItemDto[];
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  retailPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  wholesalePrice?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  minOrderQuantity?: number;

  @IsEnum(ProductUnit)
  @IsOptional()
  unit?: ProductUnit;

  @IsInt()
  @Min(0)
  @IsOptional()
  stockQuantity?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  lowStockThreshold?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TieredPricingItemDto)
  @IsOptional()
  tieredPricing?: TieredPricingItemDto[];
}

export class UpdateStockDto {
  @IsInt()
  @Min(1)
  quantity: number;

  @IsEnum(StockAction)
  action: StockAction;
}

export class FilterProductsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  sellerId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsEnum(ProductUnit)
  unit?: ProductUnit;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
