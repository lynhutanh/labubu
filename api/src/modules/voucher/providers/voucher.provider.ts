import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { voucherSchema } from '../schemas';

export const VOUCHER_PROVIDER = 'VOUCHER';

export const voucherProviders = [
  {
    provide: VOUCHER_PROVIDER,
    useFactory: (connection: Connection) =>
      connection.model('voucher', voucherSchema),
    inject: [MONGO_DB_PROVIDER],
  },
];
