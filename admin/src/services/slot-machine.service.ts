import { APIRequest } from "./api-request";

export interface SlotMachineSymbol {
  label: string;
  image: string;
}

export interface SlotMachinePrize {
  label: string;
  image: string;
}

export interface SlotMachineConfigResponse {
  _id: string;
  name: string;
  symbols: SlotMachineSymbol[];
  prizes: SlotMachinePrize[];
  winRate: number;
  startDate: string;
  endDate: string;
  minSpentAmount: number;
  maxSpinsPerUser: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface SlotMachineResultResponse {
  _id: string;
  configId: string;
  reels: number[];
  type: "prize" | "lose";
  prizeLabel: string;
  prizeImage: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  deliveryStatus: "pending" | "shipped" | "delivered";
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface SlotMachineResultSearchParams {
  keyword?: string;
  type?: string;
  deliveryStatus?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface SlotMachineResultSearchResponse {
  results: SlotMachineResultResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateSlotMachineConfigPayload {
  name: string;
  symbols: SlotMachineSymbol[];
  prizes: SlotMachinePrize[];
  winRate: number;
  startDate: string;
  endDate: string;
  minSpentAmount: number;
  maxSpinsPerUser?: number;
  status?: string;
}

export interface UpdateSlotMachineConfigPayload extends Partial<CreateSlotMachineConfigPayload> {}

class SlotMachineService extends APIRequest {
  public async getConfigs(): Promise<SlotMachineConfigResponse[]> {
    const response = await this.get("/admin/slot-machine/configs");
    return response.data;
  }

  public async getConfigById(id: string): Promise<SlotMachineConfigResponse> {
    const response = await this.get(`/admin/slot-machine/configs/${id}`);
    return response.data;
  }

  public async createConfig(data: CreateSlotMachineConfigPayload): Promise<SlotMachineConfigResponse> {
    const response = await this.post("/admin/slot-machine/configs", data);
    return response.data;
  }

  public async updateConfig(id: string, data: UpdateSlotMachineConfigPayload): Promise<SlotMachineConfigResponse> {
    const response = await this.put(`/admin/slot-machine/configs/${id}`, data);
    return response.data;
  }

  public async deleteConfig(id: string): Promise<void> {
    await this.del(`/admin/slot-machine/configs/${id}`);
  }

  public async searchResults(params?: SlotMachineResultSearchParams): Promise<SlotMachineResultSearchResponse> {
    const url = this.buildUrl("/admin/slot-machine/results", params);
    const response = await this.get(url);
    return response.data;
  }

  public async updateDeliveryStatus(id: string, deliveryStatus: string, note?: string): Promise<SlotMachineResultResponse> {
    const response = await this.put(`/admin/slot-machine/results/${id}/delivery`, { deliveryStatus, note });
    return response.data;
  }
}

export const slotMachineService = new SlotMachineService();
