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
import { Warehouse } from './entities/warehouse.entity';
import { WarehouseTransfer } from './entities/warehouse-transfer.entity';
import {
  CreateCategoryDto,
  CreateProductDto,
  CreateWarehouseDto,
  CreateWarehouseTransferDto,
  FilterProductsDto,
  FilterSellerProductsDto,
  ProductUnit,
  StockAction,
  UpdateCategoryDto,
  UpdateProductDto,
  UpdateWarehouseDto,
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
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
    @InjectRepository(WarehouseTransfer)
    private readonly transferRepository: Repository<WarehouseTransfer>,
  ) { }

  async onModuleInit() {
    await this.seedInitialCategories();
    await this.seedInitialProducts();
    await this.seedInitialWarehouses();
  }

  private async seedInitialCategories() {
    try {
      const defaultCats = [
        { name: 'Agricultural Commodities', slug: 'agricultural-commodities', nameAmharic: 'የግብርና ምርቶች' },
        { name: 'Grains, Cereals & Teff', slug: 'grains-cereals-teff', nameAmharic: 'እህል፣ ጥራጥሬ እና ጤፍ' },
        { name: 'Oilseeds & Pulses', slug: 'oilseeds-pulses', nameAmharic: 'የቅባት እህሎች እና ጥራጥሬዎች' },
        { name: 'Construction & Industrial Materials', slug: 'construction-industrial-materials', nameAmharic: 'የግንባታ እና የኢንዱስትሪ እቃዎች' },
        { name: 'Textiles & Apparel', slug: 'textiles-apparel', nameAmharic: 'ጨርቃጨርቅ እና አልባሳት' },
        { name: 'Specialty Coffee & Spices', slug: 'specialty-coffee-spices', nameAmharic: 'ልዩ ቡና እና ቅመማ ቅመም' },
        { name: 'Computers & Electronics', slug: 'computers-electronics', nameAmharic: 'ኮምፒውተር እና ኤሌክትሮኒክስ' },
        { name: 'Smartphones & Mobile', slug: 'smartphones-mobile', nameAmharic: 'ስልኮች እና ሞባይል' },
        { name: 'Fashion, Apparel & Shoes', slug: 'fashion-apparel-shoes', nameAmharic: 'ፋሽን እና ልብሶች' },
        { name: 'Cosmetics & Skincare', slug: 'cosmetics-skincare', nameAmharic: 'ኮስሞቲክስ' },
        { name: 'Grains, Cereals & Groceries', slug: 'grains-cereals-groceries', nameAmharic: 'እህል እና ግሮሰሪ' },
        { name: 'Home, Kitchen & Appliances', slug: 'home-kitchen-appliances', nameAmharic: 'የቤት እና የወጥ ቤት እቃዎች' },
      ];
      for (const cat of defaultCats) {
        const existing = await this.categoryRepository.findOne({
          where: { slug: cat.slug },
        });
        if (!existing) {
          const created = this.categoryRepository.create({
            name: cat.name,
            slug: cat.slug,
            nameAmharic: cat.nameAmharic,
            isActive: true,
          });
          await this.categoryRepository.save(created);
        }
      }
      console.log('[CatalogService] Default commercial & wholesale categories ensured in database');
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

      // Ensure default wholesale supplier account has initial products in database
      const supplierId = 'fb3a29e6-1d93-4621-ba45-1e6e59f72dc3';
      const supplierProductCount = await this.productRepository.count({
        where: { sellerId: supplierId },
      });
      if (supplierProductCount === 0) {
        const categories = await this.categoryRepository.find();
        const catMap = new Map(categories.map((c) => [c.slug, c.id]));
        const agriCatId = catMap.get('agricultural-commodities') || catMap.get('grains-cereals-groceries') || categories[0]?.id;
        const teffCatId = catMap.get('grains-cereals-teff') || catMap.get('grains-cereals-groceries') || categories[0]?.id;
        const sesameCatId = catMap.get('oilseeds-pulses') || catMap.get('grains-cereals-groceries') || categories[0]?.id;

        const wholesaleCommodities = [
          {
            title: 'Yirgacheffe Grade 1 Speciality Washed Arabica Coffee',
            sku: 'ETH-COF-YRG-001',
            categoryId: agriCatId,
            retailPrice: 500,
            wholesalePrice: 480,
            minOrderQuantity: 500,
            unit: ProductUnit.KUNTAL,
            stockQuantity: 42500,
            lowStockThreshold: 5000,
            images: [
              'https://images.unsplash.com/photo-1559525839-8f81ae7d3b5b?auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=600&q=80',
            ],
            description: 'Fully washed high-altitude Arabica coffee with distinct floral bergamot aroma, bright lemon acidity, and sweet nectarine finish. Harvested directly from partner cooperatives in Yirgacheffe highlands.',
            brand: 'Abyssinia Gold Roast',
            origin: 'Gedeo Zone, Yirgacheffe, Ethiopia',
            grade: 'Grade 1 (SCA 88.5)',
            warehouseLocation: 'Addis Ababa Central Logistics Hub (WH-AA)',
            branchId: 'wh-aa',
            branchName: 'Addis Ababa Central Logistics Hub',
            status: 'published',
            certifications: ['ECX Grade 1', 'Fair Trade', 'Organic Certified'],
            leadTimeDays: 3,
            tierPricing: [
              { minQuantity: 500, maxQuantity: 999, discountedPricePerUnit: 480 },
              { minQuantity: 1000, maxQuantity: 4999, discountedPricePerUnit: 450 },
              { minQuantity: 5000, maxQuantity: 999999, discountedPricePerUnit: 420 },
            ],
          },
          {
            title: 'Magna White Teff Super Premium Grain',
            sku: 'ETH-GRN-TEF-102',
            categoryId: teffCatId,
            retailPrice: 120,
            wholesalePrice: 110,
            minOrderQuantity: 1000,
            unit: ProductUnit.KUNTAL,
            stockQuantity: 85000,
            lowStockThreshold: 10000,
            images: [
              'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
            ],
            description: 'Export-grade machine-cleaned Magna white teff grain, 99.8% purity, harvested from fertile Adaa volcanic plains.',
            brand: 'Sheba Harvest',
            origin: "Ada'a Bishoftu, Oromia, Ethiopia",
            grade: 'Magna (First Class White)',
            warehouseLocation: 'Modjo Dry Port Multi-Modal Terminal (WH-MJ)',
            branchId: 'wh-mj',
            branchName: 'Modjo Dry Port Multi-Modal Terminal',
            status: 'published',
            certifications: ['Ethiopian Conformity Assessment', 'ECX Grade A'],
            leadTimeDays: 2,
            tierPricing: [
              { minQuantity: 1000, maxQuantity: 4999, discountedPricePerUnit: 110 },
              { minQuantity: 5000, maxQuantity: 999999, discountedPricePerUnit: 102 },
            ],
          },
          {
            title: 'Humera Grade A Whitish Sesame Seeds',
            sku: 'ETH-OIL-SES-301',
            categoryId: sesameCatId,
            retailPrice: 220,
            wholesalePrice: 210,
            minOrderQuantity: 2000,
            unit: ProductUnit.KUNTAL,
            stockQuantity: 30000,
            lowStockThreshold: 3000,
            images: [
              'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
            ],
            description: 'World-renowned sweet aroma Humera sesame with 52% oil content and 99.5% minimum purity.',
            brand: 'Tigray Agro Alliance',
            origin: 'Humera, Tigray Region, Ethiopia',
            grade: 'Grade A Humera Export Standard',
            warehouseLocation: 'Hawassa Agro-Processing Logistics Depot (WH-HW)',
            branchId: 'wh-hw',
            branchName: 'Hawassa Agro-Processing Logistics Depot',
            status: 'published',
            certifications: ['ECX Certified', 'Phytosanitary Clearance'],
            leadTimeDays: 4,
            tierPricing: [
              { minQuantity: 2000, maxQuantity: 9999, discountedPricePerUnit: 210 },
              { minQuantity: 10000, maxQuantity: 999999, discountedPricePerUnit: 195 },
            ],
          },
        ];

        for (const item of wholesaleCommodities) {
          if (!item.categoryId) continue;
          const exists = await this.productRepository.findOne({ where: { sku: item.sku } });
          if (!exists) {
            const prod = this.productRepository.create({
              sellerId: supplierId,
              title: item.title,
              description: item.description,
              sku: item.sku,
              categoryId: item.categoryId,
              retailPrice: item.retailPrice,
              wholesalePrice: item.wholesalePrice,
              minOrderQuantity: item.minOrderQuantity,
              unit: item.unit,
              stockQuantity: item.stockQuantity,
              lowStockThreshold: item.lowStockThreshold,
              images: item.images,
              isAvailable: true,
              isActive: true,
              brand: item.brand,
              origin: item.origin,
              grade: item.grade,
              warehouseLocation: item.warehouseLocation,
              branchId: item.branchId,
              branchName: item.branchName,
              status: item.status,
              certifications: item.certifications,
              leadTimeDays: item.leadTimeDays,
            });
            const saved = await this.productRepository.save(prod);
            if (item.tierPricing && item.tierPricing.length > 0) {
              const tiers = item.tierPricing.map((t) =>
                this.tieredPricingRepository.create({
                  productId: saved.id,
                  minQuantity: t.minQuantity,
                  maxQuantity: t.maxQuantity,
                  discountedPricePerUnit: t.discountedPricePerUnit,
                }),
              );
              await this.tieredPricingRepository.save(tiers);
            }
          }
        }
        console.log('[CatalogService] Default authentic wholesale products seeded for supplier account');
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

  private async seedInitialWarehouses() {
    try {
      const count = await this.warehouseRepository.count();
      if (count === 0) {
        const defaultSupplierId = 'fb3a29e6-1d93-4621-ba45-1e6e59f72dc3';
        const defaultWarehouses = [
          {
            sellerId: defaultSupplierId,
            name: 'Addis Ababa Central Logistics Hub',
            code: 'WH-AA',
            region: 'Addis Ababa City Administration',
            city: 'Addis Ababa',
            address: 'Kality Industrial Zone, Gate 3, Ring Road Expressway',
            managerName: 'Abebe Worku',
            managerEmail: 'abebe.w@abyssiniasupply.et',
            phone: '+251 11 434 2210',
            facilityType: 'Central Logistics Hub',
            totalCapacityM2: 12500,
            usedCapacityM2: 10250,
            temperatureControlled: true,
            temperatureReading: '21.4°C',
            humidityReading: '48% RH',
            securityLevel: '24/7 Biometric Guarded & CCTV Monitored',
            activeLoadingDocks: 4,
            totalLoadingDocks: 6,
            fleetBaysCount: 16,
            operatingHours: '24/7 Continuous Receiving & Dispatch',
            gpsCoordinates: '8.8833° N, 38.7500° E',
            certificationStatus: 'ECAE & Ethiopian Customs Bonded #CUS-ETH-891',
            fireSafetyRating: 'Civil Defense Grade A Compliant',
            status: 'operational',
          },
          {
            sellerId: defaultSupplierId,
            name: 'Modjo Dry Port Multi-Modal Terminal',
            code: 'WH-MJ',
            region: 'Oromia Regional State',
            city: 'Modjo',
            address: 'Modjo Dry Port Logistics Zone, Ethio-Djibouti Railhead Spur #2',
            managerName: 'Tewodros Lemma',
            managerEmail: 'tewodros.l@abyssiniasupply.et',
            phone: '+251 22 116 8890',
            facilityType: 'Bonded Dry Port Terminal',
            totalCapacityM2: 18000,
            usedCapacityM2: 14600,
            temperatureControlled: false,
            temperatureReading: '24.1°C',
            humidityReading: '42% RH',
            securityLevel: 'Federal Customs Police & Armed Terminal Security',
            activeLoadingDocks: 6,
            totalLoadingDocks: 8,
            fleetBaysCount: 24,
            operatingHours: '06:00 - 22:00 Daily Operations',
            gpsCoordinates: '8.5912° N, 39.1234° E',
            certificationStatus: 'ESLSE Bonded CFS & Customs Clearance Depot',
            fireSafetyRating: 'Civil Defense Grade A Compliant',
            status: 'operational',
          },
          {
            sellerId: defaultSupplierId,
            name: 'Hawassa Agro-Processing Logistics Depot',
            code: 'WH-HW',
            region: 'Sidama Regional State',
            city: 'Hawassa',
            address: 'Hawassa Industrial Park Southern Logistics Zone, Shed B-14',
            managerName: 'Birtukan Dagne',
            managerEmail: 'birtukan.d@abyssiniasupply.et',
            phone: '+251 46 220 8911',
            facilityType: 'Agro-Processing Depot',
            totalCapacityM2: 8500,
            usedCapacityM2: 5400,
            temperatureControlled: true,
            temperatureReading: '18.2°C',
            humidityReading: '55% RH',
            securityLevel: 'Industrial Park Security & Biometric Entry',
            activeLoadingDocks: 3,
            totalLoadingDocks: 4,
            fleetBaysCount: 10,
            operatingHours: '07:00 - 19:00 Mon-Sat',
            gpsCoordinates: '7.0620° N, 38.4764° E',
            certificationStatus: 'Ministry of Agriculture Phytosanitary Certified Depot',
            fireSafetyRating: 'Civil Defense Grade A Compliant',
            status: 'operational',
          },
        ];

        for (const wh of defaultWarehouses) {
          const item = this.warehouseRepository.create(wh);
          await this.warehouseRepository.save(item);
        }
        console.log('[CatalogService] Seeded 3 default operational wholesale warehouses');
      }
    } catch (err) {
      console.error('[CatalogService] Error seeding warehouses:', err);
    }
  }

  // --- Warehouse Logistics & Depots API ---

  async getSellerWarehouses(sellerId: string) {
    let warehouses = await this.warehouseRepository.find({
      where: { sellerId },
      order: { createdAt: 'ASC' },
    });

    // If fresh seller has no warehouses, provision default hubs
    if (warehouses.length === 0) {
      const defaultSupplierId = 'fb3a29e6-1d93-4621-ba45-1e6e59f72dc3';
      const existingDefaults = await this.warehouseRepository.find({
        where: { sellerId: defaultSupplierId },
        order: { createdAt: 'ASC' },
      });
      if (existingDefaults.length > 0 && sellerId !== defaultSupplierId) {
        const cloned = existingDefaults.map((w) =>
          this.warehouseRepository.create({
            ...w,
            id: undefined,
            sellerId,
          }),
        );
        warehouses = await this.warehouseRepository.save(cloned);
      } else if (existingDefaults.length > 0) {
        warehouses = existingDefaults;
      }
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