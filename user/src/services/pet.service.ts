import { APIRequest } from "./api-request";

export interface Pet {
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
  status: string;
}

export interface UserPet {
  _id: string;
  userId: string;
  petId: string;
  currentStage: number;
  isCompleted: boolean;
  rewardClaimed: boolean;
  completedAt: string;
  createdAt: string;
}

export interface PetFarmItem {
  userPet: UserPet | null;
  pet: Pet;
}

export interface PetFarm {
  items: PetFarmItem[];
  totalPointsEarned: number;
  availableChestPoints?: number;
  spentChestPoints?: number;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatarUrl: string | null;
  totalPoints: number;
  pet: {
    _id: string;
    name: string;
    hatchImage: string;
  } | null;
}

export interface PetChestPrize {
  id: string;
  name: string;
  rewardPoints: number;
  rewardVnd: number;
  weight: number;
  image: string;
  active: boolean;
}

export interface PetChestConfig {
  enabled: boolean;
  openCostPoints: number;
  prizes: PetChestPrize[];
  totalPointsEarned: number;
  spentChestPoints: number;
  availableChestPoints: number;
}

export interface OpenChestResult {
  openCostPoints: number;
  totalPointsEarned: number;
  spentChestPoints: number;
  remainingChestPoints: number;
  prize: {
    id: string;
    name: string;
    image?: string;
    rewardPoints: number;
    rewardVnd: number;
  };
}

export interface PetChestHistoryItem {
  prizeId: string;
  prizeName: string;
  prizeImage: string;
  rewardPoints: number;
  rewardVnd: number;
  openCostPoints: number;
  openedAt: string;
}

export interface PetChestHistoryResponse {
  items: PetChestHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class PetService extends APIRequest {
  public async getFarm(): Promise<PetFarm> {
    const response = await this.get("/pet/farm");
    return response.data;
  }

  public async getPoints(): Promise<{ totalPointsEarned: number }> {
    const response = await this.get("/pet/points");
    return response.data;
  }

  public async claimReward(userPetId: string): Promise<{ rewardPoints: number; rewardVnd: number }> {
    const response = await this.post(`/pet/claim/${userPetId}`, {});
    return response.data;
  }

  public async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const response = await this.get("/pet/leaderboard");
    return response.data;
  }

  public async getChestConfig(): Promise<PetChestConfig> {
    const response = await this.get("/pet/chest-config");
    return response.data;
  }

  public async openChest(): Promise<OpenChestResult> {
    const response = await this.post("/pet/chest/open", {});
    return response.data;
  }

  public async getChestHistory(
    page = 1,
    limit = 5,
  ): Promise<PetChestHistoryResponse> {
    const url = this.buildUrl("/pet/chest/history", { page, limit });
    const response = await this.get(url);
    return response.data;
  }
}

export const petService = new PetService();
