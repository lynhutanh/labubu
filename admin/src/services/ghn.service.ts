import { APIRequest } from "./api-request";

interface PrintUrlResponse {
  token: string;
  printUrl: string;
  ghnOrderCode?: string;
}

export interface GhnProvince {
  ProvinceID: number;
  ProvinceName: string;
}

export interface GhnDistrict {
  DistrictID: number;
  DistrictName: string;
}

export interface GhnWard {
  WardCode: string;
  WardName: string;
}

class GhnService extends APIRequest {
  async getPrintUrl(orderCode: string): Promise<PrintUrlResponse> {
    const response = await this.get(`/ghn/print-url?orderCode=${encodeURIComponent(orderCode)}`);
    return response.data;
  }

  async getPrintUrlByGhnCode(ghnOrderCode: string): Promise<PrintUrlResponse> {
    const response = await this.get(`/ghn/print-url-by-ghn-code?ghnOrderCode=${encodeURIComponent(ghnOrderCode)}`);
    return response.data;
  }

  async getProvinces(): Promise<GhnProvince[]> {
    const response = await this.get("/ghn/provinces");
    if (Array.isArray((response as any)?.data)) {
      return (response as any).data;
    }
    if (Array.isArray(response as any)) {
      return response as any;
    }
    return [];
  }

  async getDistricts(provinceId: number): Promise<GhnDistrict[]> {
    const response = await this.post("/ghn/districts", { province_id: provinceId });
    if (Array.isArray((response as any)?.data)) {
      return (response as any).data;
    }
    if (Array.isArray(response as any)) {
      return response as any;
    }
    return [];
  }

  async getWards(districtId: number): Promise<GhnWard[]> {
    const response = await this.get(`/ghn/wards?district_id=${encodeURIComponent(districtId)}`);
    if (Array.isArray((response as any)?.data)) {
      return (response as any).data;
    }
    if (Array.isArray(response as any)) {
      return response as any;
    }
    return [];
  }
}

export const ghnService = new GhnService();
