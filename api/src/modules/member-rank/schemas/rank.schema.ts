import { Schema } from 'mongoose';

export const RankSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        key: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        threshold: {
            type: Number,
            required: true,
            default: 0,
        },
        rewardVoucherCode: {
            type: String,
            default: '',
        },
        order: {
            type: Number,
            default: 0,
        },
        description: {
            type: String,
            default: '',
        },
        color: {
            type: String,
            default: '#ffffff',
        },
        logoPath: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
        collection: 'ranks',
    }
);
