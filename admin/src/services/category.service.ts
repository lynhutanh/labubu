import { APIRequest } from './api-request';
import {
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CategoryResponse,
  CategorySearchParams
} from '../interfaces';

class CategoryService extends APIRequest {
  public async getAll(): Promise<CategoryResponse[]> {
    const response = await this.get('/categories?limit=100');
    return response.data || [];
  }

  public async search(params: CategorySearchParams = {}) {
    const url = this.buildUrl('/admin/categories/search', params);
    const response = await this.get(url);
    return response.data;
  }

  public searchEndpoint() {
    return '/admin/categories/search';
  }

  public async getCategory(id: string): Promise<CategoryResponse> {
    const response = await this.get(`/admin/categories/${id}`);
    return response.data;
  }

  public async create(data: CreateCategoryPayload): Promise<CategoryResponse> {
    const response = await this.post('/admin/categories', data);
    return response.data;
  }

  public async update(data: UpdateCategoryPayload): Promise<CategoryResponse> {
    const response = await this.put(`/admin/categories/${data._id}`, data);
    return response.data;
  }

  public async delete(id: string): Promise<void> {
    await this.del(`/admin/categories/${id}`);
  }

  public async uploadCategoryImage(file: File): Promise<string> {
    try {
      const response = await this.upload(
        '/file/upload/category',
        [{ file, fieldname: 'file' }],
        { onProgress: () => {} }
      );

      if ((response as any).data && (response as any).data.url) {
        return (response as any).data.url;
      } else {
        throw new Error((response as any).message || 'Upload failed');
      }
    } catch {
      throw new Error('Không thể tải ảnh danh mục lên. Vui lòng thử lại.');
    }
  }
}

export const categoryService = new CategoryService();
