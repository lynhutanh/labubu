import { APIRequest } from './api-request';
import {
  UserSearchParams,
  UserResponse,
  UserSearchResponse,
  CreateUserPayload,
  UpdateUserPayload
} from '../interfaces';

class UserService extends APIRequest {
  public async search(params?: UserSearchParams): Promise<UserSearchResponse> {
    const url = this.buildUrl('/admin/users', params);
    const response = await this.get(url);
    // API returns { data: { data: [...], total } }
    return response.data || { data: [], total: 0 };
  }

  public searchEndpoint() {
    return '/admin/users';
  }

  public async getById(id: string): Promise<UserResponse> {
    const response = await this.get(`/users/${id}`);
    return response.data;
  }

  public async create(data: CreateUserPayload): Promise<UserResponse> {
    const response = await this.post('/users/register', data);
    return response.data;
  }

  public async update(id: string, data: UpdateUserPayload): Promise<UserResponse> {
    const response = await this.put(`/users/${id}`, data);
    return response.data;
  }

  public async delete(id: string): Promise<void> {
    await this.del(`/users/${id}`);
  }

  public async changeStatus(id: string, status: string): Promise<UserResponse> {
    const response = await this.put(`/users/${id}/status`, { status });
    return response.data;
  }

  public async changeRole(id: string, role: string): Promise<UserResponse> {
    const response = await this.put(`/users/${id}/role`, { role });
    return response.data;
  }
}

export const userService = new UserService();

