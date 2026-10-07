import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CatalogService } from './catalog.service';
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

@Controller()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @MessagePattern('get_products')
  getProducts(@Payload() dto: FilterProductsDto) {
    return this.catalogService.filterProducts(dto);
  }

  @MessagePattern('get_product_by_id')
  getProductById(@Payload() payload: { id: string }) {
    return this.catalogService.getProductById(payload.id);
  }

  @MessagePattern('create_product')
  createProduct(
    @Payload() payload: { sellerId: string; dto: CreateProductDto },
  ) {
    return this.catalogService.createProduct(payload.sellerId, payload.dto);
  }

  @MessagePattern('update_product')
  updateProduct(
    @Payload()
    payload: {
      id: string;
      sellerId: string;
      dto: UpdateProductDto;
    },
  ) {
    return this.catalogService.updateProduct(
      payload.id,
      payload.sellerId,
      payload.dto,
    );
  }

  @MessagePattern('delete_product')
  deleteProduct(@Payload() payload: { id: string; sellerId: string }) {
    return this.catalogService.deleteProduct(payload.id, payload.sellerId);
  }

  @MessagePattern('update_stock')
  updateStock(
    @Payload()
    payload: {
      id: string;
      action: StockAction;
      quantity: number;
      sellerId?: string;
      role?: any;
    },
  ) {
    if (payload.sellerId !== undefined || payload.role !== undefined) {
      return this.catalogService.updateStock(
        payload.id,
        payload.action,
        payload.quantity,
        payload.sellerId,
        payload.role,
      );
    }
    return this.catalogService.updateStock(
      payload.id,
      payload.action,
      payload.quantity,
    );
  }

  @MessagePattern('get_categories')
  getCategories(@Payload() payload?: { tree?: boolean }) {
    return this.catalogService.getCategories(payload?.tree ?? true);
  }

  @MessagePattern('get_category_by_id')
  getCategoryById(@Payload() payload: { id: string }) {
    return this.catalogService.getCategoryById(payload.id);
  }

  @MessagePattern('create_category')
  createCategory(@Payload() dto: CreateCategoryDto) {
    return this.catalogService.createCategory(dto);
  }

  @MessagePattern('update_category')
  updateCategory(
    @Payload() payload: { id: string; dto: UpdateCategoryDto },
  ) {
    return this.catalogService.updateCategory(payload.id, payload.dto);
  }

  @MessagePattern('delete_category')
  deleteCategory(@Payload() payload: { id: string }) {
    return this.catalogService.deleteCategory(payload.id);
  }

  @MessagePattern('get_seller_products')
  getSellerProducts(
    @Payload() payload: { sellerId: string; dto: FilterSellerProductsDto },
  ) {
    return this.catalogService.getSellerProducts(
      payload.sellerId,
      payload.dto,
    );
  }

  @MessagePattern('toggle_product_availability')
  toggleProductAvailability(
    @Payload()
    payload: {
      id: string;
      sellerId: string;
      isAvailable: boolean;
    },
  ) {
    return this.catalogService.toggleProductAvailability(
      payload.id,
      payload.sellerId,
      payload.isAvailable,
    );
  }

  @MessagePattern('set_product_status')
  setProductStatus(@Payload() payload: { id: string; isActive: boolean }) {
    return this.catalogService.setProductStatus(payload.id, payload.isActive);
  }

  @MessagePattern('delete_product_admin')
  deleteProductAdmin(@Payload() payload: { id: string }) {
    return this.catalogService.deleteProductAdmin(payload.id);
  }

  @MessagePattern('get_catalog_metrics')
  getCatalogMetrics() {
    return this.catalogService.getCatalogMetrics();
  }

  @MessagePattern('get_seller_inventory_alerts')
  getSellerInventoryAlerts(@Payload() payload: { sellerId: string }) {
    return this.catalogService.getSellerInventoryAlerts(payload.sellerId);
  }

  @MessagePattern('get_seller_warehouses')
  getSellerWarehouses(@Payload() payload: { sellerId: string }) {
    return this.catalogService.getSellerWarehouses(payload.sellerId);
  }

  @MessagePattern('get_seller_warehouse_by_id')
  getSellerWarehouseById(@Payload() payload: { sellerId: string; id: string }) {
    return this.catalogService.getSellerWarehouseById(
      payload.sellerId,
      payload.id,
    );
  }

  @MessagePattern('create_seller_warehouse')
  createSellerWarehouse(
    @Payload() payload: { sellerId: string; dto: CreateWarehouseDto },
  ) {
    return this.catalogService.createSellerWarehouse(
      payload.sellerId,
      payload.dto,
    );
  }

  @MessagePattern('update_seller_warehouse')
  updateSellerWarehouse(
    @Payload()
    payload: {
      sellerId: string;
      id: string;
      dto: UpdateWarehouseDto;
    },
  ) {
    return this.catalogService.updateSellerWarehouse(
      payload.sellerId,
      payload.id,
      payload.dto,
    );
  }

  @MessagePattern('delete_seller_warehouse')
  deleteSellerWarehouse(@Payload() payload: { sellerId: string; id: string }) {
    return this.catalogService.deleteSellerWarehouse(
      payload.sellerId,
      payload.id,
    );
  }

  @MessagePattern('get_warehouse_transfers')
  getWarehouseTransfers(@Payload() payload: { sellerId: string }) {
    return this.catalogService.getWarehouseTransfers(payload.sellerId);
  }

  @MessagePattern('create_warehouse_transfer')
  createWarehouseTransfer(
    @Payload() payload: { sellerId: string; dto: CreateWarehouseTransferDto },
  ) {
    return this.catalogService.createWarehouseTransfer(
      payload.sellerId,
      payload.dto,
    );
  }

  @MessagePattern('update_warehouse_transfer_status')
  updateWarehouseTransferStatus(
    @Payload() payload: { sellerId: string; id: string; status: string },
  ) {
    return this.catalogService.updateWarehouseTransferStatus(
      payload.sellerId,
      payload.id,
      payload.status,
    );
  }
}
