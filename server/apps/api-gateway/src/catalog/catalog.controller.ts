import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  AuthGuard,
  CreateCategoryDto,
  CreateProductDto,
  CurrentUser,
  FilterProductsDto,
  Roles,
  RolesGuard,
  UpdateCategoryDto,
  UpdateProductDto,
  UpdateStockDto,
  UserRole,
} from '@app/common';

@Controller('catalog')
export class CatalogController {
  constructor(
    @Inject('CATALOG_SERVICE') private readonly catalogClient: ClientProxy,
  ) {}

  @Get('products')
  getProducts(@Query() query: FilterProductsDto) {
    return this.catalogClient.send('get_products', query);
  }

  @Get('products/:id')
  getProductById(@Param('id') id: string) {
    return this.catalogClient.send('get_product_by_id', { id });
  }

  @Get('categories')
  getCategories(@Query('tree') tree?: string) {
    const isTree = tree === undefined ? true : tree === 'true';
    return this.catalogClient.send('get_categories', { tree: isTree });
  }

  @Get('categories/:id')
  getCategoryById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.catalogClient.send('get_category_by_id', { id });
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @Post('products')
  createProduct(
    @CurrentUser('id') sellerId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.catalogClient.send('create_product', { sellerId, dto });
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @Patch('products/:id')
  updateProduct(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser('id') sellerId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.catalogClient.send('update_product', { id, sellerId, dto });
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @Delete('products/:id')
  deleteProduct(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser('id') sellerId: string,
  ) {
    return this.catalogClient.send('delete_product', { id, sellerId });
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @Patch('products/:id/stock')
  updateStock(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser('id') sellerId: string,
    @CurrentUser('role') role: UserRole,
    @Body() dto: UpdateStockDto,
  ) {
    return this.catalogClient.send('update_stock', {
      id,
      sellerId,
      role,
      action: dto.action,
      quantity: dto.quantity,
    });
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('products/:id/status')
  setProductStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.catalogClient.send('set_product_status', {
      id,
      isActive: body.isActive,
    });
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('products/:id/admin')
  deleteProductAdmin(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.catalogClient.send('delete_product_admin', { id });
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.catalogClient.send('create_category', dto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('categories/:id')
  updateCategory(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.catalogClient.send('update_category', { id, dto });
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('categories/:id')
  deleteCategory(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.catalogClient.send('delete_category', { id });
  }
}

