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
        const root = response.data || response;
        const ghn = root.data || root;
        return ghn.data || [];
    }

    async getDistricts(provinceId: number): Promise<GhnDistrict[]> {
        const response = await this.post("/ghn/districts", {
            province_id: provinceId,
        });
        const root = response.data || response;
        const ghn = root.data || root;
        return ghn.data || [];
    }

    async getWards(districtId: number): Promise<GhnWard[]> {
        const response = await this.get(
            `/ghn/wards?district_id=${encodeURIComponent(districtId)}`,
        );
        const root = response.data || response;
        const ghn = root.data || root;
        return ghn.data || [];
    }
}

export const ghnService = new GhnService();

