import { Connection } from "mongoose";
import { MONGO_DB_PROVIDER } from "src/kernel";
import { brandSchema } from "../schemas";
import { BRAND_PROVIDER } from "../constants";

export const brandProviders = [
  {
    provide: BRAND_PROVIDER,
    useFactory: (connection: Connection) =>
      connection.model("brands", brandSchema),
    inject: [MONGO_DB_PROVIDER],
  },
];
