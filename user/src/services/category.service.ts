import { APIRequest } from "./api-request";

export interface Category {
  _id: string;
  name: string;
  slug?: string;
  status?: string;
  sortOrder?: number;
}

export class CategoryService extends APIRequest {
  public async getAll(): Promise<Category[]> {
    const response = await this.get("/categories?limit=100");
    return response.data || [];
  }

  public async getById(id: string): Promise<Category> {
    const response = await this.get(`/categories/${id}`);
    return response.data;
  }
}

export const categoryService = new CategoryService();

