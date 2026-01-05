export interface ITransactionUpdateData {
  status?: string;
  externalTransactionId?: string;
  providerData?: Record<string, unknown>;
  completedAt?: Date;
  failedAt?: Date;
  notes?: string;
}

export interface IZaloPaySettings {
  zalopayAppId: string;
  zalopayKey1: string;
  zalopayKey2: string;
  zalopayEndpoint: string;
  zalopayRedirectUrl: string;
}

export interface IZaloPayRequestParams {
  appid: string;
  appuser: string;
  apptime: number;
  amount: number;
  apptransid: string;
  embeddata: string;
  item: string;
  description: string;
  mac: string;
  bankcode: string;
  callbackurl: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface IZaloPayStatusParams {
  appid: string;
  apptransid: string;
  mac: string;
}

export interface IZaloPayBankListParams {
  appid: string;
  reqtime: number;
  mac: string;
}

export interface IZaloPayRawCallbackData {
  appid: string | number;
  apptransid: string;
  pmcid: string | number;
  bankcode: string;
  amount: string | number;
  discountamount?: string | number;
  status: string | number;
  checksum: string;
  [key: string]: unknown;
}

export interface IZaloPayEmbedData {
  redirecturl: string;
  merchantinfo: string;
}

export interface IZaloPayCallbackData {
  appid: number;
  apptransid: string;
  pmcid: number;
  bankcode: string;
  amount: number;
  discountamount: number;
  status: number;
  checksum: string;
}

export interface IPayPalSettings {
  paypalClientId: string;
  paypalClientSecret: string;
  paypalMode: string;
  paypalReturnUrl: string;
  paypalCancelUrl: string;
  paypalWebhookId?: string;
  paypalEnabled: string;
}

export interface IPayPalAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface IPayPalOrderItem {
  name: string;
  quantity: string;
  unit_amount: {
    currency_code: string;
    value: string;
  };
  description?: string;
}

export interface IPayPalCreateOrderRequest {
  intent: "CAPTURE" | "AUTHORIZE";
  purchase_units: Array<{
    reference_id?: string;
    description?: string;
    custom_id?: string;
    amount: {
      currency_code: string;
      value: string;
      breakdown?: {
        item_total?: {
          currency_code: string;
          value: string;
        };
      };
    };
    items?: IPayPalOrderItem[];
  }>;
  application_context?: {
    brand_name?: string;
    landing_page?: "LOGIN" | "BILLING" | "NO_PREFERENCE";
    user_action?: "CONTINUE" | "PAY_NOW";
    return_url?: string;
    cancel_url?: string;
    locale?: string;
  };
}

export interface IPayPalCreateOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface IPayPalCaptureOrderResponse {
  id: string;
  status: string;
  purchase_units: Array<{
    reference_id?: string;
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
        final_capture: boolean;
        create_time: string;
        update_time: string;
      }>;
    };
  }>;
  payer?: {
    name: {
      given_name: string;
      surname: string;
    };
    email_address: string;
  };
}

export interface IPayPalWebhookEvent {
  id: string;
  event_type: string;
  resource_type?: string;
  summary?: string;
  resource?: any;
  create_time?: string;
}

export interface ICurrencyConversionResult {
  amount: number;
  from: string;
  to: string;
  rate: number;
  convertedAmount: number;
  timestamp: number;
}

// Wallet interfaces
export interface IWalletFilter {
  ownerId?: any;
  ownerType?: string;
  status?: string;
}

export interface IWalletUpdateData {
  balance?: number;
  status?: string;
  totalDeposited?: number;
  totalWithdrawn?: number;
  totalSpent?: number;
  lastTransactionAt?: Date;
}

export interface IWalletTransactionFilter {
  walletId?: any;
  ownerId?: any;
  ownerType?: string;
  type?: string;
  status?: string;
  referenceId?: string;
  referenceType?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface IWalletTransactionSortOptions {
  [key: string]: 1 | -1;
}

export interface IDepositData {
  amount: number;
  description?: string;
  referenceId?: string;
  referenceType?: string;
  metadata?: any;
}

export interface IWithdrawData {
  amount: number;
  description?: string;
  referenceId?: string;
  referenceType?: string;
  metadata?: any;
}

export interface IPurchaseData {
  amount: number;
  description?: string;
  orderId: string;
  metadata?: any;
}
