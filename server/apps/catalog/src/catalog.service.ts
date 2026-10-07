import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { TieredPricing } from './entities/tiered-pricing.entity';
import {
  CreateCategoryDto,
  CreateProductDto,
  FilterProductsDto,
  FilterSellerProductsDto,
  ProductUnit,
  StockAction,
  UpdateCategoryDto,
  UpdateProductDto,
} from '@app/common';

@Injectable()
export class CatalogService implements OnModuleInit {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(TieredPricing)
    private readonly tieredPricingRepository: Repository<TieredPricing>,
  ) {}

  async onModuleInit() {
    await this.seedInitialCategories();
    await this.seedInitialProducts();
  }

  private async seedInitialCategories() {
    try {
      const count = await this.categoryRepository.count();
      if (count === 0) {
        const defaultCats = [
          { name: 'Computers & Electronics', slug: 'computers-electronics', nameAmharic: 'ኮምፒውተር እና ኤሌክትሮኒክስ' },
          { name: 'Smartphones & Mobile', slug: 'smartphones-mobile', nameAmharic: 'ስልኮች እና ሞባይል' },
          { name: 'Fashion, Apparel & Shoes', slug: 'fashion-apparel-shoes', nameAmharic: 'ፋሽን እና ልብሶች' },
          { name: 'Cosmetics & Skincare', slug: 'cosmetics-skincare', nameAmharic: 'ኮስሞቲክስ' },
          { name: 'Grains, Cereals & Groceries', slug: 'grains-cereals-groceries', nameAmharic: 'እህል እና ግሮሰሪ' },
          { name: 'Home, Kitchen & Appliances', slug: 'home-kitchen-appliances', nameAmharic: 'የቤት እና የወጥ ቤት እቃዎች' },
        ];
        for (const cat of defaultCats) {
          const created = this.categoryRepository.create({
            name: cat.name,
            slug: cat.slug,
            nameAmharic: cat.nameAmharic,
            isActive: true,
          });
          await this.categoryRepository.save(created);
        }
        console.log('[CatalogService] Default commercial categories seeded in database');
      }
    } catch (err) {
      console.error('[CatalogService] Seed categories error:', err);
    }
  }

  private async seedInitialProducts() {
    try {
      const count = await this.productRepository.count();
      if (count < 10) {
        const categories = await this.categoryRepository.find();
        const catMap = new Map(categories.map((c) => [c.slug, c.id]));
        const defaultSellerId = '59972f9f-49ec-4592-9113-ba70a0aa3a52';

        const catalogItems = [
          {
            title: 'Samsung Galaxy S24 Ultra (512GB Titanium Black)',
            categorySlug: 'smartphones-mobile',
            sku: 'ETH-SAM-S24U-BLK',
            retailPrice: 165000,
            wholesalePrice: 152000,
            stockQuantity: 45,
            unit: ProductUnit.PIECE,
            description: 'Samsung Galaxy S24 Ultra with Snapdragon 8 Gen 3, 200MP Quad Tele System, 120Hz Dynamic AMOLED 2X, S-Pen included. 100% Escrow protected with 1-year brand warranty.',
            images: [
              'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
            ],
          },
          {
            title: 'Apple iPhone 15 Pro Max (256GB Natural Titanium)',
            categorySlug: 'smartphones-mobile',
            sku: 'ETH-APL-15PM-NAT',
            retailPrice: 185000,
            wholesalePrice: 172000,
            stockQuantity: 30,
            unit: ProductUnit.PIECE,
            description: 'Apple iPhone 15 Pro Max forged in aerospace-grade titanium with A17 Pro chip, 48MP Main camera, 5x optical zoom, and USB-C. Bole Medhanialem verified stock.',
            images: [
              'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
            ],
          },
          {
            title: 'Xiaomi Redmi Note 13 Pro+ 5G (512GB / 12GB RAM)',
            categorySlug: 'smartphones-mobile',
            sku: 'ETH-XIA-RN13P-5G',
            retailPrice: 48500,
            wholesalePrice: 43000,
            stockQuantity: 80,
            unit: ProductUnit.PIECE,
            description: 'Curved 1.5K 120Hz AMOLED display, 200MP OIS camera, 120W HyperCharge fast charging. Excellent performance for everyday commercial use.',
            images: [
              'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
            ],
          },
          {
            title: 'Apple MacBook Pro 16" (M3 Pro 36GB RAM / 512GB SSD)',
            categorySlug: 'computers-electronics',
            sku: 'ETH-MBP-16-M3P',
            retailPrice: 320000,
            wholesalePrice: 298000,
            stockQuantity: 18,
            unit: ProductUnit.PIECE,
            description: 'Liquid Retina XDR display, M3 Pro chip with 12-core CPU and 18-core GPU, up to 22 hours of battery life. Perfect for creative professionals and software engineers.',
            images: [
              'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
            ],
          },
          {
            title: 'Dell XPS 15 9530 Core i9 13th Gen (32GB RAM / 1TB SSD)',
            categorySlug: 'computers-electronics',
            sku: 'ETH-DEL-XPS15-I9',
            retailPrice: 225000,
            wholesalePrice: 205000,
            stockQuantity: 22,
            unit: ProductUnit.PIECE,
            description: 'Intel Core i9-13900H, NVIDIA GeForce RTX 4070, 3.5K OLED InfinityEdge touch display. Verified Bole hardware hub import.',
            images: [
              'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
            ],
          },
          {
            title: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
            categorySlug: 'computers-electronics',
            sku: 'ETH-SNY-WH1000XM5',
            retailPrice: 38500,
            wholesalePrice: 34000,
            stockQuantity: 65,
            unit: ProductUnit.PIECE,
            description: 'Industry-leading noise cancelation with two processors and 8 microphones, 30-hour battery life with quick charging, hands-free Speak-to-Chat.',
            images: [
              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
            ],
          },
          {
            title: 'Traditional Handwoven Habesha Kemis (Gold Tilf Embroidery)',
            categorySlug: 'fashion-apparel-shoes',
            sku: 'ETH-FSH-KEMIS-TLF',
            retailPrice: 18500,
            wholesalePrice: 14500,
            stockQuantity: 35,
            unit: ProductUnit.PIECE,
            description: 'Handwoven pure Ethiopian cotton (Shemma) adorned with exquisite gold-threaded Tilf embroidery. Tailored in Shiro Meda artisan district.',
            images: [
              '/images/hero-cultural-fashion.jpg',
              'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
            ],
          },
          {
            title: 'Genuine Ethiopian Leather Executive Briefcase (Piazza Craft)',
            categorySlug: 'fashion-apparel-shoes',
            sku: 'ETH-FSH-LTR-BAG01',
            retailPrice: 6800,
            wholesalePrice: 5200,
            stockQuantity: 90,
            unit: ProductUnit.PIECE,
            description: '100% full-grain Ethiopian Highland sheep leather, brass hardware, padded laptop compartment. Handcrafted in Piazza artisan workshops.',
            images: [
              'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
            ],
          },
          {
            title: 'Addis Chelsea Leather Boots (Water-Resistant Sole)',
            categorySlug: 'fashion-apparel-shoes',
            sku: 'ETH-FSH-BOOTS-02',
            retailPrice: 7400,
            wholesalePrice: 5800,
            stockQuantity: 50,
            unit: ProductUnit.PIECE,
            description: 'Premium cowhide leather Chelsea boot with elastic side panels and durable rubber lug sole. Made in Addis Ababa.',
            images: [
              'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
            ],
          },
          {
            title: 'Yirgacheffe Grade 1 Specialty Roasted Coffee Beans (1kg Bag)',
            categorySlug: 'grains-cereals-groceries',
            sku: 'ETH-GRC-YIRGA-1KG',
            retailPrice: 1850,
            wholesalePrice: 1400,
            stockQuantity: 240,
            unit: ProductUnit.PIECE,
            description: 'Washed single-origin Arabica from Yirgacheffe highlands with delicate floral aroma, citrus notes, and silky body. Freshly roasted in Addis Ababa.',
            images: [
              'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
              'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80',
            ],
          },
          {
            title: 'Organic Ethiopian Magna Teff Flour (25kg Wholesale Sack)',
            categorySlug: 'grains-cereals-groceries',
            sku: 'ETH-GRC-TEFF-25KG',
            retailPrice: 5600,
            wholesalePrice: 4900,
            stockQuantity: 120,
            unit: ProductUnit.KUNTAL,
            description: 'Export-grade pure white Magna Teff, naturally gluten-free and mineral rich, milled to silky perfection for authentic Injera preparation.',
            images: [
              'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
            ],
          },
          {
            title: 'Mercato Signature Spice Blend - Traditional Berbere (5kg Pack)',
            categorySlug: 'grains-cereals-groceries',
            sku: 'ETH-GRC-BERB-5KG',
            retailPrice: 2400,
            wholesalePrice: 1950,
            stockQuantity: 150,
            unit: ProductUnit.PIECE,
            description: 'Sun-dried red peppers expertly stone-ground with korarima, ginger, rue, garlic, and wild herbs from the Mercato spice market.',
            images: [
              'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80',
            ],
          },
          {
            title: 'Traditional Clay Jebena Coffee Ceremony Set with Sini Cups',
            categorySlug: 'home-kitchen-appliances',
            sku: 'ETH-HM-JEBENA-SET',
            retailPrice: 4500,
            wholesalePrice: 3400,
            stockQuantity: 70,
            unit: ProductUnit.PIECE,
            description: 'Authentic hand-fired clay Jebena kettle accompanied by 6 matching ceramic Sini cups, wooden Rekebot stand, and charcoal incense burner.',
            images: [
              'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
            ],
          },
          {
            title: 'Philips Digital Airfryer XXL (7.2L Rapid Air Technology)',
            categorySlug: 'home-kitchen-appliances',
            sku: 'ETH-HM-PHL-AFXXL',
            retailPrice: 28500,
            wholesalePrice: 25000,
            stockQuantity: 40,
            unit: ProductUnit.PIECE,
            description: 'Fat Removal technology extracts excess fat while cooking, smart chef programs for one-touch meals, 7.2L capacity for family gatherings.',
            images: [
              'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
            ],
          },
          {
            title: 'Pure Ethiopian Black Cumin (Tikur Azmud) Cold-Pressed Oil (250ml)',
            categorySlug: 'cosmetics-skincare',
            sku: 'ETH-CSM-AZMUD-250',
            retailPrice: 950,
            wholesalePrice: 750,
            stockQuantity: 180,
            unit: ProductUnit.PIECE,
            description: '100% virgin cold-pressed Nigella Sativa oil renowned for skin rejuvenation, scalp nourishment, and natural therapeutic hydration.',
            images: [
              'https://images.unsplash.com/photo-1608248597359-bb5941604a37?w=800&auto=format&fit=crop&q=80',
            ],
          },
          {
            title: 'Organic Shea & Acacia Honey Hydrating Facial Serum (50ml)',
            categorySlug: 'cosmetics-skincare',
            sku: 'ETH-CSM-HONEY-50ML',
            retailPrice: 1450,
            wholesalePrice: 1100,
            stockQuantity: 110,
            unit: ProductUnit.PIECE,
            description: 'Infused with raw Ethiopian acacia honey and unrefined shea butter, formulated to restore skin barrier and natural dewy glow.',
            images: [
              'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
            ],
          },
        ];

        for (const item of catalogItems) {
          const categoryId = catMap.get(item.categorySlug);
          if (!categoryId) continue;

          const exists = await this.productRepository.findOne({
            where: { sku: item.sku },
          });
          if (!exists) {
            const product = this.productRepository.create({
              sellerId: defaultSellerId,
              title: item.title,
              description: item.description,
              sku: item.sku,
              categoryId,
              retailPrice: item.retailPrice,
              wholesalePrice: item.wholesalePrice,
              minOrderQuantity: 1,
              unit: item.unit,
              stockQuantity: item.stockQuantity,
              lowStockThreshold: 10,
              images: item.images,
              isAvailable: true,
              isActive: true,
            });
            await this.productRepository.save(product);
          }
        }
        console.log('[CatalogService] Default authentic marketplace products seeded successfully');
      }
    } catch (err) {
      console.error('[CatalogService] Seed products error:', err);
    }
  }

  async createProduct(sellerId: string, dto: CreateProductDto): Promise<Product> {
    const existingSku = await this.productRepository.findOne({
      where: { sku: dto.sku },
    });
    if (existingSku) {
      throw new RpcException(
        new ConflictException('Product with this SKU already exists'),
      );
    }

    const category = await this.categoryRepository.findOne({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new RpcException(
        new NotFoundException('Category not found'),
      );
    }

    const product = this.productRepository.create({
      sellerId,
      title: dto.title,
      description: dto.description,
      sku: dto.sku,
      categoryId: dto.categoryId,
      retailPrice: dto.retailPrice,
      wholesalePrice: dto.wholesalePrice,
      minOrderQuantity: dto.minOrderQuantity,
      unit: dto.unit,
      stockQuantity: dto.stockQuantity,
      lowStockThreshold: dto.lowStockThreshold ?? 10,
      images: dto.images ?? [],
      isAvailable: dto.stockQuantity > 0,
      isActive: true,
    });

    if (dto.tieredPricing && dto.tieredPricing.length > 0) {
      product.tieredPricing = dto.tieredPricing.map((item) =>
        this.tieredPricingRepository.create({
          minQuantity: item.minQuantity,
          maxQuantity: item.maxQuantity,
          discountedPricePerUnit: item.discountedPricePerUnit,
        }),
      );
    }

    return this.productRepository.save(product);
  }

  async updateProduct(
    id: string,
    sellerId: string,
    dto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['tieredPricing'],
    });

    if (!product) {
      throw new RpcException(new NotFoundException('Product not found'));
    }

    if (product.sellerId !== sellerId) {
      throw new RpcException(
        new ForbiddenException('You are not authorized to update this product'),
      );
    }

    if (dto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new RpcException(
          new NotFoundException('Category not found'),
        );
      }
      product.categoryId = dto.categoryId;
    }

    if (dto.title !== undefined) product.title = dto.title;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.retailPrice !== undefined) product.retailPrice = dto.retailPrice;
    if (dto.wholesalePrice !== undefined) product.wholesalePrice = dto.wholesalePrice;
    if (dto.minOrderQuantity !== undefined) product.minOrderQuantity = dto.minOrderQuantity;
    if (dto.unit !== undefined) product.unit = dto.unit;
    if (dto.lowStockThreshold !== undefined) product.lowStockThreshold = dto.lowStockThreshold;
    if (dto.images !== undefined) product.images = dto.images;
    if (dto.isActive !== undefined) product.isActive = dto.isActive;

    if (dto.stockQuantity !== undefined) {
      product.stockQuantity = dto.stockQuantity;
      product.isAvailable = dto.stockQuantity > 0;
    }

    if (dto.isAvailable !== undefined) {
      product.isAvailable = dto.isAvailable;
    }

    if (dto.tieredPricing !== undefined) {
      await this.tieredPricingRepository.delete({ productId: id });
      if (dto.tieredPricing.length > 0) {
        product.tieredPricing = dto.tieredPricing.map((item) =>
          this.tieredPricingRepository.create({
            productId: id,
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
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new RpcException(new NotFoundException('Product not found'));
    }

    if (product.sellerId !== sellerId) {
      throw new RpcException(
        new ForbiddenException('You are not authorized to delete this product'),
      );
    }

    await this.productRepository.softDelete(id);
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

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, isActive: true },
      relations: ['category', 'tieredPricing'],
    });

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
}