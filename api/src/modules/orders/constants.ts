export const ORDER_PROVIDER = "ORDER";

export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPING: "shipping",
  DELIVERED: "delivered",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
} as const;

export const PAYMENT_METHOD = {
  COD: "cod",
  WALLET: "wallet",
  PAYPAL: "paypal",
  ZALOPAY: "zalopay",
  SEPAY: "sepay",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

export const BUYER_TYPE = {
  USER: "user",
} as const;

export const ORDER_CHANNELS = {
  ORDER_CREATED: "ORDER_CREATED_CHANNEL",
  ORDER_UPDATED: "ORDER_UPDATED_CHANNEL",
  ORDER_CANCELLED: "ORDER_CANCELLED_CHANNEL",
};

export const ORDER_TOPICS = {
  ORDER_CREATED: "HANDLE_ORDER_CREATED_TOPIC",
  ORDER_UPDATED: "HANDLE_ORDER_UPDATED_TOPIC",
  ORDER_CANCELLED: "HANDLE_ORDER_CANCELLED_TOPIC",
};
