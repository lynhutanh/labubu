export const TRANSACTION_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
} as const;

export const PAYMENT_METHOD = {
  CASH_ON_DELIVERY: "cash_on_delivery",
  BANK_TRANSFER: "bank_transfer",
  ZALOPAY: "zalopay",
  PAYPAL: "paypal",
} as const;

export const PAYMENT_PROVIDER = {
  ZALOPAY: "zalopay",
  BANK: "bank",
  PAYPAL: "paypal",
} as const;

export const PAYMENT_CHANNELS = {
  PAYMENT_SUCCESS: "PAYMENT_SUCCESS_CHANNEL",
} as const;

export const PAYMENT_TOPICS = {
  PAYMENT_SUCCESS: "HANDLE_PAYMENT_SUCCESS_TOPIC",
} as const;

export const WALLET_OWNER_TYPE = {
  USER: "user",
  SYSTEM: "system",
} as const;

export const WALLET_STATUS = {
  ACTIVE: "active",
  FROZEN: "frozen",
  SUSPENDED: "suspended",
} as const;

export const WALLET_TRANSACTION_TYPE = {
  DEPOSIT: "deposit",
  WITHDRAW: "withdraw",
  PURCHASE: "purchase",
  REFUND: "refund",
  TRANSFER: "transfer",
} as const;

export const WALLET_TRANSACTION_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

export const WALLET_CHANNELS = {
  WALLET_CREATED: "WALLET_CREATED_CHANNEL",
  WALLET_UPDATED: "WALLET_UPDATED_CHANNEL",
} as const;

export const WALLET_TOPICS = {
  WALLET_CREATED: "HANDLE_WALLET_CREATED_TOPIC",
  WALLET_UPDATED: "HANDLE_WALLET_UPDATED_TOPIC",
} as const;

export const WALLET_MODEL_PROVIDER = "WALLET_MODEL_PROVIDER";
export const WALLET_TRANSACTION_MODEL_PROVIDER =
  "WALLET_TRANSACTION_MODEL_PROVIDER";

export const SYSTEM_WALLET_ID = "SYSTEM_ADMIN_WALLET";

export type TransactionStatus =
  (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS];
export type PaymentMethod =
  (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];
export type PaymentProvider =
  (typeof PAYMENT_PROVIDER)[keyof typeof PAYMENT_PROVIDER];
export type WalletOwnerType =
  (typeof WALLET_OWNER_TYPE)[keyof typeof WALLET_OWNER_TYPE];
export type WalletStatus = (typeof WALLET_STATUS)[keyof typeof WALLET_STATUS];
export type WalletTransactionType =
  (typeof WALLET_TRANSACTION_TYPE)[keyof typeof WALLET_TRANSACTION_TYPE];
export type WalletTransactionStatus =
  (typeof WALLET_TRANSACTION_STATUS)[keyof typeof WALLET_TRANSACTION_STATUS];
