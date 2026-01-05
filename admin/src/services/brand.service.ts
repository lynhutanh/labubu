import { APIRequest } from './api-request';
import {
  Brand,
  CreateBrandPayload,
  UpdateBrandPayload,
  BrandSearchParams,
  BrandSearchResponse,
  BrandStats
} from '../interfaces';

class BrandService extends APIRequest {
  public async getAll(): Promise<Brand[]> {
    const response = await this.get('/admin/brands');
    return response.data || [];
  }

  public async search(params: BrandSearchParams = {}): Promise<BrandSearchResponse> {
    const url = this.buildUrl('/admin/brands/search', params);
    const response = await this.get(url);
    return response.data;
  }

  public async getById(id: string): Promise<Brand> {
    const response = await this.get(`/admin/brands/${id}`);
    return response.data;
  }

  public async getStats(): Promise<BrandStats> {
    const response = await this.get('/admin/brands/stats');
    return response.data;
  }

  public async create(data: CreateBrandPayload): Promise<Brand> {
    const response = await this.post('/admin/brands', data);
    return response.data;
  }

  public async update(id: string, data: UpdateBrandPayload): Promise<Brand> {
    const response = await this.put(`/admin/brands/${id}`, data);
    return response.data;
  }

  public async delete(id: string): Promise<boolean> {
    await this.del(`/admin/brands/${id}`);
    return true;
  }

  public async bulkOperation(action: string, brandIds: string[]): Promise<{ success: number; failed: number }> {
    const response = await this.post('/admin/brands/bulk', { action, brandIds });
    return response.data;
  }
}

export const brandService = new BrandService();
