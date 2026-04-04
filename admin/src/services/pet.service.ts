import { APIRequest } from "./api-request";

export interface PetResponse {
  _id: string;
  name: string;
  description: string;
  backgroundImage: string;
  order: number;
  minPoints: number;
  crackPoints: number;
  maxPoints: number;
  eggImage: string;
  crackImage: string;
  hatchImage: string;
  rewardPoints: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface CreatePetPayload {
  name: string;
  description?: string;
  backgroundImage?: string;
  order: number;
  minPoints: number;
  crackPoints: number;
  maxPoints: number;
  eggImage?: string;
  crackImage?: string;
  hatchImage?: string;
  rewardPoints: number;
  status?: string;
}

export interface UpdatePetPayload extends Partial<CreatePetPayload> {}

export interface PetChestPrize {
  id?: string;
  name: string;
  weight: number;
  image?: string;
  active?: boolean;
}

export interface PetChestConfig {
  enabled: boolean;
  openCostPoints: number;
  prizes: PetChestPrize[];
}

export interface UpdatePetChestConfigPayload {
  enabled?: boolean;
  openCostPoints: number;
  prizes: PetChestPrize[];
}

export type PetChestDeliveryStatus = "pending" | "shipped" | "delivered";

export interface AdminPetChestHistoryItem {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userAddress: string;
  historyId: string;
  prizeId: string;
  prizeName: string;
  prizeImage: string;
  openCostPoints: number;
  deliveryStatus: PetChestDeliveryStatus;
  note: string;
  openedAt: string;
  updatedAt?: string;
}

export interface AdminPetChestHistorySearchParams {
  keyword?: string;
  deliveryStatus?: PetChestDeliveryStatus | "";
  page?: number;
  limit?: number;
}

export interface AdminPetChestHistorySearchResponse {
  results: AdminPetChestHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class PetService extends APIRequest {
  public async getPets(): Promise<PetResponse[]> {
    const response = await this.get("/admin/pet");
    return response.data;
  }

  public async getPetById(id: string): Promise<PetResponse> {
    const response = await this.get(`/admin/pet/${id}`);
    return response.data;
  }

  public async createPet(data: CreatePetPayload): Promise<PetResponse> {
    const response = await this.post("/admin/pet", data);
    return response.data;
  }

  public async updatePet(id: string, data: UpdatePetPayload): Promise<PetResponse> {
    const response = await this.put(`/admin/pet/${id}`, data);
    return response.data;
  }

  public async deletePet(id: string): Promise<void> {
    await this.del(`/admin/pet/${id}`);
  }

  public async getUserPetPoints(userId: string): Promise<{
    totalPoints: number;
    orderPoints: number;
    bonusPetPoints: number;
    spentPoints: number;
    availablePoints: number;
  }> {
    const response = await this.get(`/admin/pet/user-points/${userId}`);
    return response.data;
  }

  public async getChestConfig(): Promise<PetChestConfig> {
    const response = await this.get("/admin/pet/chest-config");
    return response.data;
  }

  public async updateChestConfig(
    data: UpdatePetChestConfigPayload,
  ): Promise<PetChestConfig> {
    const response = await this.put("/admin/pet/chest-config", data);
    return response.data;
  }

  public async searchChestHistory(
    params?: AdminPetChestHistorySearchParams,
  ): Promise<AdminPetChestHistorySearchResponse> {
    const url = this.buildUrl("/admin/pet/chest-history", params);
    const response = await this.get(url);
    return response.data;
  }

  public async updateChestHistoryDeliveryStatus(
    userId: string,
    historyId: string,
    data: {
      deliveryStatus: PetChestDeliveryStatus;
      note?: string;
    },
  ): Promise<AdminPetChestHistoryItem> {
    const response = await this.put(
      `/admin/pet/chest-history/${userId}/${historyId}/delivery`,
      data,
    );
    return response.data;
  }
}

export const petService = new PetService();
