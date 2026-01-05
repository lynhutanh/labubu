// Export all services
export { authService } from './auth.service';
export { brandService } from './brand.service';
export { categoryService } from './category.service';
export { fileService } from './file.service';
export { orderService } from './order.service';
export { productService } from './product.service';
export { userService } from './user.service';
export { settingsService } from './settings.service';

// Export API Request base class
export { APIRequest, TOKEN } from './api-request';
export type { IResponse } from './api-request';

// Re-export all interfaces from interfaces folder
export type {
  // Auth
  ILogin,
  LoginResponse,
  // Brand
  Brand,
  CreateBrandPayload,
  UpdateBrandPayload,
  BrandSearchParams,
  BrandSearchResponse,
  BrandStats,
  // Category
  CreateSubcategoryPayload,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CategoryResponse,
  CategorySearchParams,
  // File
  FileUploadResponse,
  // Order
  OrderSearchParams,
  OrderItem,
  ShippingAddress,
  OrderResponse,
  OrderSearchResponse,
  OrderStats,
  // Product
  CreateProductPayload,
  UpdateProductPayload,
  ProductSearchParams,
  ProductResponse,
  ProductSearchResponse,
  ProductStats,
  BulkOperationPayload,
  // User
  UserSearchParams,
  UserResponse,
  UserSearchResponse,
  CreateUserPayload,
  UpdateUserPayload,
  // Setting
  ISetting,
  TabConfig,
  SettingFormItemProps
} from '../interfaces';
