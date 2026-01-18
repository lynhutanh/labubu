import { Connection } from "mongoose";
import { AddressSchema } from "../schemas/address.schema";
import { MONGO_DB_PROVIDER } from "src/kernel";

export const ADDRESS_MODEL_PROVIDER = "ADDRESS_MODEL_PROVIDER";

export const addressProviders = [
  {
    provide: ADDRESS_MODEL_PROVIDER,
    useFactory: (connection: Connection) =>
      connection.model("Address", AddressSchema),
    inject: [MONGO_DB_PROVIDER],
  },
];
