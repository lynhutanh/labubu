import { Connection } from "mongoose";
import { MessageSchema } from "../schemas/message.schema";
import { MONGO_DB_PROVIDER } from "src/kernel";

export const MESSAGE_MODEL_PROVIDER = "MESSAGE_MODEL_PROVIDER";

export const messageProviders = [
  {
    provide: MESSAGE_MODEL_PROVIDER,
    useFactory: (connection: Connection) =>
      connection.model("Message", MessageSchema),
    inject: [MONGO_DB_PROVIDER],
  },
];
