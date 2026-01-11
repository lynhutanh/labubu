import { APIRequest } from "./api-request";

export interface CartItem {
  productId: string;
  quantity: number;
  addedAt?: Date;
  product?: {
    _id: string;
    name: string;
    price: number;
    salePrice?: number;
    files?: Array<{ url: string; thumbnailUrl?: string }>;
    coverImage?: string;
    stock?: number;
  };
}

export interface Cart {
  _id: string;
  ownerId: string;
  ownerType: string;
  items: CartItem[];
  totalItems: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AddToCartPayload {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemPayload {
  productId: string;
  quantity: number;
}

export interface RemoveFromCartPayload {
  productId: string;
}

export class CartService extends APIRequest {
  public async getCart(): Promise<Cart> {
    const response = await this.get("/cart");
    return response.data?.data || response.data;
  }

  public async addToCart(payload: AddToCartPayload): Promise<Cart> {
    const response = await this.post("/cart/items", payload);
    return response.data?.data || response.data;
  }

  public async updateCartItem(payload: UpdateCartItemPayload): Promise<Cart> {
    const response = await this.put("/cart/items", payload);
    return response.data?.data || response.data;
  }

  public async removeFromCart(payload: RemoveFromCartPayload): Promise<Cart> {
    const response = await this.del("/cart/items", payload);
    return response.data?.data || response.data;
  }

  public async clearCart(): Promise<Cart> {
    const response = await this.del("/cart");
    return response.data?.data || response.data;
  }
}

export const cartService = new CartService();

