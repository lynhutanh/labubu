import { APIRequest } from "./api-request";

export interface WalletBalance {
  balance: number;
  currency: string;
  status: string;
}

export interface WalletTransaction {
  _id: string;
  type: string;
  amount: number;
  balance: number;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletTransactionsResponse {
  transactions: WalletTransaction[];
  total: number;
  limit: number;
  offset: number;
}

export interface DepositPayload {
  amount: number;
  description?: string;
}

export interface WalletTransactionParams {
  type?: string;
  status?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export class WalletService extends APIRequest {
  public async getBalance(): Promise<WalletBalance> {
    const response = await this.get("/wallet/balance");
    return response.data?.data || response.data;
  }

  public async getStats(): Promise<any> {
    const response = await this.get("/wallet/stats");
    return response.data?.data || response.data;
  }

  public async deposit(payload: DepositPayload): Promise<any> {
    const response = await this.post("/wallet/deposit", payload);
    return response.data?.data || response.data;
  }

  public async withdraw(payload: { amount: number; description?: string; bankAccount?: string; bankName?: string; accountHolderName?: string }): Promise<any> {
    const response = await this.post("/wallet/withdraw", payload);
    return response.data?.data || response.data;
  }

  public async getTransactions(params?: WalletTransactionParams): Promise<WalletTransactionsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append("type", params.type);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
    
    const queryString = queryParams.toString();
    const url = `/wallet/transactions${queryString ? `?${queryString}` : ""}`;
    const response = await this.get(url);
    return response.data?.data || response.data;
  }

  public async getRecentTransactions(limit?: number): Promise<WalletTransaction[]> {
    const url = `/wallet/transactions/recent${limit ? `?limit=${limit}` : ""}`;
    const response = await this.get(url);
    return response.data?.data || response.data;
  }

  public async getTransactionStats(startDate?: string, endDate?: string): Promise<any> {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    
    const queryString = queryParams.toString();
    const url = `/wallet/transactions/stats${queryString ? `?${queryString}` : ""}`;
    const response = await this.get(url);
    return response.data?.data || response.data;
  }
}

export const walletService = new WalletService();
