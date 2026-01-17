import { APIRequest } from "./api-request";

export interface CreateOrderPayload {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    ward?: string;
    wardCode?: string;
    district?: string;
    districtId?: string;
    city: string;
    provinceId?: string;
    note?: string;
  };
  paymentMethod: "cod" | "wallet" | "paypal" | "zalopay" | "sepay";
}

export interface Order {
  _id: string;
  orderNumber: string;
  buyerId: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    salePrice?: number;
    quantity: number;
    subtotal: number;
    coverImage?: string;
  }>;
  total: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  paymentMethod: string;
  paymentRef?: string;
  paymentStatus: string;
  status: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    ward?: string;
    district?: string;
    city: string;
    note?: string;
  };
  createdAt: Date;
  paymentUrl?: string;
}

export interface PaymentInfo {
  amount: number;
  paymentRef: string;
  qrUrl: string;
  expiredAt: string;
}

export interface OrderStatus {
  orderCode: string;
  status: string;
  paymentStatus: string;
  paymentRef?: string;
}

export interface OrdersResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
}

export class OrderService extends APIRequest {
  public async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const response = await this.post("/orders", payload);
    return response.data?.data || response.data;
  }

  public async getPaymentInfo(orderCode: string): Promise<PaymentInfo> {
    const response = await this.get(`/orders/${orderCode}/payment`);
    return response.data?.data || response.data;
  }

  public async getOrderStatus(orderCode: string): Promise<OrderStatus> {
    const response = await this.get(`/orders/${orderCode}/status`);
    return response.data?.data || response.data;
  }

  public async getOrderById(orderId: string): Promise<Order> {
    const response = await this.get(`/orders/${orderId}`);
    return response.data?.data || response.data;
  }

  public async getOrders(params?: OrderListParams): Promise<OrdersResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.paymentStatus) queryParams.append("paymentStatus", params.paymentStatus);
    
    const queryString = queryParams.toString();
    const url = `/orders${queryString ? `?${queryString}` : ""}`;
    const response = await this.get(url);
    
    // Response structure: { status: 0, data: { data: [...], total: ..., page: ..., limit: ..., totalPages: ... } }
    // hoặc: { data: { data: [...], total: ..., page: ..., limit: ..., totalPages: ... } }
    const responseData = response.data || response;
    
    // Nếu có nested data.data thì lấy, không thì lấy data trực tiếp
    if (responseData.data && Array.isArray(responseData.data.data)) {
      return responseData.data;
    } else if (responseData.data && responseData.data.total !== undefined) {
      return responseData.data;
    } else if (Array.isArray(responseData.data)) {
      // Fallback: nếu data là array trực tiếp
      return {
        data: responseData.data,
        total: responseData.total || responseData.data.length,
        page: responseData.page || 1,
        limit: responseData.limit || responseData.data.length,
        totalPages: responseData.totalPages || 1,
      };
    }
    
    // Default fallback
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
  }
}

export const orderService = new OrderService();
