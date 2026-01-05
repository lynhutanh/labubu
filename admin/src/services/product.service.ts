import { APIRequest } from './api-request';
import {
  CreateProductPayload,
  UpdateProductPayload,
  ProductSearchParams,
  ProductResponse,
  ProductSearchResponse,
  ProductStats,
  BulkOperationPayload
} from '../interfaces';

class ProductService extends APIRequest {
  public async getAll(params?: ProductSearchParams): Promise<ProductResponse[]> {
    const url = this.buildUrl('/admin/products', params);
    const response = await this.get(url);
    return response.data.products;
  }

  public async search(params?: ProductSearchParams): Promise<ProductSearchResponse> {
    const url = this.buildUrl('/admin/products/search', params);
    const response = await this.get(url);
    return response.data;
  }

  public searchEndpoint() {
    return '/admin/products/search';
  }

  public async getById(id: string): Promise<ProductResponse> {
    const response = await this.get(`/admin/products/${id}`);
    return response.data;
  }

  public async create(payload: CreateProductPayload): Promise<ProductResponse> {
    const response = await this.post('/admin/products', payload);
    return response.data;
  }

  public async update(id: string, payload: UpdateProductPayload): Promise<ProductResponse> {
    const response = await this.put(`/admin/products/${id}`, payload);
    return response.data;
  }

  public async delete(id: string): Promise<{ success: boolean }> {
    const response = await this.del(`/admin/products/${id}`);
    return response.data;
  }

  public async getStats(): Promise<ProductStats> {
    const response = await this.get('/admin/products/stats');
    return response.data;
  }

  public async bulkOperation(
    payload: BulkOperationPayload
  ): Promise<{ success: number; failed: number }> {
    const response = await this.post('/admin/products/bulk', payload);
    return response.data;
  }

  public async approveProduct(id: string): Promise<ProductResponse> {
    const response = await this.put(`/admin/products/${id}/approve`);
    return response.data;
  }

  public async rejectProduct(id: string): Promise<ProductResponse> {
    const response = await this.put(`/admin/products/${id}/reject`);
    return response.data;
  }
}

export const productService = new ProductService();




