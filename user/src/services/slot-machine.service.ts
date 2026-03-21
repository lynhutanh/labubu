import { APIRequest } from "./api-request";

export interface SlotMachineSymbol {
  label: string;
  image: string;
}

export interface SlotMachinePrize {
  label: string;
  image: string;
}

export interface SlotMachineConfig {
  _id: string;
  name: string;
  symbols: SlotMachineSymbol[];
  prizes: SlotMachinePrize[];
  winRate: number;
  startDate: string;
  endDate: string;
  minSpentAmount: number;
  maxSpinsPerUser: number;
  status: string;
}

export interface SlotMachineTurns {
  totalTurns: number;
  usedTurns: number;
  remainingTurns: number;
}

export interface SlotMachineResult {
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
  deliveryStatus: string;
  createdAt: string;
}

export class SlotMachineService extends APIRequest {
  public async getActiveConfig(): Promise<SlotMachineConfig | null> {
    const response = await this.get("/slot-machine/active");
    return response.data?.data || response.data;
  }

  public async play(configId: string): Promise<SlotMachineResult> {
    const response = await this.post(`/slot-machine/play/${configId}`, {});
    return response.data?.data || response.data;
  }

  public async getSlotTurns(configId: string): Promise<SlotMachineTurns> {
    const response = await this.get(`/slot-machine/turns/${configId}`);
    return response.data?.data || response.data;
  }

  public async getResultsByIds(ids: string[]): Promise<SlotMachineResult[]> {
    const response = await this.post("/slot-machine/results/by-ids", { ids });
    return response.data?.data || response.data || [];
  }

  public async getMyResults(): Promise<SlotMachineResult[]> {
    const response = await this.get("/slot-machine/my-results");
    return response.data?.data || response.data || [];
  }

  public async submitInfo(
    resultId: string,
    data: { fullName: string; phone: string; email: string; address: string },
  ): Promise<SlotMachineResult> {
    const response = await this.put(`/slot-machine/results/${resultId}/info`, data);
    return response.data?.data || response.data;
  }
}

export const slotMachineService = new SlotMachineService();
