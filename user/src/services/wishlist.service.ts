import { APIRequest } from "./api-request";

export interface WishlistItem {
  productId: string;
  addedAt?: Date;
  product?: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    salePrice?: number;
    files?: Array<{ url: string; thumbnailUrl?: string }>;
    coverImage?: string;
    stock?: number;
    brand?: {
      _id: string;
      name: string;
    };
  };
}

export interface Wishlist {
  _id: string;
  ownerId: string;
  ownerType: string;
  items: WishlistItem[];
  totalItems: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AddToWishlistPayload {
  productId: string;
}

export interface RemoveFromWishlistPayload {
  productId: string;
}

export class WishlistService extends APIRequest {
  public async getWishlist(): Promise<Wishlist> {
    const response = await this.get("/wishlist");
    return response.data?.data || response.data;
  }

  public async addToWishlist(payload: AddToWishlistPayload): Promise<Wishlist> {
    const response = await this.post("/wishlist/items", payload);
    return response.data?.data || response.data;
  }

  public async removeFromWishlist(
    payload: RemoveFromWishlistPayload,
  ): Promise<Wishlist> {
    const response = await this.del("/wishlist/items", payload);
    return response.data?.data || response.data;
  }

  public async clearWishlist(): Promise<Wishlist> {
    const response = await this.del("/wishlist");
    return response.data?.data || response.data;
  }

  public async checkProduct(productId: string): Promise<boolean> {
    const response = await this.get(`/wishlist/check?productId=${productId}`);
    return response.data?.data?.isInWishlist || false;
  }
}

export const wishlistService = new WishlistService();
