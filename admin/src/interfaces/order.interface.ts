export interface OrderSearchParams {
  keyword?: string;
  status?: string;
  paymentStatus?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  quantity: number;
  subtotal: number;
  coverImage?: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  ward?: string;
  district?: string;
  city: string;
  note?: string;
}

export interface OrderUser {
  _id?: string;
  name?: string;
  username?: string;
  email?: string;
}

export interface OrderResponse {
  _id: string;
  orderNumber: string;
  buyerId: string;
  buyerType: string;
  items: OrderItem[];
  totalItems: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentRef?: string;
  paymentStatus: string;
  status: string;
  ghnOrderCode?: string;
  user?: OrderUser;
  cancelReason?: string;
  cancelledAt?: Date;
  confirmedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderSearchResponse {
  data: OrderResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

