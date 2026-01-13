import { APIRequest } from "./api-request";

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  stock?: number;
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  images?: Array<{ url: string; thumbnailUrl?: string }>;
  files?: Array<{ url: string; thumbnailUrl?: string }>;
  categoryId?: {
    _id: string;
    name: string;
  };
  badge?: string;
}

export interface ProductSearchParams {
  keyword?: string; // API uses 'keyword' not 'q'
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  page?: number;
}

export interface ProductSearchResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ProductService extends APIRequest {
  public async search(params?: ProductSearchParams): Promise<ProductSearchResponse> {
    const url = this.buildUrl("/products", params);
    const response = await this.get(url);
    // API returns: { status: 0, data: { products: [], total, page, limit, totalPages } }
    // axios.get() returns resp.data, so response = { status: 0, data: { products: [], ... } }
    // We need to access response.data.data.products
    
    // Try response.data.data first (nested structure)
    const nestedData = (response as any).data?.data;
    if (nestedData && nestedData.products && Array.isArray(nestedData.products)) {
      return {
        data: nestedData.products,
        total: nestedData.total || 0,
        page: nestedData.page || 1,
        limit: nestedData.limit || 20,
        totalPages: nestedData.totalPages || 0,
      };
    }
    
    // Fallback: try response.data directly
    const apiData = (response as any).data || response;
    if (apiData && apiData.products && Array.isArray(apiData.products)) {
      return {
        data: apiData.products,
        total: apiData.total || 0,
        page: apiData.page || 1,
        limit: apiData.limit || 20,
        totalPages: apiData.totalPages || 0,
      };
    }
    
    return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }

  public async getFeatured(limit: number = 10): Promise<Product[]> {
    const response = await this.get(`/products/featured?limit=${limit}`);
    // API returns DataResponse with data field containing array
    return response.data?.data || response.data || [];
  }

  public async getNew(limit: number = 10): Promise<Product[]> {
    const response = await this.get(`/products/new?limit=${limit}`);
    // API returns DataResponse with data field containing array
    return response.data?.data || response.data || [];
  }

  public async getBestSellers(limit: number = 10): Promise<Product[]> {
    const response = await this.get(`/products/best-sellers?limit=${limit}`);
    // API returns DataResponse with data field containing array
    return response.data?.data || response.data || [];
  }

  public async getById(id: string): Promise<Product> {
    const response = await this.get(`/products/${id}`);
    // API returns DataResponse with data field
    return response.data?.data || response.data;
  }

  public async getBySlug(slug: string): Promise<Product> {
    const response = await this.get(`/products/slug/${slug}`);
    // API returns DataResponse with data field
    return response.data?.data || response.data;
  }
}

export const productService = new ProductService();

