// Export all services
export { authService } from "./auth.service";
export { cartService } from "./cart.service";
export { categoryService } from "./category.service";
export { orderService } from "./order.service";
export { productService } from "./product.service";
export { wishlistService } from "./wishlist.service";
export { walletService } from "./wallet.service";
export { walletDepositService } from "./wallet-deposit.service";
export { userService } from "./user.service";
export { ghnService } from "./ghn.service";
export { settingService } from "./setting.service";
export type { ContactInfo, TeamInfo, TeamMember } from "./setting.service";

// Export API Request base class
export { APIRequest, TOKEN } from "./api-request";
export type { IResponse } from "./api-request";

// Re-export all interfaces from interfaces folder
export type {
  // Auth
  LoginPayload,
  RegisterPayload,
  LoginResponse,
  RegisterResponse,
  UserProfile,
  // Product
  ProductSearchParams,
  ProductResponse,
  ProductSearchResponse,
  // Cart
  CartItem,
  CartResponse,
  AddToCartPayload,
  UpdateCartItemPayload,
  // Category
  SubcategoryResponse,
  CategoryResponse,
  // Order
  ShippingAddress,
  OrderItem,
  OrderResponse,
  CreateOrderPayload,
  OrderSearchParams,
} from "../interfaces";
