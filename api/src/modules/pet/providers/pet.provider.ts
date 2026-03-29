import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { petSchema } from '../schemas';
import { userPetSchema } from '../schemas';

export const PET_PROVIDER = 'PET';
export const USER_PET_PROVIDER = 'USER_PET';

export const petProviders = [
  {
    provide: PET_PROVIDER,
    useFactory: (connection: Connection) =>
      connection.model('pet', petSchema),
    inject: [MONGO_DB_PROVIDER],
  },
  {
    provide: USER_PET_PROVIDER,
    useFactory: (connection: Connection) =>
      connection.model('userpet', userPetSchema),
    inject: [MONGO_DB_PROVIDER],
  },
];
