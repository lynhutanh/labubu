// Auth interfaces
export type { ILogin, LoginResponse } from './auth.interface';

// Brand interfaces
export type {
  Brand,
  CreateBrandPayload,
  UpdateBrandPayload,
  BrandSearchParams,
  BrandSearchResponse,
  BrandStats
} from './brand.interface';

// Category interfaces
export type {
  CreateSubcategoryPayload,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CategoryResponse,
  CategorySearchParams
} from './category.interface';

// File interfaces
export type { FileUploadResponse } from './file.interface';

// Order interfaces
export type {
  OrderSearchParams,
  OrderItem,
  ShippingAddress,
  OrderResponse,
  OrderSearchResponse,
  OrderStats
} from './order.interface';

// Product interfaces
export type {
  CreateProductPayload,
  UpdateProductPayload,
  ProductSearchParams,
  ProductResponse,
  ProductSearchResponse,
  ProductStats,
  BulkOperationPayload
} from './product.interface';

// User interfaces
export type {
  UserSearchParams,
  UserResponse,
  UserSearchResponse,
  CreateUserPayload,
  UpdateUserPayload
} from './user.interface';

// Setting interfaces
export type {
  ISetting,
  TabConfig,
  SettingFormItemProps
} from './setting.interface';

