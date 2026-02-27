import { Document } from 'mongoose';

export interface RankModel extends Document {
    name: string;
    key: string;
    threshold: number;
    rewardVoucherCode?: string;
    order: number;
    description?: string;
    color?: string;
    logoPath?: string;
    createdAt: Date;
    updatedAt: Date;
}
