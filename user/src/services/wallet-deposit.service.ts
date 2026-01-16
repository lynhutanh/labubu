import { APIRequest } from "./api-request";

export interface DepositPayload {
  amount: number;
  description?: string;
}

export interface PayPalDepositResponse {
  paypalOrderId: string;
  approvalUrl: string;
  amount: number;
}

export interface SePayDepositResponse {
  paymentRef: string;
  qrUrl: string;
  amount: number;
  expiredAt: string;
}

export class WalletDepositService extends APIRequest {
  public async createPayPalDeposit(payload: DepositPayload): Promise<PayPalDepositResponse> {
    const response = await this.post("/wallet/deposit/paypal/create", payload);
    return response.data?.data || response.data;
  }

  public async createSePayDeposit(payload: DepositPayload): Promise<SePayDepositResponse> {
    const response = await this.post("/wallet/deposit/sepay/create", payload);
    return response.data?.data || response.data;
  }
}

export const walletDepositService = new WalletDepositService();
