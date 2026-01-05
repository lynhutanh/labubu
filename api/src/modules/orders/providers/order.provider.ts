import { Connection } from "mongoose";
import { MONGO_DB_PROVIDER } from "src/kernel";
import { OrderSchema } from "../schemas";
import { ORDER_PROVIDER } from "../constants";

export const orderProviders = [
  {
    provide: ORDER_PROVIDER,
    useFactory: (connection: Connection) =>
      connection.model("order", OrderSchema),
    inject: [MONGO_DB_PROVIDER],
  },
];
