import { Expose, Transform } from "class-transformer";
import { ObjectId } from "mongodb";
import { IOrderItem, IShippingAddress } from "../models";

export class OrderItemDto {
  @Expose()
  productId: ObjectId;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  price: number;

  @Expose()
  salePrice?: number;

  @Expose()
  quantity: number;

  @Expose()
  subtotal: number;

  @Expose()
  coverImage?: string;

  constructor(init?: IOrderItem) {
    if (init) {
      this.productId = init.productId;
      this.name = init.name;
      this.slug = init.slug;
      this.price = init.price;
      this.salePrice = init.salePrice;
      this.quantity = init.quantity;
      this.subtotal = init.subtotal;
      this.coverImage = init.coverImage;
    }
  }
}

export class ShippingAddressDto {
  @Expose()
  fullName: string;

  @Expose()
  phone: string;

  @Expose()
  address: string;

  @Expose()
  ward?: string;

  @Expose()
  district?: string;

  @Expose()
  city: string;

  @Expose()
  note?: string;

  constructor(init?: IShippingAddress) {
    if (init) {
      this.fullName = init.fullName;
      this.phone = init.phone;
      this.address = init.address;
      this.ward = init.ward;
      this.district = init.district;
      this.city = init.city;
      this.note = init.note;
    }
  }
}

export class OrderDto {
  @Expose()
  @Transform(({ obj }) => obj._id)
  _id: ObjectId;

  @Expose()
  orderNumber: string;

  @Expose()
  buyerId: ObjectId;

  @Expose()
  buyerType: string;

  @Expose()
  items: OrderItemDto[];

  @Expose()
  totalItems: number;

  @Expose()
  subtotal: number;

  @Expose()
  shippingFee: number;

  @Expose()
  discount: number;

  @Expose()
  total: number;

  @Expose()
  shippingAddress: ShippingAddressDto;

  @Expose()
  paymentMethod: string;

  @Expose()
  paymentStatus: string;

  @Expose()
  paymentTransactionId?: ObjectId;

  @Expose()
  paymentUrl?: string;

  @Expose()
  paymentRef?: string;

  @Expose()
  status: string;

  @Expose()
  cancelReason?: string;

  @Expose()
  cancelledAt?: Date;

  @Expose()
  confirmedAt?: Date;

  @Expose()
  shippedAt?: Date;

  @Expose()
  deliveredAt?: Date;

  @Expose()
  completedAt?: Date;

  @Expose()
  ghnOrderCode?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(init?: any) {
    if (init) {
      this._id = init._id;
      this.orderNumber = init.orderNumber;
      this.buyerId = init.buyerId;
      this.buyerType = init.buyerType;
      this.items = (init.items || []).map(
        (item: IOrderItem) => new OrderItemDto(item),
      );
      this.totalItems = init.totalItems;
      this.subtotal = init.subtotal;
      this.shippingFee = init.shippingFee || 0;
      this.discount = init.discount || 0;
      this.total = init.total;
      this.shippingAddress = new ShippingAddressDto(init.shippingAddress);
      this.paymentMethod = init.paymentMethod;
      this.paymentStatus = init.paymentStatus;
      this.paymentTransactionId = init.paymentTransactionId;
      this.paymentUrl = init.paymentUrl;
      this.paymentRef = init.paymentRef;
      this.status = init.status;
      this.cancelReason = init.cancelReason;
      this.cancelledAt = init.cancelledAt;
      this.confirmedAt = init.confirmedAt;
      this.shippedAt = init.shippedAt;
      this.deliveredAt = init.deliveredAt;
      this.completedAt = init.completedAt;
      this.ghnOrderCode = init.ghnOrderCode;
      this.createdAt = init.createdAt;
      this.updatedAt = init.updatedAt;
    }
  }

  toResponse() {
    return {
      _id: this._id,
      orderNumber: this.orderNumber,
      buyerId: this.buyerId,
      buyerType: this.buyerType,
      items: this.items,
      totalItems: this.totalItems,
      subtotal: this.subtotal,
      shippingFee: this.shippingFee,
      discount: this.discount,
      total: this.total,
      shippingAddress: this.shippingAddress,
      paymentMethod: this.paymentMethod,
      paymentStatus: this.paymentStatus,
      paymentTransactionId: this.paymentTransactionId,
      paymentUrl: this.paymentUrl,
      paymentRef: this.paymentRef,
      status: this.status,
      cancelReason: this.cancelReason,
      cancelledAt: this.cancelledAt,
      confirmedAt: this.confirmedAt,
      shippedAt: this.shippedAt,
      deliveredAt: this.deliveredAt,
      completedAt: this.completedAt,
      ghnOrderCode: this.ghnOrderCode,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export class OrderSearchResponseDto {
  @Expose()
  orders: OrderDto[];

  @Expose()
  total: number;

  @Expose()
  page: number;

  @Expose()
  limit: number;

  @Expose()
  totalPages: number;

  constructor(init?: Partial<OrderSearchResponseDto>) {
    if (init) {
      this.orders = init.orders || [];
      this.total = init.total || 0;
      this.page = init.page || 1;
      this.limit = init.limit || 20;
      this.totalPages = Math.ceil(this.total / this.limit);
    }
  }
}

export class OrderStatsDto {
  @Expose()
  totalOrders: number;

  @Expose()
  pendingOrders: number;

  @Expose()
  processingOrders: number;

  @Expose()
  completedOrders: number;

  @Expose()
  cancelledOrders: number;

  @Expose()
  totalRevenue: number;

  constructor(init?: Partial<OrderStatsDto>) {
    if (init) {
      this.totalOrders = init.totalOrders || 0;
      this.pendingOrders = init.pendingOrders || 0;
      this.processingOrders = init.processingOrders || 0;
      this.completedOrders = init.completedOrders || 0;
      this.cancelledOrders = init.cancelledOrders || 0;
      this.totalRevenue = init.totalRevenue || 0;
    }
  }
}
