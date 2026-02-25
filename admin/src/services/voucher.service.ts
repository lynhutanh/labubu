import { APIRequest } from './api-request';

export interface VoucherResponse {
  _id: string;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'shipping';
  value: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  totalQuantity: number;
  usedQuantity: number;
  startDate: string;
  endDate: string;
  applicableCategories: string[];
  applicableProducts: string[];
  applicableUsers: string[];
  maxUsesPerUser: number;
  status: 'active' | 'inactive' | 'expired';
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface VoucherSearchParams {
  keyword?: string;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface VoucherSearchResponse {
  vouchers: VoucherResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateVoucherPayload {
  code: string;
  name: string;
  description?: string;
  type: string;
  value: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  totalQuantity: number;
  startDate: string;
  endDate: string;
  applicableCategories?: string[];
  applicableProducts?: string[];
  applicableUsers?: string[];
  maxUsesPerUser?: number;
  image?: string;
}

export interface UpdateVoucherPayload extends Partial<CreateVoucherPayload> {
  status?: string;
}

class VoucherService extends APIRequest {
  public async search(params?: VoucherSearchParams): Promise<VoucherSearchResponse> {
    const url = this.buildUrl('/admin/vouchers/search', params);
    const response = await this.get(url);
    return response.data;
  }

  public async getById(id: string): Promise<VoucherResponse> {
    const response = await this.get(`/admin/vouchers/${id}`);
    return response.data;
  }

  public async getStats(): Promise<{ totalVouchers: number; activeVouchers: number; expiredVouchers: number; inactiveVouchers: number }> {
    const response = await this.get('/admin/vouchers/stats');
    return response.data;
  }

  public async create(data: CreateVoucherPayload): Promise<VoucherResponse> {
    const response = await this.post('/admin/vouchers', data);
    return response.data;
  }

  public async update(id: string, data: UpdateVoucherPayload): Promise<VoucherResponse> {
    const response = await this.put(`/admin/vouchers/${id}`, data);
    return response.data;
  }

  public async delete(id: string): Promise<void> {
    await this.del(`/admin/vouchers/${id}`);
  }

  public async bulkOperation(voucherIds: string[], action: string): Promise<{ success: number; failed: number }> {
    const response = await this.post('/admin/vouchers/bulk', { voucherIds, action });
    return response.data;
  }
}

export const voucherService = new VoucherService();
