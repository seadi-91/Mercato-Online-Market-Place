import { Test, TestingModule } from '@nestjs/testing';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { ProductUnit, StockAction } from '@app/common';

describe('CatalogController', () => {
  let catalogController: CatalogController;
  let catalogService: CatalogService;

  const mockCatalogService = {
    filterProducts: jest.fn(),
    getProductById: jest.fn(),
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
    deleteProduct: jest.fn(),
    setProductStatus: jest.fn(),
    deleteProductAdmin: jest.fn(),
    updateStock: jest.fn(),
    getCategories: jest.fn(),
    getCategoryById: jest.fn(),
    createCategory: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogController],
      providers: [
        {
          provide: CatalogService,
          useValue: mockCatalogService,
        },
      ],
    }).compile();

    catalogController = module.get<CatalogController>(CatalogController);
    catalogService = module.get<CatalogService>(CatalogService);
  });

  it('should be defined', () => {
    expect(catalogController).toBeDefined();
  });

  it('should get products', async () => {
    const filterDto = { page: 1, limit: 10 };
    const result = { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    mockCatalogService.filterProducts.mockResolvedValue(result);

    expect(await catalogController.getProducts(filterDto)).toBe(result);
    expect(mockCatalogService.filterProducts).toHaveBeenCalledWith(filterDto);
  });

  it('should get product by id', async () => {
    const payload = { id: 'prod-uuid' };
    const result = { id: 'prod-uuid', title: 'Product 1' };
    mockCatalogService.getProductById.mockResolvedValue(result);

    expect(await catalogController.getProductById(payload)).toBe(result);
    expect(mockCatalogService.getProductById).toHaveBeenCalledWith(payload.id);
  });

  it('should create a product', async () => {
    const payload = {
      sellerId: 'seller-uuid',
      dto: {
        title: 'Bulk Cotton Fabric',
        description: 'Premium quality cotton roll from Merkato',
        sku: 'CTN-001',
        categoryId: 'cat-uuid',
        retailPrice: 500,
        wholesalePrice: 350,
        minOrderQuantity: 10,
        unit: ProductUnit.ROLL,
        stockQuantity: 100,
      },
    };
    const result = { id: 'prod-uuid', ...payload.dto, sellerId: payload.sellerId };
    mockCatalogService.createProduct.mockResolvedValue(result);

    expect(await catalogController.createProduct(payload)).toBe(result);
    expect(mockCatalogService.createProduct).toHaveBeenCalledWith(
      payload.sellerId,
      payload.dto,
    );
  });

  it('should update stock', async () => {
    const payload = {
      id: 'prod-uuid',
      action: StockAction.DEDUCT,
      quantity: 5,
    };
    const result = { success: true, stockQuantity: 95, isAvailable: true };
    mockCatalogService.updateStock.mockResolvedValue(result);

    expect(await catalogController.updateStock(payload)).toBe(result);
    expect(mockCatalogService.updateStock).toHaveBeenCalledWith(
      payload.id,
      payload.action,
      payload.quantity,
    );
  });

  it('should suspend or reactivate a product for admin moderation', async () => {
    const payload = { id: 'prod-uuid', isActive: false };
    const result = { success: true, isActive: false };
    mockCatalogService.setProductStatus.mockResolvedValue(result);

    expect(await catalogController.setProductStatus(payload)).toBe(result);
    expect(mockCatalogService.setProductStatus).toHaveBeenCalledWith(
      payload.id,
      payload.isActive,
    );
  });

  it('should hard delete a product for admin moderation', async () => {
    const payload = { id: 'prod-uuid' };
    const result = { success: true };
    mockCatalogService.deleteProductAdmin.mockResolvedValue(result);

    expect(await catalogController.deleteProductAdmin(payload)).toBe(result);
    expect(mockCatalogService.deleteProductAdmin).toHaveBeenCalledWith(payload.id);
  });

  it('should get categories', async () => {
    const payload = { tree: true };
    const result = [{ id: 'cat-1', name: 'Textiles', subCategories: [] }];
    mockCatalogService.getCategories.mockResolvedValue(result);

    expect(await catalogController.getCategories(payload)).toBe(result);
    expect(mockCatalogService.getCategories).toHaveBeenCalledWith(true);
  });

  it('should delete a category for admin management', async () => {
    const payload = { id: 'cat-uuid' };
    const result = { success: true };
    mockCatalogService.deleteCategory.mockResolvedValue(result);

    expect(await catalogController.deleteCategory(payload)).toBe(result);
    expect(mockCatalogService.deleteCategory).toHaveBeenCalledWith(payload.id);
  });
});
