import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { RankSchema } from '../schemas/rank.schema';

export const RANK_MODEL_PROVIDER = 'RANK_MODEL_PROVIDER';

export const rankProviders = [
    {
        provide: RANK_MODEL_PROVIDER,
        useFactory: (connection: Connection) => connection.model('Rank', RankSchema),
        inject: [MONGO_DB_PROVIDER],
    },
];
