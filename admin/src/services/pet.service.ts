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

  public async getUserPetPoints(userId: string): Promise<{ totalPoints: number; orderPoints: number; bonusPetPoints: number }> {
    const response = await this.get(`/admin/pet/user-points/${userId}`);
    return response.data;
  }
}

export const petService = new PetService();
