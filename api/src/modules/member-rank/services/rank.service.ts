import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { RANK_MODEL_PROVIDER } from '../providers/rank.provider';
import { RankModel } from '../models/rank.model';
import { USER_MODEL_PROVIDER } from '../../user/providers';
import { UserModel } from '../../user/models';

@Injectable()
export class RankService {
    constructor(
        @Inject(RANK_MODEL_PROVIDER)
        private readonly rankModel: Model<RankModel>,
        @Inject(USER_MODEL_PROVIDER)
        private readonly userModel: Model<UserModel>,
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
        const saved = await rank.save();
        this.syncAllUsers();
        return saved;
    }

    async update(id: string, data: any): Promise<any> {
        const updated = await this.rankModel.findByIdAndUpdate(id, { $set: data }, { new: true });
        this.syncAllUsers();
        return updated;
    }

    async delete(id: string): Promise<any> {
        const deleted = await this.rankModel.findByIdAndDelete(id);
        this.syncAllUsers();
        return deleted;
    }

    async findByKey(key: string): Promise<any> {
        return this.rankModel.findOne({ key }).lean();
    }

    async syncAllUsers(): Promise<void> {
        try {
            const ranks = await this.rankModel.find().sort({ threshold: 1 }).lean();
            if (ranks.length === 0) return;

            const users = await this.userModel.find({});
            for (const user of users) {
                const totalSpent = user.totalSpent || 0;
                let currentRank = ranks[0];
                for (let i = ranks.length - 1; i >= 0; i--) {
                    if (totalSpent >= ranks[i].threshold) {
                        currentRank = ranks[i];
                        break;
                    }
                }

                if (user.rank !== currentRank.key) {
                    await this.userModel.updateOne(
                        { _id: user._id },
                        { $set: { rank: currentRank.key } }
                    );
                }
            }
        } catch (error) {
            console.error('syncAllUsers error:', error);
        }
    }
}
