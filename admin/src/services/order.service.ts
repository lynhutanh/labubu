import { APIRequest } from './api-request';
import {
  OrderSearchParams,
  OrderResponse,
  OrderSearchResponse,
  OrderStats
} from '../interfaces';

class OrderService extends APIRequest {
  public async search(params?: OrderSearchParams): Promise<OrderSearchResponse> {
    const url = this.buildUrl('/admin/orders', params);
    const response = await this.get(url);
    return response.data;
  }

  public searchEndpoint() {
    return '/admin/orders';
  }

  public async getById(id: string): Promise<OrderResponse> {
    const response = await this.get(`/admin/orders/${id}`);
    return response.data;
  }

  public async getStats(): Promise<OrderStats> {
    const response = await this.get('/admin/orders/stats');
    return response.data;
  }

  public async updateStatus(id: string, status: string): Promise<OrderResponse> {
    const response = await this.put(`/admin/orders/${id}/status`, { status });
    return response.data;
  }

  public async updatePaymentStatus(id: string, paymentStatus: string): Promise<OrderResponse> {
    const response = await this.put(`/admin/orders/${id}/payment-status`, { paymentStatus });
    return response.data;
  }

  public async cancelOrder(id: string, reason: string): Promise<OrderResponse> {
    const response = await this.put(`/admin/orders/${id}/cancel`, { reason });
    return response.data;
  }
}

export const orderService = new OrderService();




