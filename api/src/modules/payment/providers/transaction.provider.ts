import { Connection } from "mongoose";
import { MONGO_DB_PROVIDER } from "src/kernel";
import { TransactionSchema } from "../schemas";

export const TRANSACTION_MODEL_PROVIDER = "TRANSACTION_MODEL_PROVIDER";

export const transactionProviders = [
  {
    provide: TRANSACTION_MODEL_PROVIDER,
    useFactory: (connection: Connection) =>
      connection.model("transaction", TransactionSchema),
    inject: [MONGO_DB_PROVIDER],
  },
];
