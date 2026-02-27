import { APIRequest } from "./api-request";

export interface Rank {
    _id: string;
    name: string;
    key: string;
    threshold: number;
    rewardVoucherCode?: string;
    order: number;
    description?: string;
    color?: string;
}

export class RankService extends APIRequest {
    public async getRanks(): Promise<Rank[]> {
        const response = await this.get("/ranks");
        // Nested data from DataResponse.ok({ data: [], total: 0 })
        return response.data?.data || [];
    }
}

export const rankService = new RankService();
