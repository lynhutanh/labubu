import { APIRequest } from "./api-request";

export interface BrandResponse {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  image?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BrandSearchParams {
  keyword?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

class BrandService extends APIRequest {
  async getBrands(params?: BrandSearchParams): Promise<BrandResponse[]> {
    const url = this.buildUrl("/brands", params);
    const response = await this.get(url);
    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }
    if (Array.isArray(response?.data)) {
      return response.data;
    }
    if (Array.isArray(response)) {
      return response;
    }
    return [];
  }

  async getBrandById(id: string): Promise<BrandResponse> {
    const response = await this.get(`/brands/${id}`);
    return response?.data?.data || response?.data || response;
  }
}

export const brandService = new BrandService();
