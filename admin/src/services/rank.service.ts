import { APIRequest } from './api-request';

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

class RankService extends APIRequest {
    public async search(): Promise<{ data: Rank[]; total: number }> {
        const response = await this.get('/admin/ranks');
        return response.data || { data: [], total: 0 };
    }

    public async create(data: Partial<Rank>): Promise<Rank> {
        const response = await this.post('/admin/ranks', data);
        return response.data;
    }

    public async update(id: string, data: Partial<Rank>): Promise<Rank> {
        const response = await this.put(`/admin/ranks/${id}`, data);
        return response.data;
    }

    public async delete(id: string): Promise<void> {
        await this.del(`/admin/ranks/${id}`);
    }
}

export const rankService = new RankService();
