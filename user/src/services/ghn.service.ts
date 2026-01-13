import { APIRequest } from "./api-request";

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
    async getProvinces(): Promise<GhnProvince[]> {
        const response = await this.get("/ghn/provinces");
        if (Array.isArray(response?.data)) {
            return response.data;
        }
        if (Array.isArray(response)) {
            return response;
        }
        return [];
    }

    async getDistricts(provinceId: number): Promise<GhnDistrict[]> {
        const response = await this.post("/ghn/districts", {
            province_id: provinceId,
        });
        if (Array.isArray(response?.data)) {
            return response.data;
        }
        if (Array.isArray(response)) {
            return response;
        }
        return [];
    }

    async getWards(districtId: number): Promise<GhnWard[]> {
        const response = await this.get(
            `/ghn/wards?district_id=${encodeURIComponent(districtId)}`,
        );
        if (Array.isArray(response?.data)) {
            return response.data;
        }
        if (Array.isArray(response)) {
            return response;
        }
        return [];
    }
}

export const ghnService = new GhnService();

