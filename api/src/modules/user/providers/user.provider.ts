import { Connection } from "mongoose";
import { UserSchema } from "../schemas/user.schema";
import { MONGO_DB_PROVIDER } from "src/kernel";

export const USER_MODEL_PROVIDER = "USER_MODEL_PROVIDER";

export const userProviders = [
  {
    provide: USER_MODEL_PROVIDER,
    useFactory: (connection: Connection) =>
      connection.model("User", UserSchema),
    inject: [MONGO_DB_PROVIDER],
  },
];

