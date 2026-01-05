import { Connection } from "mongoose";
import { MONGO_DB_PROVIDER } from "src/kernel";
import { WalletSchema, WalletTransactionSchema } from "../schemas";
import {
  WALLET_MODEL_PROVIDER,
  WALLET_TRANSACTION_MODEL_PROVIDER,
} from "../constants";

export const walletProviders = [
  {
    provide: WALLET_MODEL_PROVIDER,
    useFactory: (connection: Connection) =>
      connection.model("wallet", WalletSchema),
    inject: [MONGO_DB_PROVIDER],
  },
  {
    provide: WALLET_TRANSACTION_MODEL_PROVIDER,
    useFactory: (connection: Connection) =>
      connection.model("wallet_transaction", WalletTransactionSchema),
    inject: [MONGO_DB_PROVIDER],
  },
];
