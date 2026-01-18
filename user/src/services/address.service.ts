import { APIRequest } from "./api-request";

export interface Address {
  _id: string;
  userId: string;
  fullName: string;
  phone: string;
  address: string;
  ward?: string;
  wardCode?: string;
  district?: string;
  districtId?: number;
  city: string;
  provinceId?: number;
  isDefault: boolean;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressPayload {
  fullName: string;
  phone: string;
  address: string;
  ward?: string;
  wardCode?: string;
  district?: string;
  districtId?: number;
  city: string;
  provinceId?: number;
  isDefault?: boolean;
  note?: string;
}

export interface UpdateAddressPayload {
  fullName?: string;
  phone?: string;
  address?: string;
  ward?: string;
  wardCode?: string;
  district?: string;
  districtId?: number;
  city?: string;
  provinceId?: number;
  isDefault?: boolean;
  note?: string;
}

class AddressService extends APIRequest {
  async getAddresses(): Promise<Address[]> {
    const response = await this.get("/addresses");
    if (Array.isArray(response?.data)) {
      return response.data;
    }
    if (Array.isArray(response)) {
      return response;
    }
    return [];
  }

  async getAddressById(id: string): Promise<Address> {
    const response = await this.get(`/addresses/${id}`);
    return response?.data || response;
  }

  async createAddress(payload: CreateAddressPayload): Promise<Address> {
    const response = await this.post("/addresses", payload);
    return response?.data || response;
  }

  async updateAddress(
    id: string,
    payload: UpdateAddressPayload,
  ): Promise<Address> {
    const response = await this.put(`/addresses/${id}`, payload);
    return response?.data || response;
  }

  async deleteAddress(id: string): Promise<void> {
    await this.del(`/addresses/${id}`);
  }

  async setDefaultAddress(id: string): Promise<Address> {
    const response = await this.put(`/addresses/${id}/default`);
    return response?.data || response;
  }
}

export const addressService = new AddressService();
