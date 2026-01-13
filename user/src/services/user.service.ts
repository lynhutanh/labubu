import { APIRequest } from "./api-request";

export interface User {
  _id: string;
  username: string;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  wallet?: {
    balance: number;
    currency: string;
    status: string;
  };
}

export interface UpdateUserPayload {
  username?: string;
  name?: string;
  phone?: string;
  address?: string;
  avatar?: string;
}

export class UserService extends APIRequest {
  public async getProfile(): Promise<User> {
    const response = await this.get("/users/me");
    return response.data?.data || response.data;
  }

  public async updateProfile(payload: UpdateUserPayload): Promise<User> {
    const response = await this.put("/users/me", payload);
    return response.data?.data || response.data;
  }
}

export const userService = new UserService();
