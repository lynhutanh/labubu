import { Connection } from "mongoose";
import { MONGO_DB_PROVIDER } from "src/kernel";
import { RefundRequestSchema } from "../schemas";
import { REFUND_REQUEST_PROVIDER } from "../constants";

export const refundRequestProviders = [
  {
    provide: REFUND_REQUEST_PROVIDER,
    useFactory: (connection: Connection) =>
      connection.model("refundrequest", RefundRequestSchema),
    inject: [MONGO_DB_PROVIDER],
  },
];
