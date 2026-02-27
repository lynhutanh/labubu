import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { RANK_MODEL_PROVIDER } from '../providers/rank.provider';
import { RankModel } from '../models/rank.model';

@Injectable()
export class RankService {
    constructor(
        @Inject(RANK_MODEL_PROVIDER)
        private readonly rankModel: Model<RankModel>,
    ) { }

    async search(): Promise<{ data: any[]; total: number }> {
        const [data, total] = await Promise.all([
            this.rankModel.find().sort({ threshold: 1 }).lean(),
            this.rankModel.countDocuments(),
        ]);
        return { data, total };
    }

    async getById(id: string): Promise<any> {
        return this.rankModel.findById(id).lean();
    }

    async create(data: any): Promise<any> {
        const rank = new this.rankModel(data);
        return rank.save();
    }

    async update(id: string, data: any): Promise<any> {
        return this.rankModel.findByIdAndUpdate(id, { $set: data }, { new: true });
    }

    async delete(id: string): Promise<any> {
        return this.rankModel.findByIdAndDelete(id);
    }

    async findByKey(key: string): Promise<any> {
        return this.rankModel.findOne({ key }).lean();
    }
}
