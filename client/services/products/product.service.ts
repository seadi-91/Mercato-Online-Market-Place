import { sellerService } from "@/services/seller/seller.service";

export const productService = {
  getProducts: sellerService.getProducts,
  getProductById: sellerService.getProductById,
  createProduct: sellerService.createProduct,
  updateProduct: sellerService.updateProduct,
  deleteProduct: sellerService.deleteProduct,
  updateStock: sellerService.updateStock,
  toggleAvailability: sellerService.toggleAvailability,
  getCategories: sellerService.getCategories,
  uploadImage: sellerService.uploadImage,
};

export default productService;
