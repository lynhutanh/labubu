import { APIRequest } from "./api-request";

export interface SpinSlot {
  label: string;
  image: string;
  rate: number;
  type: "prize" | "lose" | "extra_turn";
}

export interface SpinConfigResponse {
  _id: string;
  name: string;
  slots: SpinSlot[];
  startDate: string;
  endDate: string;
  minSpentAmount: number;
  maxSpinsPerUser: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface SpinResultResponse {
  _id: string;
  configId: string;
  buyerPhone: string;
  slotIndex: number;
  slotLabel: string;
  slotImage: string;
  type: "prize" | "lose" | "extra_turn";
  fullName: string;
  phone: string;
  email: string;
  address: string;
  deliveryStatus: "pending" | "shipped" | "delivered";
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface SpinResultSearchParams {
  keyword?: string;
  type?: string;
  deliveryStatus?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface SpinResultSearchResponse {
  results: SpinResultResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateSpinConfigPayload {
  name: string;
  slots: SpinSlot[];
  startDate: string;
  endDate: string;
  minSpentAmount: number;
  maxSpinsPerUser?: number;
  status?: string;
}

export interface UpdateSpinConfigPayload extends Partial<CreateSpinConfigPayload> {}

class SpinService extends APIRequest {
  public async getConfigs(): Promise<SpinConfigResponse[]> {
    const response = await this.get("/admin/spin/configs");
    return response.data;
  }

  public async getConfigById(id: string): Promise<SpinConfigResponse> {
    const response = await this.get(`/admin/spin/configs/${id}`);
    return response.data;
  }

  public async createConfig(data: CreateSpinConfigPayload): Promise<SpinConfigResponse> {
    const response = await this.post("/admin/spin/configs", data);
    return response.data;
  }

  public async updateConfig(id: string, data: UpdateSpinConfigPayload): Promise<SpinConfigResponse> {
    const response = await this.put(`/admin/spin/configs/${id}`, data);
    return response.data;
  }

  public async deleteConfig(id: string): Promise<void> {
    await this.del(`/admin/spin/configs/${id}`);
  }

  public async searchResults(params?: SpinResultSearchParams): Promise<SpinResultSearchResponse> {
    const url = this.buildUrl("/admin/spin/results", params);
    const response = await this.get(url);
    return response.data;
  }

  public async updateDeliveryStatus(id: string, deliveryStatus: string, note?: string): Promise<SpinResultResponse> {
    const response = await this.put(`/admin/spin/results/${id}/delivery`, { deliveryStatus, note });
    return response.data;
  }
}

export const spinService = new SpinService();
