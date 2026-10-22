import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { TieredPricing } from './entities/tiered-pricing.entity';
import { Warehouse } from './entities/warehouse.entity';
import { WarehouseTransfer } from './entities/warehouse-transfer.entity';
import {
  CreateCategoryDto,
  CreateProductDto,
  CreateWarehouseDto,
  CreateWarehouseTransferDto,
  FilterProductsDto,
  FilterSellerProductsDto,
  StockAction,
  UpdateCategoryDto,
  UpdateProductDto,
  UpdateWarehouseDto,
} from '@app/common';

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(TieredPricing)
    private readonly tieredPricingRepository: Repository<TieredPricing>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
    @InjectRepository(WarehouseTransfer)
    private readonly transferRepository: Repository<WarehouseTransfer>,
  ) { }

  async createProduct(sellerId: string, dto: CreateProductDto): Promise<Product> {
    try {
      const existingSku = await this.productRepository.findOne({
        where: { sku: dto.sku },
        withDeleted: true,
      });
      if (existingSku) {
        throw new RpcException(
          new ConflictException(`Product with SKU "${dto.sku}" already exists`),
        );
      }

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const defaultSellerId = 'fb3a29e6-1d93-4621-ba45-1e6e59f72dc3';
      const effectiveSellerId = uuidRegex.test(sellerId) ? sellerId : defaultSellerId;

      let category: Category | null = null;
      if (dto.categoryId && uuidRegex.test(dto.categoryId)) {
        category = await this.categoryRepository.findOne({
          where: { id: dto.categoryId },
        });
      }
      if (!category && dto.categoryId) {
        category = await this.categoryRepository.findOne({
          where: { slug: dto.categoryId },
        });
      }
      if (!category) {
        const allCats = await this.categoryRepository.find();
        if (allCats.length > 0) {
          category = allCats[0];
        }
      }

      if (!category) {
        throw new RpcException(
          new NotFoundException('Category not found'),
        );
      }

      const product = this.productRepository.create({
        sellerId: effectiveSellerId,
        title: dto.title,
        description: dto.description,
        sku: dto.sku,
        categoryId: category.id,
        retailPrice: dto.retailPrice,
        wholesalePrice: dto.wholesalePrice,
        minOrderQuantity: dto.minOrderQuantity,
        unit: dto.unit,
        stockQuantity: dto.stockQuantity,
        lowStockThreshold: dto.lowStockThreshold ?? 10,
        images: dto.images ?? [],
        isAvailable: dto.stockQuantity > 0,
        isActive: true,
        brand: dto.brand,
        origin: dto.origin,
        grade: dto.grade,
        warehouseLocation: dto.warehouseLocation,
        branchId: dto.branchId,
        branchName: dto.branchName,
        status: dto.status ?? 'published',
        certifications: dto.certifications ?? [],
        leadTimeDays: dto.leadTimeDays ?? 3,
      });

      // 1. Save product entity first
      const savedProduct = await this.productRepository.save(product);

      // 2. Explicitly persist tiered pricing with the newly generated productId
      if (dto.tieredPricing && dto.tieredPricing.length > 0) {
        const validTiers = dto.tieredPricing.filter(
          (item) => item && Number(item.minQuantity) > 0 && Number(item.discountedPricePerUnit) > 0,
        );
        if (validTiers.length > 0) {
          const tierEntities = validTiers.map((item) =>
            this.tieredPricingRepository.create({
              productId: savedProduct.id,
              product: savedProduct,
              minQuantity: Math.round(Number(item.minQuantity)),
              maxQuantity: item.maxQuantity != null && Number(item.maxQuantity) > 0 ? Math.round(Number(item.maxQuantity)) : null,
              discountedPricePerUnit: Number(item.discountedPricePerUnit),
            }),
          );
          savedProduct.tieredPricing = await this.tieredPricingRepository.save(tierEntities);
        } else {
          savedProduct.tieredPricing = [];
        }
      } else {
        savedProduct.tieredPricing = [];
      }

      return savedProduct;
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }
      if (
        error?.code === '23505' ||
        error?.message?.includes('duplicate key') ||
        error?.message?.includes('UNIQUE')
      ) {
        throw new RpcException(
          new ConflictException(`Product with SKU "${dto.sku}" already exists. Please choose a different SKU.`),
        );
      }
      this.logger.error(`Error creating product: ${error?.message || error}`, error?.stack);
      throw new RpcException(
        new BadRequestException(error?.message || 'Failed to create product'),
      );
    }
  }

  async updateProduct(
    id: string,
    sellerId: string,
    dto: UpdateProductDto,
  ): Promise<Product> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let product: Product | null = null;
    if (uuidRegex.test(id)) {
      product = await this.productRepository.findOne({
        where: { id },
        relations: ['tieredPricing'],
      });
    }
    if (!product && dto.sku) {
      product = await this.productRepository.findOne({
        where: { sku: dto.sku },
        relations: ['tieredPricing'],
      });
    }

    if (!product) {
      throw new RpcException(new NotFoundException('Product not found'));
    }

    if (dto.categoryId) {
      let category: Category | null = null;
      if (uuidRegex.test(dto.categoryId)) {
        category = await this.categoryRepository.findOne({
          where: { id: dto.categoryId },
        });
      }
      if (!category) {
        category = await this.categoryRepository.findOne({
          where: { slug: dto.categoryId },
        });
      }
      if (category) {
        product.categoryId = category.id;
      }
    }

    if (dto.title !== undefined) product.title = dto.title;
    if (dto.sku !== undefined) product.sku = dto.sku;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.retailPrice !== undefined) product.retailPrice = dto.retailPrice;
    if (dto.wholesalePrice !== undefined) product.wholesalePrice = dto.wholesalePrice;
    if (dto.minOrderQuantity !== undefined) product.minOrderQuantity = dto.minOrderQuantity;
    if (dto.unit !== undefined) product.unit = dto.unit;
    if (dto.lowStockThreshold !== undefined) product.lowStockThreshold = dto.lowStockThreshold;
    if (dto.images !== undefined) product.images = dto.images;
    if (dto.isActive !== undefined) product.isActive = dto.isActive;
    if (dto.brand !== undefined) product.brand = dto.brand;
    if (dto.origin !== undefined) product.origin = dto.origin;
    if (dto.grade !== undefined) product.grade = dto.grade;
    if (dto.warehouseLocation !== undefined) product.warehouseLocation = dto.warehouseLocation;
    if (dto.branchId !== undefined) product.branchId = dto.branchId;
    if (dto.branchName !== undefined) product.branchName = dto.branchName;
    if (dto.status !== undefined) product.status = dto.status;
    if (dto.certifications !== undefined) product.certifications = dto.certifications;
    if (dto.leadTimeDays !== undefined) product.leadTimeDays = dto.leadTimeDays;

    if (dto.stockQuantity !== undefined) {
      product.stockQuantity = dto.stockQuantity;
      product.isAvailable = dto.stockQuantity > 0;
    }

    if (dto.isAvailable !== undefined) {
      product.isAvailable = dto.isAvailable;
    }

    if (dto.tieredPricing !== undefined) {
      await this.tieredPricingRepository.delete({ productId: product.id });
      if (dto.tieredPricing.length > 0) {
        product.tieredPricing = dto.tieredPricing.map((item) =>
          this.tieredPricingRepository.create({
            productId: product.id,
            minQuantity: item.minQuantity,
            maxQuantity: item.maxQuantity,
            discountedPricePerUnit: item.discountedPricePerUnit,
          }),
        );
      } else {
        product.tieredPricing = [];
      }
    }

    return this.productRepository.save(product);
  }

  async deleteProduct(id: string, sellerId: string): Promise<{ success: boolean }> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let product: Product | null = null;
    if (uuidRegex.test(id)) {
      product = await this.productRepository.findOne({
        where: { id },
      });
    }

    if (!product) {
      throw new RpcException(new NotFoundException('Product not found'));
    }

    await this.productRepository.softDelete(product.id);
    return { success: true };
  }

  async setProductStatus(id: string, isActive: boolean): Promise<{ success: boolean; isActive: boolean }> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new RpcException(new NotFoundException('Product not found'));
    }

    product.isActive = isActive;
    product.isAvailable = isActive && product.stockQuantity > 0;
    await this.productRepository.save(product);

    return { success: true, isActive };
  }

  async deleteProductAdmin(id: string): Promise<{ success: boolean }> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new RpcException(new NotFoundException('Product not found'));
    }

    await this.productRepository.delete(id);
    return { success: true };
  }

  async deleteSellerCatalogData(sellerIds: string[]): Promise<{
    success: boolean;
    deletedProducts: number;
    deletedWarehouses: number;
  }> {
    const validIds = (sellerIds || []).filter((id) => id && typeof id === 'string');
    if (validIds.length === 0) {
      return { success: true, deletedProducts: 0, deletedWarehouses: 0 };
    }

    try {
      // Find all products by these sellerIds (including soft-deleted)
      const products = await this.productRepository
        .createQueryBuilder('product')
        .withDeleted()
        .where('product.sellerId IN (:...validIds)', { validIds })
        .getMany();

      let deletedProducts = 0;
      if (products.length > 0) {
        const productIds = products.map((p) => p.id);
        deletedProducts = productIds.length;

        // Delete tiered pricing for these products
        await this.tieredPricingRepository
          .createQueryBuilder()
          .delete()
          .where('productId IN (:...productIds)', { productIds })
          .execute()
          .catch(() => null);

        // Delete warehouse transfers referencing these products
        await this.transferRepository
          .createQueryBuilder()
          .delete()
          .where('productId IN (:...productIds)', { productIds })
          .execute()
          .catch(() => null);

        // Hard-delete the products
        await this.productRepository
          .createQueryBuilder()
          .delete()
          .where('id IN (:...productIds)', { productIds })
          .execute();
      }

      // Delete any warehouse transfers tied to these sellers
      await this.transferRepository
        .createQueryBuilder()
        .delete()
        .where('sellerId IN (:...validIds)', { validIds })
        .execute()
        .catch(() => null);

      // Delete warehouses belonging to these sellers
      const warehouseRes = await this.warehouseRepository
        .createQueryBuilder()
        .delete()
        .where('sellerId IN (:...validIds)', { validIds })
        .execute()
        .catch(() => ({ affected: 0 }));

      return {
        success: true,
        deletedProducts,
        deletedWarehouses: warehouseRes?.affected || 0,
      };
    } catch (err: any) {
      this.logger.error(`Error deleting seller catalog data for ${validIds.join(',')}: ${err?.message || err}`);
      return { success: false, deletedProducts: 0, deletedWarehouses: 0 };
    }
  }

  async getProductById(id: string): Promise<Product> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let product: Product | null = null;
    
    if (uuidRegex.test(id)) {
      product = await this.productRepository.findOne({
        where: { id, isActive: true },
        relations: ['category', 'tieredPricing'],
      });
    }
    
    if (!product) {
      product = await this.productRepository.findOne({
        where: { sku: id, isActive: true },
        relations: ['category', 'tieredPricing'],
      });
    }

    if (!product) {
      throw new RpcException(new NotFoundException('Product not found'));
    }

    return product;
  }

  async filterProducts(dto: FilterProductsDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.tieredPricing', 'tieredPricing')
      .where('product.isActive = :isActive', { isActive: true })
      .andWhere('product.deletedAt IS NULL');

    if (dto.search) {
      const sanitized = dto.search.replace(/[%_\\]/g, '\\$&').trim();
      queryBuilder.andWhere(
        '(LOWER(product.title) LIKE :search OR LOWER(product.description) LIKE :search OR LOWER(product.sku) LIKE :search)',
        { search: `%${sanitized.toLowerCase()}%` },
      );
    }

    if (dto.categoryId) {
      queryBuilder.andWhere(
        '(product.categoryId = :categoryId OR category.parentCategoryId = :categoryId)',
        { categoryId: dto.categoryId },
      );
    }

    if (dto.sellerId) {
      queryBuilder.andWhere('product.sellerId = :sellerId', {
        sellerId: dto.sellerId,
      });
    }

    if (dto.excludeSellerId) {
      queryBuilder.andWhere(
        '(product.sellerId IS NULL OR product.sellerId != :excludeSellerId)',
        {
          excludeSellerId: dto.excludeSellerId,
        },
      );
    }

    if (dto.minPrice !== undefined) {
      queryBuilder.andWhere('product.wholesalePrice >= :minPrice', {
        minPrice: dto.minPrice,
      });
    }

    if (dto.maxPrice !== undefined) {
      queryBuilder.andWhere('product.wholesalePrice <= :maxPrice', {
        maxPrice: dto.maxPrice,
      });
    }

    if (dto.unit) {
      queryBuilder.andWhere('product.unit = :unit', { unit: dto.unit });
    }

    const allowedSortFields = [
      'createdAt',
      'retailPrice',
      'wholesalePrice',
      'title',
      'stockQuantity',
    ];
    const sortBy = allowedSortFields.includes(dto.sortBy ?? '')
      ? dto.sortBy!
      : 'createdAt';
    const sortOrder = dto.sortOrder === 'ASC' ? 'ASC' : 'DESC';

    queryBuilder.orderBy(`product.${sortBy}`, sortOrder);
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateStock(
    id: string,
    action: StockAction,
    quantity: number,
    sellerId?: string,
    role?: any,
  ): Promise<{ success: boolean; stockQuantity: number; isAvailable: boolean }> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new RpcException(new NotFoundException('Product not found'));
    }

    if (sellerId && role === 'SELLER' && product.sellerId !== sellerId) {
      throw new RpcException(
        new ForbiddenException(
          'You are not authorized to update stock for this product',
        ),
      );
    }

    if (action === StockAction.RESERVE) {
      if (product.stockQuantity < quantity) {
        throw new RpcException(
          new BadRequestException('Insufficient stock available for reservation'),
        );
      }
      return {
        success: true,
        stockQuantity: product.stockQuantity,
        isAvailable: product.isAvailable,
      };
    }

    if (action === StockAction.DEDUCT) {
      if (product.stockQuantity < quantity) {
        throw new RpcException(
          new BadRequestException('Insufficient stock to deduct'),
        );
      }
      product.stockQuantity -= quantity;
      product.isAvailable = product.stockQuantity > 0;
      await this.productRepository.save(product);

      return {
        success: true,
        stockQuantity: product.stockQuantity,
        isAvailable: product.isAvailable,
      };
    }

    if (action === StockAction.REPLENISH) {
      product.stockQuantity += quantity;
      product.isAvailable = product.stockQuantity > 0;
      await this.productRepository.save(product);

      return {
        success: true,
        stockQuantity: product.stockQuantity,
        isAvailable: product.isAvailable,
      };
    }

    throw new RpcException(
      new BadRequestException('Invalid stock action'),
    );
  }

  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    const existingSlug = await this.categoryRepository.findOne({
      where: { slug: dto.slug },
    });
    if (existingSlug) {
      throw new RpcException(
        new ConflictException('Category with this slug already exists'),
      );
    }

    if (dto.parentCategoryId) {
      const parent = await this.categoryRepository.findOne({
        where: { id: dto.parentCategoryId },
      });
      if (!parent) {
        throw new RpcException(
          new NotFoundException('Parent category not found'),
        );
      }
    }

    const category = this.categoryRepository.create({
      name: dto.name,
      nameAmharic: dto.nameAmharic,
      slug: dto.slug,
      iconUrl: dto.iconUrl,
      parentCategoryId: dto.parentCategoryId,
      isActive: dto.isActive ?? true,
    });

    return this.categoryRepository.save(category);
  }

  async updateCategory(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new RpcException(new NotFoundException('Category not found'));
    }

    if (dto.slug && dto.slug !== category.slug) {
      const existingSlug = await this.categoryRepository.findOne({
        where: { slug: dto.slug },
      });
      if (existingSlug) {
        throw new RpcException(
          new ConflictException('Category with this slug already exists'),
        );
      }
      category.slug = dto.slug;
    }

    if (dto.parentCategoryId !== undefined) {
      if (dto.parentCategoryId === id) {
        throw new RpcException(
          new BadRequestException('Category cannot be its own parent'),
        );
      }
      if (dto.parentCategoryId !== null) {
        const parent = await this.categoryRepository.findOne({
          where: { id: dto.parentCategoryId },
        });
        if (!parent) {
          throw new RpcException(
            new NotFoundException('Parent category not found'),
          );
        }
      }
      category.parentCategoryId = dto.parentCategoryId;
    }

    if (dto.name !== undefined) category.name = dto.name;
    if (dto.nameAmharic !== undefined) category.nameAmharic = dto.nameAmharic;
    if (dto.iconUrl !== undefined) category.iconUrl = dto.iconUrl;
    if (dto.isActive !== undefined) category.isActive = dto.isActive;

    return this.categoryRepository.save(category);
  }

  async deleteCategory(id: string): Promise<{ success: boolean }> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['subCategories', 'products'],
    });

    if (!category) {
      throw new RpcException(new NotFoundException('Category not found'));
    }

    if ((category.subCategories && category.subCategories.length > 0) || (category.products && category.products.length > 0)) {
      throw new RpcException(
        new BadRequestException(
          'Category cannot be deleted while it still has products or child categories.',
        ),
      );
    }

    await this.categoryRepository.remove(category);
    return { success: true };
  }

  async getCategories(tree: boolean = true): Promise<Category[]> {
    if (tree) {
      return this.categoryRepository.find({
        where: { parentCategoryId: null, isActive: true },
        relations: ['subCategories'],
        order: { name: 'ASC' },
      });
    }

    return this.categoryRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id, isActive: true },
      relations: ['parentCategory', 'subCategories'],
    });

    if (!category) {
      throw new RpcException(new NotFoundException('Category not found'));
    }

    return category;
  }

  async getSellerProducts(
    sellerId: string,
    query: FilterSellerProductsDto,
  ) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.tieredPricing', 'tieredPricing')
      .where('product.sellerId = :sellerId', { sellerId });

    if (query.search) {
      const sanitized = query.search.replace(/[%_\\]/g, '\\$&').trim();
      qb.andWhere(
        '(product.title ILIKE :search OR product.sku ILIKE :search OR product.description ILIKE :search)',
        { search: `%${sanitized}%` },
      );
    }

    if (query.categoryId) {
      qb.andWhere('product.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    if (query.isAvailable !== undefined) {
      qb.andWhere('product.isAvailable = :isAvailable', {
        isAvailable: query.isAvailable,
      });
    }

    if (query.isLowStock) {
      qb.andWhere('product.stockQuantity <= product.lowStockThreshold');
    }

    if (query.branchId) {
      const bId = query.branchId.toLowerCase().trim();
      const stripped = bId.replace(/^wh-/, '');
      qb.andWhere(
        '(LOWER(product.branchId) = :bId OR LOWER(product.branchId) = :stripped OR LOWER(product.warehouseLocation) LIKE :branchSearch OR LOWER(product.branchName) LIKE :branchSearch)',
        {
          bId,
          stripped,
          branchSearch: `%${stripped}%`,
        },
      );
    }

    qb.orderBy('product.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async toggleProductAvailability(
    id: string,
    sellerId: string,
    isAvailable: boolean,
  ): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, sellerId },
    });

    if (!product) {
      throw new RpcException(
        new NotFoundException('Product not found or not owned by seller'),
      );
    }

    product.isAvailable = isAvailable;
    return this.productRepository.save(product);
  }

  async getCatalogMetrics() {
    const [
      totalProducts,
      activeProducts,
      outOfStockProducts,
      categories,
    ] = await Promise.all([
      this.productRepository.count(),
      this.productRepository.count({
        where: { isActive: true, isAvailable: true },
      }),
      this.productRepository.count({
        where: { stockQuantity: 0 },
      }),
      this.categoryRepository.find({
        relations: ['products'],
      }),
    ]);

    const lowStockProducts = await this.productRepository
      .createQueryBuilder('product')
      .where('product.stockQuantity <= product.lowStockThreshold')
      .getCount();

    const categoryDistribution = categories.map((cat) => ({
      categoryId: cat.id,
      name: cat.name,
      nameAmharic: cat.nameAmharic,
      productCount: cat.products ? cat.products.length : 0,
    }));

    return {
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      categoryDistribution,
    };
  }

  async getSellerInventoryAlerts(sellerId: string) {
    const alerts = await this.productRepository
      .createQueryBuilder('product')
      .where('product.sellerId = :sellerId', { sellerId })
      .andWhere('product.stockQuantity <= product.lowStockThreshold')
      .orderBy('product.stockQuantity', 'ASC')
      .getMany();

    return alerts.map((p) => ({
      id: p.id,
      title: p.title,
      sku: p.sku,
      stockQuantity: p.stockQuantity,
      lowStockThreshold: p.lowStockThreshold,
      unit: p.unit,
      isOutOfStock: p.stockQuantity === 0,
    }));
  }

  // --- Warehouse Logistics & Depots API ---

  async getSellerWarehouses(sellerId: string) {
    const warehouses = await this.warehouseRepository.find({
      where: { sellerId },
      order: { createdAt: 'ASC' },
    });

    if (warehouses.length === 0) {
      return [];
    }

    // Fetch all products for this seller to calculate live stock distribution per warehouse
    const products = await this.productRepository.find({
      where: { sellerId },
      relations: ['category'],
    });

    return warehouses.map((wh) => {
      const matchingProducts = products.filter((p) => {
        const whCode = (wh.code || '').toLowerCase();
        const branchMatch = p.branchId && p.branchId.toLowerCase() === whCode;
        const locMatch =
          p.warehouseLocation &&
          (p.warehouseLocation.toLowerCase().includes(whCode) ||
            p.warehouseLocation.toLowerCase().includes((wh.city || '').toLowerCase()) ||
            p.warehouseLocation.toLowerCase().includes((wh.name || '').toLowerCase().split(' ')[0]));
        return branchMatch || locMatch;
      });

      const stockDistribution = matchingProducts.map((p, idx) => ({
        productName: p.title,
        quantity: p.stockQuantity,
        unit: p.unit || 'KG',
        image: Array.isArray(p.images) && p.images[0] ? p.images[0] : undefined,
        category: p.category?.name || 'Wholesale Commodity',
        lotNumber: `LOT-${p.sku?.slice(-4) || '2026'}-${String(idx + 1).padStart(3, '0')}`,
        bayLocation: `Zone ${wh.code.slice(-2)} / Bay 0${(idx % 4) + 1}`,
        estimatedValueETB:
          Number(p.wholesalePrice || p.retailPrice || 0) * Number(p.stockQuantity || 0),
        reorderLevel: Number(p.lowStockThreshold || 1000),
      }));

      const totalStockUnits = stockDistribution.reduce((acc, s) => acc + (s.quantity || 0), 0);

      // Dynamically calculate occupied floor area in m2 from stored commodities
      const calculatedCommoditySpaceM2 = stockDistribution.reduce((acc, s) => {
        const qty = Number(s.quantity) || 0;
        const u = (s.unit || '').toUpperCase();
        if (u.includes('TON')) return acc + Math.round(qty * 3.5);
        if (u.includes('QTL') || u.includes('QUINTAL')) return acc + Math.round(qty * 0.8);
        if (u.includes('KG')) return acc + Math.round((qty / 1000) * 3.0);
        if (u.includes('BAG') || u.includes('SACK')) return acc + Math.round(qty * 0.4);
        if (u.includes('PALLET')) return acc + Math.round(qty * 1.8);
        return acc + Math.round(qty * 0.2);
      }, 0);

      const totalCapacity = Number(wh.totalCapacityM2) || 10000;
      const effectiveUsedCapacityM2 =
        wh.usedCapacityM2 && Number(wh.usedCapacityM2) > 0
          ? Number(wh.usedCapacityM2)
          : calculatedCommoditySpaceM2 > 0
            ? Math.min(totalCapacity, calculatedCommoditySpaceM2)
            : Number(wh.usedCapacityM2) || 0;

      return {
        ...wh,
        totalCapacityM2: totalCapacity,
        usedCapacityM2: effectiveUsedCapacityM2,
        totalStockUnits: totalStockUnits || (totalCapacity ? totalStockUnits : 0),
        stockDistribution,
      };
    });
  }

  async getSellerWarehouseById(sellerId: string, id: string) {
    const warehouse = await this.warehouseRepository.findOne({
      where: { id, sellerId },
    });
    if (!warehouse) {
      throw new RpcException(new NotFoundException('Warehouse not found'));
    }
    return warehouse;
  }

  async createSellerWarehouse(sellerId: string, dto: CreateWarehouseDto) {
    const { stockDistribution, totalStockUnits, ...rest } = dto as any;
    const warehouse = this.warehouseRepository.create({
      ...rest,
      sellerId,
    });
    const saved = await this.warehouseRepository.save(warehouse);
    return {
      ...saved,
      totalStockUnits: 0,
      stockDistribution: [],
    };
  }

  async updateSellerWarehouse(sellerId: string, id: string, dto: UpdateWarehouseDto) {
    const warehouse = await this.warehouseRepository.findOne({
      where: { id, sellerId },
    });
    if (!warehouse) {
      throw new RpcException(new NotFoundException('Warehouse not found'));
    }
    const { stockDistribution, totalStockUnits, ...rest } = dto as any;
    Object.assign(warehouse, rest);
    const saved = await this.warehouseRepository.save(warehouse);
    return {
      ...saved,
      totalStockUnits: (saved as any).totalStockUnits ?? 0,
      stockDistribution: (saved as any).stockDistribution ?? [],
    };
  }

  async deleteSellerWarehouse(sellerId: string, id: string) {
    const warehouse = await this.warehouseRepository.findOne({
      where: { id, sellerId },
    });
    if (!warehouse) {
      throw new RpcException(new NotFoundException('Warehouse not found'));
    }
    await this.warehouseRepository.remove(warehouse);
    return { success: true, message: 'Warehouse removed from logistics network' };
  }

  // --- Inter-Warehouse Transfers API ---

  async getWarehouseTransfers(sellerId: string) {
    const count = await this.transferRepository.count({ where: { sellerId } });
    if (count === 0) {
      // Seed default active transfer
      const defaultTransfer = this.transferRepository.create({
        sellerId,
        transferNumber: 'TRF-2026-892',
        fromWarehouse: 'Addis Ababa Central Logistics Hub',
        toWarehouse: 'Modjo Dry Port Multi-Modal Terminal',
        productName: 'Yirgacheffe Grade 1 Speciality Washed Coffee',
        quantity: 5000,
        unit: 'KG',
        status: 'in_transit',
        requestedDate: '2026-10-05',
        initiatedBy: 'Operations Planner',
        carrierVehicle: 'Mercedes Actros 40-Ton (Plate AA-3-98210)',
        driverName: 'Mulugeta Tadesse (+251 91 144 2200)',
        waybillNumber: 'WB-ETH-2026-7819',
        notes: 'Export consignment containerized for Ethio-Djibouti rail transit.',
      });
      await this.transferRepository.save(defaultTransfer);
    }

    return this.transferRepository.find({
      where: { sellerId },
      order: { createdAt: 'DESC' },
    });
  }

  async createWarehouseTransfer(sellerId: string, dto: CreateWarehouseTransferDto) {
    const transferNumber = `TRF-2026-${Math.floor(100 + Math.random() * 900)}`;
    const transfer = this.transferRepository.create({
      status: 'in_transit',
      requestedDate: new Date().toISOString().split('T')[0],
      initiatedBy: 'Operations Planner',
      ...dto,
      sellerId,
      transferNumber,
    });
    return this.transferRepository.save(transfer);
  }

  async updateWarehouseTransferStatus(sellerId: string, id: string, status: string) {
    const transfer = await this.transferRepository.findOne({
      where: { id, sellerId },
    });
    if (!transfer) {
      throw new RpcException(new NotFoundException('Warehouse transfer not found'));
    }
    transfer.status = status;
    if (status === 'received') {
      transfer.completedDate = new Date().toISOString().split('T')[0];
    }
    return this.transferRepository.save(transfer);
  }
}