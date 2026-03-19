import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { spinConfigSchema } from '../schemas';
import { spinResultSchema } from '../schemas';

export const SPIN_CONFIG_PROVIDER = 'SPIN_CONFIG';
export const SPIN_RESULT_PROVIDER = 'SPIN_RESULT';

export const spinProviders = [
  {
    provide: SPIN_CONFIG_PROVIDER,
    useFactory: (connection: Connection) =>
      connection.model('spinconfig', spinConfigSchema),
    inject: [MONGO_DB_PROVIDER],
  },
  {
    provide: SPIN_RESULT_PROVIDER,
    useFactory: (connection: Connection) =>
      connection.model('spinresult', spinResultSchema),
    inject: [MONGO_DB_PROVIDER],
  },
];
