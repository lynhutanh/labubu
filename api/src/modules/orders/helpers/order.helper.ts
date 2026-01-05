import { IOrderFilter, IOrderSortOptions } from "../interfaces";

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export function buildOrderSearchFilter(params: {
  keyword?: string;
  status?: string;
  paymentStatus?: string;
  buyerId?: string;
  buyerType?: string;
  shopId?: string;
}): IOrderFilter {
  const filter: IOrderFilter = {};

  if (params.keyword) {
    filter.$or = [{ orderNumber: { $regex: params.keyword, $options: "i" } }];
  }

  if (params.status) {
    filter.status = params.status;
  }

  if (params.paymentStatus) {
    filter.paymentStatus = params.paymentStatus;
  }

  if (params.buyerId) {
    filter.buyerId = params.buyerId;
  }

  if (params.buyerType) {
    filter.buyerType = params.buyerType;
  }

  if (params.shopId) {
    filter["items.shopId"] = params.shopId;
  }

  return filter;
}

export function buildOrderSortOptions(
  sortBy: string = "createdAt",
  sortOrder: "asc" | "desc" = "desc",
): IOrderSortOptions {
  const sort: IOrderSortOptions = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;
  return sort;
}

export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function calculateOrderTotals(
  items: Array<{ price: number; salePrice?: number; quantity: number }>,
): { subtotal: number; totalItems: number } {
  let subtotal = 0;
  let totalItems = 0;

  for (const item of items) {
    const itemPrice =
      item.salePrice && item.salePrice > 0 ? item.salePrice : item.price;
    subtotal += itemPrice * item.quantity;
    totalItems += item.quantity;
  }

  return { subtotal, totalItems };
}
