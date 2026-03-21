import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { slotMachineConfigSchema } from '../schemas';
import { slotMachineResultSchema } from '../schemas';

export const SLOT_MACHINE_CONFIG_PROVIDER = 'SLOT_MACHINE_CONFIG';
export const SLOT_MACHINE_RESULT_PROVIDER = 'SLOT_MACHINE_RESULT';

export const slotMachineProviders = [
  {
    provide: SLOT_MACHINE_CONFIG_PROVIDER,
    useFactory: (connection: Connection) =>
      connection.model('slotmachineconfig', slotMachineConfigSchema),
    inject: [MONGO_DB_PROVIDER],
  },
  {
    provide: SLOT_MACHINE_RESULT_PROVIDER,
    useFactory: (connection: Connection) =>
      connection.model('slotmachineresult', slotMachineResultSchema),
    inject: [MONGO_DB_PROVIDER],
  },
];
