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
}

export const petService = new PetService();
