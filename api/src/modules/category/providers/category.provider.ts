import { Connection } from "mongoose";
import { MONGO_DB_PROVIDER } from "src/kernel";
import { categorySchema } from "../schemas";

export const CATEGORY_PROVIDER = "CATEGORY";

export const categoryProviders = [
  {
    provide: CATEGORY_PROVIDER,
    useFactory: (connection: Connection) =>
      connection.model("category", categorySchema),
    inject: [MONGO_DB_PROVIDER],
  },
];
