import { APIRequest } from "./api-request";

export interface SpinSlot {
  label: string;
  image: string;
  rate: number;
  type: "prize" | "lose" | "extra_turn";
}

export interface SpinConfig {
  _id: string;
  name: string;
  slots: SpinSlot[];
  startDate: string;
  endDate: string;
  minSpentAmount: number;
  maxSpinsPerUser: number;
  status: string;
}

export interface SpinTurns {
  totalTurns: number;
  usedTurns: number;
  remainingTurns: number;
}

export interface SpinResult {
  _id: string;
  configId: string;
  slotIndex: number;
  slotLabel: string;
  slotImage: string;
  type: "prize" | "lose" | "extra_turn";
  fullName: string;
  phone: string;
  email: string;
  address: string;
  deliveryStatus: string;
  createdAt: string;
}

export class SpinService extends APIRequest {
  public async getActiveConfig(): Promise<SpinConfig | null> {
    const response = await this.get("/spin/active");
    return response.data?.data || response.data;
  }

  public async play(configId: string): Promise<SpinResult> {
    const response = await this.post(`/spin/play/${configId}`, {});
    return response.data?.data || response.data;
  }

  public async getSpinTurns(configId: string): Promise<SpinTurns> {
    const response = await this.get(`/spin/turns/${configId}`);
    return response.data?.data || response.data;
  }

  public async getResultsByIds(ids: string[]): Promise<SpinResult[]> {
    const response = await this.post("/spin/results/by-ids", { ids });
    return response.data?.data || response.data || [];
  }

  public async submitInfo(
    resultId: string,
    data: {
      fullName: string;
      phone: string;
      email: string;
      address: string;
    },
  ): Promise<SpinResult> {
    const response = await this.put(`/spin/results/${resultId}/info`, data);
    return response.data?.data || response.data;
  }
}

export const spinService = new SpinService();
